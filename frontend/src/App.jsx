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
import Reporting from "./pages/private/NCCDReport/Reporting.jsx";
import Classes from "./pages/private/Classes";
import Dashboard from "./pages/private/Dashboard";
import MobileReporting from "./pages/private/NCCDReport/MobileReporting";
import AIAssistantTutorial from "./pages/private/AIAssistantTutorial";
import AIAssistantUpload from "./pages/private/AIAssistant";
import StudentsList from "./pages/private/StudentList.jsx";
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
    { path: "/ai-assistant", component: <AIAssistantTutorial /> },
    { path: "/ai-assistant/upload", component: <AIAssistantUpload /> },
    { path: "/reporting", component: <Reporting /> },
    { path: "/classes", component: <Classes /> },
    { path: "/classes/:id/students", component: <StudentsList /> }, 
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
