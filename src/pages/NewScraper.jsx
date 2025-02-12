import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const base_url = import.meta.env.VITE_API_URL;
const NewScraper = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${base_url}/scrape`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to start scraping");
            }
            navigate("/events");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
        finally {
            setLoading(false);
        }
    };
    const handleUrlChange = (e) => {
        setUrl(e.target.value);
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Start New Scraper" }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-700", children: "Enter Event URL" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Enter a Ticketmaster event URL to start scraping ticket information" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "url", className: "block text-sm font-medium text-gray-700 mb-1", children: "Event URL" }), _jsx("input", { id: "url", type: "url", placeholder: "https://www.ticketmaster.com/event/...", value: url, onChange: handleUrlChange, required: true, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" })] }), error && (_jsx("div", { className: "bg-red-50 border-l-4 border-red-500 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) })] }) })), _jsxs("div", { className: "flex items-center justify-end space-x-4", children: [_jsx("button", { type: "button", onClick: () => navigate("/events"), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: `px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? "opacity-50 cursor-not-allowed" : ""}`, children: loading ? (_jsxs("div", { className: "flex items-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Starting Scraper..."] })) : ("Start Scraping") })] })] }), _jsxs("div", { className: "mt-8 border-t pt-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2", children: "Instructions" }), _jsxs("ul", { className: "list-disc pl-5 text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "Enter a valid Ticketmaster event URL" }), _jsx("li", { children: "The scraper will start collecting ticket information" }), _jsx("li", { children: "You can monitor the progress in the Events page" }), _jsx("li", { children: "Data will be updated automatically at regular intervals" })] })] })] })] }));
};
export default NewScraper;
