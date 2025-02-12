import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const base_url = import.meta.env.VITE_API_URL;
function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(`${base_url}/api/events/summary`)
            .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
            .then((response) => {
            // Access the data property from the response
            setEvents(response.data);
            setLoading(false);
        })
            .catch((err) => {
            console.error("Error fetching events:", err);
            setError(err.message);
            setLoading(false);
        });
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "text-center p-4 text-red-600", children: _jsxs("p", { children: ["Error loading events: ", error] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Events" }), events.length === 0 ? (_jsx("p", { className: "text-center text-gray-500", children: "No events found" })) : (_jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Title" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Available Seats" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Last Updated" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: events.map((event) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: event.title }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: new Date(event.dateTime).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: event.availableSeats }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: new Date(event.lastUpdated).toLocaleString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx(Link, { to: `/events/${event._id}`, className: "text-blue-600 hover:text-blue-800", children: "View Details" }) })] }, event._id))) })] }) }))] }));
}
export default EventList;
