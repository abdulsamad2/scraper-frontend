import React, { useState } from "react";
const base_url = import.meta.env.VITE_API_URL;

const NewScraper = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    URL: "",
    Event_ID: "",
    Event_Name: "",
    Event_DateTime: "",
    Venue: "",
    Zone: "General",
    Available_Seats: 0,
    Skip_Scraping: true,
    inHandDate: "", // Add inHandDate field
  });

  console.log(formData)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationState, setValidationState] = useState({
    URL: true,
    Event_ID: true,
    Event_Name: true,
    Event_DateTime: true,
    Venue: true,
    Zone: true,
    inHandDate: true, // Add validation for inHandDate
  });

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname.includes("ticketmaster.com") &&
        parsed.pathname.includes("/event/")
      );
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const validation = {
      URL: validateUrl(formData.URL),
      Event_ID: formData.Event_ID.length > 0,
      Event_Name: formData.Event_Name.length >= 3,
      Event_DateTime: Boolean(formData.Event_DateTime),
      Venue: formData.Venue.length > 0,
      Zone: formData.Zone.length > 0,
      inHandDate: Boolean(formData.inHandDate), // Validate inHandDate
    };

    setValidationState(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setValidationState((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          URL: formData.URL,
          Event_ID: formData.Event_ID,
          Event_Name: formData.Event_Name,
          Event_DateTime: formData.Event_DateTime,
          Venue: formData.Venue,
          Zone: formData.Zone,
          Available_Seats: formData.Available_Seats,
          Skip_Scraping: formData.Skip_Scraping,
          inHandDate: formData.inHandDate, // Include inHandDate in the request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      const data = await response.json();
      onSuccess?.(data); // Pass the created event data to the onSuccess callback
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            Back
          </button>
          <h1 className="text-2xl font-bold">Add New Event</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="URL"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event URL
            </label>
            <input
              id="URL"
              name="URL"
              type="url"
              value={formData.URL}
              onChange={handleInputChange}
              placeholder="https://www.ticketmaster.com/event/..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.URL ? "border-red-500" : "border-gray-300"
              }`}
            />
            {!validationState.URL && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid Ticketmaster event URL
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="Event_ID"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event ID
            </label>
            <input
              id="Event_ID"
              name="Event_ID"
              type="text"
              value={formData.Event_ID}
              onChange={handleInputChange}
              placeholder="Enter event ID"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.Event_ID ? "border-red-500" : "border-gray-300"
              }`}
            />
            {!validationState.Event_ID && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid event ID
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="Event_Name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Name
            </label>
            <input
              id="Event_Name"
              name="Event_Name"
              type="text"
              value={formData.Event_Name}
              onChange={handleInputChange}
              placeholder="Event Name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.Event_Name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {!validationState.Event_Name && (
              <p className="mt-1 text-sm text-red-600">
                Name must be at least 3 characters long
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="Venue"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Venue
            </label>
            <input
              id="Venue"
              name="Venue"
              type="text"
              value={formData.Venue}
              onChange={handleInputChange}
              placeholder="Enter venue name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.Venue ? "border-red-500" : "border-gray-300"
              }`}
            />
            {!validationState.Venue && (
              <p className="mt-1 text-sm text-red-600">
                Please enter the venue name
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="Zone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Zone
            </label>
            <input
              id="Zone"
              name="Zone"
              type="text"
              value={formData.Zone}
              onChange={handleInputChange}
              placeholder="Enter zone"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.Zone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {!validationState.Zone && (
              <p className="mt-1 text-sm text-red-600">Please enter the zone</p>
            )}
          </div>

          <div>
            <label
              htmlFor="Event_DateTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Date & Time
            </label>
            <input
              id="Event_DateTime"
              name="Event_DateTime"
              type="datetime-local"
              value={formData.Event_DateTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.Event_DateTime
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {!validationState.Event_DateTime && (
              <p className="mt-1 text-sm text-red-600">
                Please select the event date and time
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="inHandDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              In-Hand Date
            </label>
            <input
              id="inHandDate"
              name="inHandDate"
              type="datetime-local"
              value={formData.inHandDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                !validationState.inHandDate
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {!validationState.inHandDate && (
              <p className="mt-1 text-sm text-red-600">
                Please select the in-hand date
              </p>
            )}
          </div>
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">↻</span>
                  Setting Up...
                </>
              ) : (
                "Start Tracking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewScraper;
