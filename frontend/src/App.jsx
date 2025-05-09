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
import { UserProvider } from './contexts/UserObject';
import Tutorial from './components/Tutorial.jsx';
import ErrorBoundary from './components/ErrorBoundary';

// Webpages - Public
import AuthPage from "./pages/public/AuthPage";
import PageNotFound from "./pages/public/PageNotFound";

// Webpages - Private
import Account from "./pages/private/Account/Account";
import Activity from "./pages/private/Activity";
import Analytics from "./pages/private/Analytics";
import Reporting from "./pages/private/NCCDReport/Reporting.jsx";
import Storage from "./pages/private/Storage";
import Classes from "./pages/private/Classes";
import Dashboard from "./pages/private/Dashboard";
import Settings from "./pages/private/Settings";
import StudentListPage from "./pages/private/StudentList.jsx";
import MobileReporting from "./pages/private/NCCDReport/MobileReporting";
import AIAssistantTutorial from "./pages/private/AIAssistantTutorial";
import AIAssistantUpload from "./pages/private/AIAssistant";

// Components
import ProtectRoute from "./components/ProtectRoutes";
import Layout from "./components/Layout";

const App = ({ mode }) => {
  const pages = [
    { path: "/", component: <AuthPage /> },
    { path: "/login", component: <AuthPage /> },
    { path: "/register", component: <AuthPage initialTab={1} /> },
    { path: "/dashboard", component: <Dashboard /> },
    { path: "/account", component: <Account /> },
    { path: "/activity", component: <Activity /> },
    { path: "/ai-assistant", component: <AIAssistantTutorial /> },
    { path: "/ai-assistant/upload", component: <AIAssistantUpload /> },
    { path: "/analytics", component: <Analytics /> },
    { path: "/reporting", component: <Reporting /> },
    { path: "/storage", component: <Storage /> },
    { path: "/classes", component: <Classes /> },
    { path: "/classes/:classId/students", component: <StudentListPage /> },
    { path: "/settings", component: <Settings /> },
    { path: "/mobile-reporting", component: <MobileReporting /> },
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
