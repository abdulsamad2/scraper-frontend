import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
const base_url = import.meta.env.VITE_API_URL;
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${base_url}/api/events/stats`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStats(data);
                setError(null);
            }
            catch (err) {
                console.error("Error fetching stats:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch stats");
            }
            finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "text-center p-6 bg-red-50 rounded-lg", children: _jsx("p", { className: "text-red-600", children: error }) }));
    }
    const chartData = stats?.latestUpdates
        .map((event) => ({
        name: event.title,
        tickets: event.metadata.ticketStats.totalTickets,
        timestamp: new Date(event.lastUpdated).getTime(),
    }))
        .sort((a, b) => a.timestamp - b.timestamp) || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-700", children: "Total Events" }), _jsx("p", { className: "text-gray-500 text-sm", children: "Active events being tracked" }), _jsx("p", { className: "text-3xl font-bold mt-2", children: stats?.totalEvents || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-700", children: "Available Seats" }), _jsx("p", { className: "text-gray-500 text-sm", children: "Total seats across all events" }), _jsx("p", { className: "text-3xl font-bold mt-2", children: stats?.totalAvailableSeats?.toLocaleString() || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-700", children: "Latest Updates" }), _jsx("div", { className: "mt-4 space-y-3", children: stats?.latestUpdates?.map((event) => (_jsxs("div", { className: "border-b pb-2 last:border-0", children: [_jsx("p", { className: "font-medium", children: event.title }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-500", children: new Date(event.lastUpdated).toLocaleString() }), _jsxs("span", { className: `font-medium ${event.metadata.ticketStats.ticketCountChange > 0
                                                        ? "text-green-600"
                                                        : event.metadata.ticketStats.ticketCountChange < 0
                                                            ? "text-red-600"
                                                            : "text-gray-600"}`, children: [event.metadata.ticketStats.ticketCountChange > 0
                                                            ? "+"
                                                            : "", event.metadata.ticketStats.ticketCountChange] })] })] }, event._id))) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-700 mb-4", children: "Ticket Availability Trend" }), _jsx("div", { className: "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 12 }, interval: 0 }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "tickets", stroke: "#2563eb", strokeWidth: 2, dot: { strokeWidth: 2 } })] }) }) })] })] }));
};
export default Dashboard;
