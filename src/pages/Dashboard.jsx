import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { get, post } from "../services/api";
import { Calendar, RefreshCcw, Loader, Play, Square, AlertCircle, Clock, TrendingUp, Activity } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [timeRange, setTimeRange] = useState("24h"); // 24h, 7d, 30d

  // Colors for chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const fetchStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
        setStatusMessage({ type: "info", text: "Refreshing dashboard data..." });
      }
      
      const response = await get(`/api/stats?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();
      setStats(data);
      setError(null);
      
      if (showRefreshing) {
        setStatusMessage({ type: "success", text: "Dashboard data refreshed successfully" });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
      
      if (showRefreshing) {
        setStatusMessage({ type: "error", text: `Error refreshing data: ${err.message}` });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats(true);
  };

  const toggleScraper = async () => {
    try {
      setStatusMessage({ type: "info", text: "Updating scraper status..." });
      
      const endpoint = stats?.scraperStatus?.isRunning ? "stop" : "start";
      const res = await post(`/api/scraper/${endpoint}`, { action: endpoint });

      if (!res.ok) throw new Error("Failed to toggle scraper");
      
      // Update the local state
      setStats(prevStats => ({
        ...prevStats,
        scraperStatus: {
          ...prevStats.scraperStatus,
          isRunning: !prevStats.scraperStatus.isRunning
        }
      }));
      
      setStatusMessage({ 
        type: "success", 
        text: `Scraper ${stats?.scraperStatus?.isRunning ? "stopped" : "started"} successfully` 
      });
      
      setTimeout(() => setStatusMessage(null), 3000);
      
      // Refresh the dashboard data
      setTimeout(() => fetchStats(), 1000);
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage({ type: "error", text: error.message });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up automatic refresh every 30 seconds
    const interval = setInterval(() => fetchStats(), 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Helper for truncating text
  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex flex-col">
          <h3 className="text-red-800 font-medium mb-2">Error loading dashboard</h3>
          <p className="text-sm text-red-700 mb-4">
            {error}
          </p>
          <button 
            onClick={handleRefresh}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 self-start flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const chartData =
    stats?.eventsWithChanges
      ?.map((event) => ({
        name: truncateText(event.title, 15),
        tickets: event.availableSeats,
        timestamp: new Date(event.lastUpdated).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp) || [];
      
  // Create data for the ticket distribution pie chart
  const ticketDistributionData = stats?.eventsWithChanges?.map(event => ({
    name: truncateText(event.title, 10),
    value: event.availableSeats
  })) || [];
  
  // Calculate event status distribution for pie chart
  const eventStatusData = [
    { name: "Active", value: stats?.activeEvents || 0 },
    { name: "Inactive", value: (stats?.totalEvents || 0) - (stats?.activeEvents || 0) }
  ];

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div 
          className={`p-4 rounded-lg shadow-md flex justify-between items-center ${
            statusMessage.type === "error" 
              ? "bg-red-50 text-red-700" 
              : statusMessage.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          <p>{statusMessage.text}</p>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Header with dashboard title and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tracking Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring of ticket availability and scraper status
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setTimeRange("24h")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                timeRange === "24h"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              24h
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                timeRange === "7d"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                timeRange === "30d"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              30d
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Refresh data"
          >
            <RefreshCcw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key metrics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Total Events</h2>
              <p className="text-gray-500 text-sm">Active events being tracked</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalEvents || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className="flex items-center text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.newEventsCount || 0} new
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">
              <Clock className="h-3 w-3 mr-1 inline" />
              Last 24h
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Total Errors</h2>
              <p className="text-gray-500 text-sm">Errors across all events</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalErrors || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className={`flex items-center ${stats?.errorRate > stats?.previousErrorRate ? 'text-red-500' : 'text-green-500'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats?.errorRate > stats?.previousErrorRate ? '+' : '-'}
              {((stats?.errorRate || 0) * 100).toFixed(1)}% rate
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">
              <Clock className="h-3 w-3 mr-1 inline" />
              Last 24h
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Scraper Status
              </h2>
              <p className="text-gray-500 text-sm">Current status and metrics</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stats?.scraperStatus?.isRunning
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {stats?.scraperStatus?.isRunning ? "Running" : "Stopped"}
                </span>
                <button
                  onClick={toggleScraper}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    stats?.scraperStatus?.isRunning
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {stats?.scraperStatus?.isRunning ? (
                    <>
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Success:</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-600">
                  {stats?.scraperStatus?.successCount || 0}
                </span>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (stats?.scraperStatus?.successCount / (stats?.scraperStatus?.successCount + stats?.scraperStatus?.failedCount || 1)) * 100)}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Failed:</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-red-600">
                  {stats?.scraperStatus?.failedCount || 0}
                </span>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (stats?.scraperStatus?.failedCount / (stats?.scraperStatus?.successCount + stats?.scraperStatus?.failedCount || 1)) * 100)}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Availability Trend */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Ticket Availability Trend
            </h2>
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {timeRange === "24h" ? "Last 24 Hours" : timeRange === "7d" ? "Last 7 Days" : "Last 30 Days"}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  interval={0} 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    border: "none"
                  }}
                  itemStyle={{ color: "#2563eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  name="Available Tickets"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ strokeWidth: 3, r: 4, fill: "white" }}
                  activeDot={{ r: 8, stroke: "#2563eb", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Ticket Distribution
          </h2>
          {ticketDistributionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {ticketDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tickets`, "Available"]}
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "6px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      border: "none"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No ticket data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Events and Errors Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Events with Changes
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {stats?.eventsWithChanges?.length || 0} events
            </span>
          </div>
          {stats?.eventsWithChanges?.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 styled-scrollbar">
              {stats?.eventsWithChanges?.map((event) => (
                <div key={event._id} className="border-b pb-3 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">{truncateText(event.title, 25)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${event.ticketChange > 0 ? 'bg-green-100 text-green-800' : event.ticketChange < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {event.ticketChange > 0 ? '+' : ''}{event.ticketChange || '0'} tickets
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.lastUpdated).toLocaleString()}
                    </span>
                    <span className="font-medium text-blue-600">
                      {event.availableSeats} seats
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">No recent changes detected</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Errors
            </h2>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {stats?.recentErrors?.length || 0} errors
            </span>
          </div>
          {stats?.recentErrors?.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 styled-scrollbar">
              {stats?.recentErrors?.map((error) => (
                <div key={error._id} className="border-b pb-3 last:border-0 hover:bg-red-50 p-2 rounded transition-colors">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">{truncateText(error.message, 60)}</p>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-gray-500">
                          {new Date(error.createdAt).toLocaleString()}
                        </span>
                        <a 
                          href={error.eventUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Event →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">No recent errors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Add CSS for tooltip and scrollbars
const style = document.createElement('style');
style.textContent = `
  .styled-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .styled-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .styled-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  .styled-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;
document.head.appendChild(style);
