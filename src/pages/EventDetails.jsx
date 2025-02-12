import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Define the base URL from environment variables
const base_url = import.meta.env.VITE_API_URL;
const EventDetails = () => {
    // Get the id parameter from the URL
    const { id } = useParams();
    // State management with type definitions
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(`${base_url}/api/events/${id}/details`)
            .then((res) => res.json())
            .then((data) => {
            setEvent(data);
            setLoading(false);
        })
            .catch((err) => {
            console.error("Error fetching event details:", err);
            setLoading(false);
        });
    }, [id]);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (!event) {
        return _jsx("div", { children: "Error: Event not found" });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: event.title }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Event Details" }), _jsxs("dl", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "font-medium", children: "Date & Time" }), _jsx("dd", { className: "text-gray-600", children: new Date(event.dateTime).toLocaleString() })] }), _jsxs("div", { children: [_jsx("dt", { className: "font-medium", children: "Available Seats" }), _jsx("dd", { className: "text-gray-600", children: event.availableSeats })] }), _jsxs("div", { children: [_jsx("dt", { className: "font-medium", children: "Last Updated" }), _jsx("dd", { className: "text-gray-600", children: new Date(event.lastUpdated).toLocaleString() })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Ticket Stats" }), _jsxs("dl", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "font-medium", children: "Total Tickets" }), _jsx("dd", { className: "text-gray-600", children: event.metadata?.ticketStats?.totalTickets || 0 })] }), _jsxs("div", { children: [_jsx("dt", { className: "font-medium", children: "Recent Change" }), _jsx("dd", { className: "text-gray-600", children: event.metadata?.ticketStats?.ticketCountChange || 0 })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "p-6", children: _jsx("h2", { className: "text-lg font-semibold mb-4", children: "Seat Groups" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Section" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Row" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Seat Range" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Count" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Price Range" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: event.seatGroups.map((group) => {
                                        const prices = group.seats.map((seat) => seat.price);
                                        const minPrice = Math.min(...prices);
                                        const maxPrice = Math.max(...prices);
                                        return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: group.section }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: group.row }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: group.seatRange }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: group.seatCount }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: ["$", minPrice.toFixed(2), " - $", maxPrice.toFixed(2)] })] }, group._id));
                                    }) })] }) })] })] }));
};
export default EventDetails;
