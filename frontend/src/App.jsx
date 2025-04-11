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
import Attendance from "./pages/private/Attendance";
import Message from "./pages/private/Message";
import Storage from "./pages/private/Storage";
import Students from "./pages/private/Students";
import Dashboard from "./pages/private/Dashboard/Dashboard";
import Settings from "./pages/private/Settings";

// Components
import ProtectRoute from "./components/ProtectRoutes";
import Layout from "./components/Layout";

function App({ mode, toggleTheme }) {
  // Define an array of page objects, each with a route path and the component to render.
  // The "*" path acts as a catch-all route for undefined URLs.
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
    { path: "/attendance", component: <Attendance /> },
    { path: "/message", component: <Message /> },
    { path: "/storage", component: <Storage /> },
    { path: "/students", component: <Students /> },
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
