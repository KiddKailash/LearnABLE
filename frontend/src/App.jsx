/**
 * Main application component.
 *
 * This component sets up the React Router <Routes> configuration,
 * defining which components to render for specific paths.
 * @returns {JSX.Element} The rendered routes for the application.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      {/* Home (blank) route */}
      <Route path="/" element={<div />} />

      {/* Add more routes as you needed */}
    </Routes>
  );
}

export default App;
