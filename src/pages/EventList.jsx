import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Play, Square, Loader } from "lucide-react";
const base_url = import.meta.env.VITE_API_URL;

const EventList = ({ onEventSelect }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningEvents, setRunningEvents] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    field: "Last_Updated",
    direction: "desc",
  });
  const [filterDate, setFilterDate] = useState("");
  const [scraperStatus, setScraperStatus] = useState({
    isRunning: false,
    successCount: 0,
    failedCount: 0,
  });

  

  const toggleScraper = async () => {
    try {
      const endpoint = scraperStatus.isRunning ? "stop" : "start";
      const res = await fetch(`${base_url}/api/scraper/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: endpoint }),
      });

      if (!res.ok) throw new Error("Failed to toggle scraper");

      setIsRunning((prev) => !prev);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  };

 const eventToggle = async (Event_ID) => {
  try {
    const isCurrentlyRunning = runningEvents.has(Event_ID);
    const action = isCurrentlyRunning ? "stop" : "start";

    const response = await fetch(`${base_url}/api/events/${Event_ID}/${action}`, {
      method: "POST",
    });

    if (!response.ok) throw new Error(`Failed to ${action} event: ${response.statusText}`);

    setRunningEvents((prev) => {
      const newSet = new Set(prev);
      isCurrentlyRunning ? newSet.delete(Event_ID) : newSet.add(Event_ID);
      return newSet;
    });
  } catch (error) {
    console.error(`Error toggling event:`, error.message);
  }
};


  const fetchEvents = async () => {
    try {
      const [eventsResponse, statsResponse] = await Promise.all([
        fetch(`${base_url}/api/events`),
        fetch(`${base_url}/api/stats`),
      ]);

      if (!eventsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const eventsData = await eventsResponse.json();
      const statsData = await statsResponse.json();

      setEvents(eventsData.data);
    const runData = eventsData.data
      .filter((item) => item.Skip_Scraping === false) 
      .map((item) => item.Event_ID);
      setRunningEvents(new Set(runData));
      setScraperStatus(statsData.data.scraperStatus);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortEvents = (eventsToSort) => {
    return [...eventsToSort].sort((a, b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];

      if (
        sortConfig.field === "Event_DateTime" ||
        sortConfig.field === "Last_Updated"
      ) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filterEvents = (eventsToFilter) => {
    if (!filterDate) return eventsToFilter;

    const filterTimestamp = new Date(filterDate).getTime();
    return eventsToFilter.filter((event) => {
      const eventDate = new Date(event.Event_DateTime);
      return (
        eventDate.toDateString() === new Date(filterTimestamp).toDateString()
      );
    });
  };

  const StatusButton = ({ event }) => {
    const isEventRunning = runningEvents.has(event);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
      setIsLoading(true);
      await eventToggle(event);
      setIsLoading(false);
    };

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isEventRunning
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : isEventRunning ? (
          <>
            <Square className="w-4 h-4" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Start
          </>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading events: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedAndFilteredEvents = sortEvents(filterEvents(events));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-gray-600 mt-1">
            Active Events: {runningEvents.size} | Success:{" "}
            {scraperStatus.successCount} | Failed: {scraperStatus.failedCount}
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <button
            onClick={toggleScraper}
            className={`px-4 py-2 rounded-lg text-white ${
              scraperStatus.isRunning ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {scraperStatus.isRunning ? "Stop Scraper" : "Start Scraper"}
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition 
              ${
                scraperStatus.isRunning
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } 
              disabled:opacity-70 disabled:cursor-not-allowed`}
            disabled={scraperStatus.isRunning}
          >
            <Loader
              className={`w-4 h-4 ${
                scraperStatus.isRunning ? "animate-spin" : ""
              }`}
            />
            {scraperStatus.isRunning ? "Running..." : "Stopped"}
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No events found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Available Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">{event.Event_Name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(event.Event_DateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.Available_Seats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(event.Last_Updated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.Venue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {event.Instant_Download && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Instant DL
                        </span>
                      )}
                      {event.Instant_Transfer && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          Transfer
                        </span>
                      )}
                      {event.E_Ticket && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          E-Ticket
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusButton event={event.Event_ID} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <NavLink to={`/events/${event.Event_ID}`}>
                      <button className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded hover:bg-blue-50">
                        View Details →
                      </button>
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventList;