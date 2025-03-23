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

/**
 * App component that initializes application routing and performs data fetching.
 *
 * @component
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      // Fetch data from the backend if needed
      fetch("http://127.0.0.1:8000/api/")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching data:", error));
    } catch (error) {
      console.log("Error fetching data", error);
    } finally {
      console.log("Data fetched:", data);
    }
  }, []);

  return (
    <>
      <Routes>
        {/* Define routes for the application */}
        <Route path="/" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
