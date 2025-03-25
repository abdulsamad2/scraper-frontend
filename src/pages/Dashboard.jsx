import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const base_url = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data } = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const chartData =
    stats?.eventsWithChanges
      ?.map((event) => ({
        name: event.title,
        tickets: event.availableSeats,
        timestamp: new Date(event.lastUpdated).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Total Events</h2>
          <p className="text-gray-500 text-sm">Active events being tracked</p>
          <p className="text-3xl font-bold mt-2">{stats?.totalEvents || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Total Errors</h2>
          <p className="text-gray-500 text-sm">Errors across all events</p>
          <p className="text-3xl font-bold mt-2">{stats?.totalErrors || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Scraper Status
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-medium ${
                  stats?.scraperStatus?.isRunning
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats?.scraperStatus?.isRunning ? "Running" : "Stopped"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Count:</span>
              <span className="font-medium">
                {stats?.scraperStatus?.successCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed Count:</span>
              <span className="font-medium">
                {stats?.scraperStatus?.failedCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Events with Changes
          </h2>
          <div className="space-y-3">
            {stats?.eventsWithChanges?.map((event) => (
              <div key={event._id} className="border-b pb-2 last:border-0">
                <p className="font-medium">{event.title}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {new Date(event.lastUpdated).toLocaleString()}
                  </span>
                  <span className="font-medium">
                    Available Seats: {event.availableSeats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Errors
          </h2>
          <div className="space-y-3">
            {stats?.recentErrors?.map((error) => (
              <div key={error._id} className="border-b pb-2 last:border-0">
                <p className="font-medium text-red-600">{error.message}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {new Date(error.createdAt).toLocaleString()}
                  </span>
                  <span className="text-gray-600">{error.eventUrl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Ticket Availability Trend
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
