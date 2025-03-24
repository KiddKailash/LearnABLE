/**
 * @fileoverview Main application component that sets up routing and fetches data from the backend API.
 *
 * The App component defines the routing configuration using React Router's Routes and Route components.
 *
 * @module App
 */

import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// Webpages
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import Register from "./pages/Register";

// Components
import ProtectRoute from "./components/ProtectRoutes";
import Dashboard from "./components/Dashboard";

/**
 * App component that initializes application routing and performs data fetching.
 *
 * @component
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
  // Define an array of page objects, each with a route path and the component to render.
  // The "*" path acts as a catch-all route for undefined URLs.
  const pages = [
    { path: "*", component: <PageNotFound /> },
    { path: "/", component: <Login /> },
    { path: "/login", component: <Login /> },
    { path: "/register", component: <Register /> },

    // Add additional page objects here as needed.
  ];

  // Define an array of paths that are public.
  // Any path not included in this list (and not the catch-all "*") will be considered protected.
  const publicPaths = ["/", "/login", "/register"];

  // Local state to store fetched data from the backend (if needed).
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API when the component mounts.
    fetch("http://127.0.0.1:8000/api/")
      .then((response) => response.json())
      .then((data) => {
        // Log and store the fetched data.
        console.log("Data fetched:", data);
        setData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // Empty dependency array ensures this runs once on mount.

  // Log the current state of data. This is optional and for debugging purposes.
  data ? console.log("Fetched Data:", data) : console.log("Data not fetched");

  return (
    // Define the routes for the application
    <Routes>
      {/* Define the root route and render the Dashboard component.
        The Dashboard component will render the appropriate page based on the current route. */}
      <Route path="/" element={<Dashboard />}>
        {pages.map((page, i) => {
          // Determine if the route is public.
          // A route is considered public if its path is in publicPaths or if it's the catch-all "*".
          const isPublic = publicPaths.includes(page.path) || page.path === "*";

          // For each page object, create a Route element.
          // If the route is protected, wrap the component in ProtectRoute to enforce authentication.
          return (
            <Route
              key={i}
              path={page.path}
              element={
                isPublic ? (
                  // Render public component directly.
                  page.component
                ) : (
                  // Render protected component wrapped with ProtectRoute.
                  <ProtectRoute>{page.component}</ProtectRoute>
                )
              }
            />
          );
        })}
      </Route>
    </Routes>
  );
}

export default App;
