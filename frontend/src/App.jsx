/**
 * @fileoverview Main application component that sets up routing and fetches data from the backend API.
 *
 * The App component defines the routing configuration using React Router's Routes and Route components.
 *
 * @module App
 */

import React from "react";
import { Routes, Route } from "react-router-dom";

// Webpages - Public
import Login from "./pages/public/Login";
import PageNotFound from "./pages/public/PageNotFound";
import Register from "./pages/public/Register";

// Webpages - Private
import Account from "./pages/private/Account";
import Activity from "./pages/private/Activity";
import AIAssistant from "./pages/private/AIAssistant";
import Analytics from "./pages/private/Analytics";
import Reporting from "./pages/private/Reporting";
import Storage from "./pages/private/Storage";
import Classes from "./pages/private/Classes"; // ✅ updated import
import Dashboard from "./pages/private/Dashboard/Dashboard";
import Settings from "./pages/private/Settings";
import StudentListPage from "./pages/private/StudentList.jsx";

// Components
import ProtectRoute from "./components/ProtectRoutes";
import Layout from "./components/Layout";

function App({ mode, toggleTheme }) {
  const pages = [
    { path: "*", component: <PageNotFound /> },
    { path: "/", component: <Login /> },
    { path: "/login", component: <Login /> },
    { path: "/register", component: <Register /> },
    { path: "/dashboard", component: <Dashboard /> },
    { path: "/account", component: <Account /> },
    { path: "/activity", component: <Activity /> },
    { path: "/ai-assistant", component: <AIAssistant /> },
    { path: "/analytics", component: <Analytics /> },
    { path: "/reporting", component: <Reporting /> },
    { path: "/storage", component: <Storage /> },
    { path: "/classes", component: <Classes /> }, // ✅ updated route
    { path: "/classes/:classId/students", component: <StudentListPage /> },
    { path: "/settings", component: <Settings /> },
  ];

  // Define an array of paths that are public.
  const publicPaths = ["/", "/login", "/register"];

  return (
    <Routes>
      <Route path="/" element={<Layout mode={mode} toggleTheme={toggleTheme} />}>
        {pages.map((page, i) => {
          // Determine if the route is public or protected
          const isPublic = publicPaths.includes(page.path) || page.path === "*";

          return (
            <Route
              key={i}
              path={page.path}
              element={
                isPublic ? (
                  page.component
                ) : (
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
