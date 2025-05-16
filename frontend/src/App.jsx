/**
 * @fileoverview Main application component that sets up routing and fetches data from the backend API.
 *
 * The App component defines the routing configuration using React Router's Routes and Route components.
 *
 * @module App
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import { TutorialProvider } from './contexts/TutorialContext';
import { UserProvider } from './store/UserObject';

// Components
import Tutorial from './components/Tutorial.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectRoute from "./components/ProtectRoutes";
import Layout from "./layout/Layout.jsx";

// Webpages - Public
import AuthPage from "./pages/public/AuthPage";
import PageNotFound from "./pages/public/PageNotFound";

// Webpages - Private
import Account from "./pages/private/Account/Account.jsx";
import ResponsiveNCCDReporting from "./pages/private/NCCDReport/ResponsiveNCCDReporting";
import Classes from "./pages/private/Classes/Classes";
import Dashboard from "./pages/private/Dashboard/Dashboard";
import StudentListPage from "./pages/private/Classes/StudentList.jsx";
import ClassContent from "./pages/private/Classes/ClassContent";

const App = ({ mode }) => {
  const pages = [
    { path: "/", component: <AuthPage /> },
    { path: "/login", component: <AuthPage /> },
    { path: "/register", component: <AuthPage initialTab={1} /> },
    { path: "/dashboard", component: <Dashboard /> },
    { path: "/account", component: <Account /> },
    { path: "/reporting", component: <ResponsiveNCCDReporting /> },
    { path: "/classes", component: <Classes /> },
    { path: "/classes/:classId/students", component: <StudentListPage /> }, 
    { path: "/classes/:classId/content", component: <ClassContent /> },
    { path: "*", component: <PageNotFound /> },
  ];

  // Define an array of paths that are public.
  const publicPaths = ["/", "/login"];

  return (
    <ErrorBoundary>
      <TutorialProvider>
        <UserProvider>
          <Tutorial />
          <div className="app">
            <Routes>
              <Route
                path="/"
                element={<Layout mode={mode} />}
              >
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
          </div>
        </UserProvider>
      </TutorialProvider>
    </ErrorBoundary>
  );
};

export default App;
