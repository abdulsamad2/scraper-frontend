import { useState, useEffect } from "react";
import { get, post } from "../services/api";
import { 
  RefreshCcw, AlertCircle, Clock, Check, X, 
  Calendar, ChevronLeft, ChevronRight, Info 
} from "lucide-react";

const CookieRefreshTracker = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRefresh, setSelectedRefresh] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await get("/api/cookies/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching cookie refresh stats:", err);
      setStatusMessage({
        type: "error",
        text: `Failed to fetch cookie refresh stats: ${err.message}`
      });
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await get(`/api/cookies/history?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHistory(Array.isArray(data.refreshes) ? data.refreshes : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching cookie refresh history:", err);
      setHistory([]);
      setStatusMessage({
        type: "error",
        text: `Failed to fetch cookie refresh history: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRefreshDetails = async (refreshId) => {
    if (!refreshId) return;
    
    try {
      const response = await get(`/api/cookies/${refreshId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedRefresh(data);
      setShowDetails(true);
    } catch (err) {
      console.error("Error fetching refresh details:", err);
      setStatusMessage({
        type: "error",
        text: `Failed to fetch refresh details: ${err.message}`
      });
    }
  };

  const triggerRefresh = async () => {
    try {
      setRefreshing(true);
      setStatusMessage({
        type: "info",
        text: "Triggering cookie refresh..."
      });

      const response = await post("/api/cookies/trigger", {});
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStatusMessage({
        type: "success",
        text: "Cookie refresh triggered successfully"
      });

      // Refresh data after a short delay
      setTimeout(() => {
        fetchStats();
        fetchHistory();
      }, 2000);
    } catch (err) {
      console.error("Error triggering cookie refresh:", err);
      setStatusMessage({
        type: "error",
        text: `Failed to trigger cookie refresh: ${err.message}`
      });
    } finally {
      setRefreshing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHistory();

    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchHistory();
    }, 60000);

    return () => clearInterval(interval);
  }, [page]);

  // Format date with relative time if recent
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleString();
      }
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format duration in a human-readable way
  const formatDuration = (ms) => {
    if (!ms) return "N/A";
    
    try {
      if (ms < 1000) {
        return `${ms}ms`;
      } else if (ms < 60000) {
        return `${(ms / 1000).toFixed(1)}s`;
      } else {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}m ${seconds}s`;
      }
    } catch (e) {
      return "N/A";
    }
  };

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

      {/* Header with stats and trigger button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cookie Refresh Tracking</h2>
            <p className="text-sm text-gray-500">Monitor and manage cookie refresh operations</p>
          </div>
          
          <button
            onClick={triggerRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
              refreshing 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Force Refresh Now
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats ? `${((stats.successRate || 0) * 100).toFixed(1)}%` : "..."}
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                (stats?.successRate || 0) > 0.9 
                  ? "bg-green-100" 
                  : (stats?.successRate || 0) > 0.7 
                    ? "bg-yellow-100" 
                    : "bg-red-100"
              }`}>
                <Check className={`w-5 h-5 ${
                  (stats?.successRate || 0) > 0.9 
                    ? "text-green-600" 
                    : (stats?.successRate || 0) > 0.7 
                      ? "text-yellow-600" 
                      : "text-red-600"
                }`} />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${
                  (stats?.successRate || 0) > 0.9 
                    ? "bg-green-500" 
                    : (stats?.successRate || 0) > 0.7 
                      ? "bg-yellow-500" 
                      : "bg-red-500"
                }`}
                style={{ width: `${((stats?.successRate || 0) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Last Refresh</p>
                <p className="text-xl font-bold text-gray-800">
                  {stats?.lastRefresh ? formatDate(stats.lastRefresh) : "Never"}
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.lastRefreshStatus === "success" 
                ? <span className="text-green-600 flex items-center"><Check className="w-3 h-3 mr-1" /> Success</span>
                : stats?.lastRefreshStatus === "failed"
                  ? <span className="text-red-600 flex items-center"><X className="w-3 h-3 mr-1" /> Failed</span>
                  : <span className="text-gray-600">Unknown</span>
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Next Refresh</p>
                <p className="text-xl font-bold text-gray-800">
                  {stats?.nextRefresh ? formatDate(stats.nextRefresh) : "Unknown"}
                </p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            {stats?.timeUntilNextRefresh !== undefined && (
              <p className="text-xs text-gray-500 mt-2">
                {stats.timeUntilNextRefresh < 0 
                  ? <span className="text-red-600">Overdue</span>
                  : `${Math.floor(stats.timeUntilNextRefresh / 60000)} min remaining`
                }
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Refreshes</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats ? (stats.totalRefreshes || 0) : "..."}
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <RefreshCcw className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex gap-2 text-xs mt-2">
              <span className="text-green-600 flex items-center">
                <Check className="w-3 h-3 mr-1" /> {stats?.successCount || 0}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-red-600 flex items-center">
                <X className="w-3 h-3 mr-1" /> {stats?.failureCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent refresh history */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Cookie Refreshes</h3>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCcw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (!history || history.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            <Info className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No cookie refresh history found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cookies
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proxy
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(history) && history.map((refresh) => (
                    <tr key={refresh?.refreshId || Math.random()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          refresh?.status === "success" 
                            ? "bg-green-100 text-green-800" 
                            : refresh?.status === "failed" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {refresh?.status === "success" && <Check className="w-3 h-3 mr-1" />}
                          {refresh?.status === "failed" && <X className="w-3 h-3 mr-1" />}
                          {refresh?.status === "in_progress" && <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />}
                          {refresh?.status ? (refresh.status.charAt(0).toUpperCase() + refresh.status.slice(1).replace("_", " ")) : "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {refresh?.startTime ? formatDate(refresh.startTime) : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(refresh?.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {refresh?.cookieCount || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">
                        {refresh?.proxy || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => refresh?.refreshId && fetchRefreshDetails(refresh.refreshId)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-500">
                Showing page {page} of {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-md ${
                    page === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages || 1, prev + 1))}
                  disabled={page === (totalPages || 1)}
                  className={`p-2 rounded-md ${
                    page === (totalPages || 1)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for refresh details */}
      {showDetails && selectedRefresh && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Refresh Details</h3>
                <button 
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedRefresh(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedRefresh?.refreshId && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Refresh ID:</span>
                    <span className="font-mono text-sm">{selectedRefresh.refreshId}</span>
                  </div>
                )}

                {selectedRefresh?.status && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Status:</span>
                    <span className={`${
                      selectedRefresh.status === "success" 
                        ? "text-green-600" 
                        : selectedRefresh.status === "failed" 
                          ? "text-red-600" 
                          : "text-yellow-600"
                    }`}>
                      {selectedRefresh.status.charAt(0).toUpperCase() + selectedRefresh.status.slice(1)}
                    </span>
                  </div>
                )}

                {selectedRefresh?.eventId && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Event ID:</span>
                    <span>{selectedRefresh.eventId}</span>
                  </div>
                )}

                {selectedRefresh?.startTime && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Started:</span>
                    <span>{new Date(selectedRefresh.startTime).toLocaleString()}</span>
                  </div>
                )}

                {selectedRefresh?.completionTime && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Completed:</span>
                    <span>{new Date(selectedRefresh.completionTime).toLocaleString()}</span>
                  </div>
                )}

                {selectedRefresh?.duration !== undefined && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Duration:</span>
                    <span>{formatDuration(selectedRefresh.duration)}</span>
                  </div>
                )}

                {selectedRefresh?.cookieCount !== undefined && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Cookies Retrieved:</span>
                    <span>{selectedRefresh.cookieCount}</span>
                  </div>
                )}

                {selectedRefresh?.retryCount !== undefined && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Retry Count:</span>
                    <span>{selectedRefresh.retryCount}</span>
                  </div>
                )}

                {selectedRefresh?.proxy && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Proxy:</span>
                    <span className="font-mono text-sm break-all">{selectedRefresh.proxy}</span>
                  </div>
                )}

                {selectedRefresh?.nextScheduledRefresh && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="font-medium">Next Scheduled Refresh:</span>
                    <span>{new Date(selectedRefresh.nextScheduledRefresh).toLocaleString()}</span>
                  </div>
                )}

                {selectedRefresh?.errorMessage && (
                  <div className="pb-3 border-b">
                    <p className="font-medium mb-2">Error Message:</p>
                    <div className="bg-red-50 p-3 rounded-md text-red-800 font-mono text-sm whitespace-pre-wrap">
                      {selectedRefresh.errorMessage}
                    </div>
                  </div>
                )}

                {selectedRefresh?.metadata && Object.keys(selectedRefresh.metadata).length > 0 && (
                  <div className="pb-3">
                    <p className="font-medium mb-2">Additional Metadata:</p>
                    <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <pre>{JSON.stringify(selectedRefresh.metadata, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedRefresh(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieRefreshTracker; 