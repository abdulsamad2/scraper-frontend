import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventList from "./pages/EventList";
import Dashboard from "./pages/Dashboard";
import EventDetails from "./pages/EventDetails";
import NewScraper from "./pages/NewScraper";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="scraper" element={<NewScraper />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;