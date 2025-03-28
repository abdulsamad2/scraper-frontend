import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Play, Square, Loader, ChevronLeft, ChevronRight } from "lucide-react";

const EventList = ({ onEventSelect }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningEvents, setRunningEvents] = useState(new Set());
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // Truncate text function
  const truncateText = (text, maxLength = 20) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const toggleScraper = async () => {
    try {
      const endpoint = scraperStatus.isRunning ? "stop" : "start";
      const res = await fetch(`/api/scraper/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: endpoint }),
      });

      if (!res.ok) throw new Error("Failed to toggle scraper");

      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const eventToggle = async (Event_ID) => {
    try {
      const isCurrentlyRunning = runningEvents.has(Event_ID);
      const action = isCurrentlyRunning ? "stop" : "start";

      const response = await fetch(`/api/events/${Event_ID}/${action}`, {
        method: "POST",
      });

      if (!response.ok)
        throw new Error(`Failed to ${action} event: ${response.statusText}`);

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
        fetch(`/api/events`),
        fetch(`/api/stats`),
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

  // Memoized and paginated events
  const sortedAndFilteredEvents = useMemo(() => {
    const filtered = filterEvents(sortEvents(events));

    // Pagination logic
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return filtered.slice(indexOfFirstEvent, indexOfLastEvent);
  }, [events, sortConfig, filterDate, currentPage]);

  // Pagination handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(events.length / eventsPerPage);

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
        className={`flex items-center gap-2 px-2 py-1 rounded-lg text-sm transition-all duration-200 ${
          isEventRunning
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {isLoading ? (
          <Loader className="w-3 h-3 animate-spin" />
        ) : isEventRunning ? (
          <>
            <Square className="w-3 h-3" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-3 h-3" />
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
            <p className="text-sm text-red-700">
              Error loading events: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Events</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Active: {runningEvents.size} | Success: {scraperStatus.successCount}{" "}
            | Failed: {scraperStatus.failedCount}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-2 py-1 text-sm border rounded-lg w-full md:w-auto"
          />
          <button
            onClick={toggleScraper}
            className={`px-3 py-1 text-sm rounded-lg text-white ${
              scraperStatus.isRunning ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {scraperStatus.isRunning ? "Stop Scraper" : "Start Scraper"}
          </button>
        </div>
      </div>

      {/* Events Table - Responsive */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Event Name",
                    "Date",
                    "Seats",
                    "Last Updated",
                    "Venue",
                    "Type",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {truncateText(event.Event_Name, 15)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {new Date(event.Event_DateTime).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {event.Available_Seats}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {new Date(event.Last_Updated).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {truncateText(event.Venue, 10)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex space-x-1">
                        {event.Instant_Download && (
                          <span className="px-1 py-0.5 text-[10px] rounded-full bg-green-100 text-green-800">
                            DL
                          </span>
                        )}
                        {event.Instant_Transfer && (
                          <span className="px-1 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800">
                            TR
                          </span>
                        )}
                        {event.E_Ticket && (
                          <span className="px-1 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-800">
                            ET
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusButton event={event.Event_ID} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <NavLink to={`/events/${event.Event_ID}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50">
                          View →
                        </button>
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 p-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;
