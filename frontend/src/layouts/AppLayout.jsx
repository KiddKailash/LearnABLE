import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import SessionMonitor from '../components/SessionMonitor';

/**
 * Main layout for authenticated pages
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get session ID for WebSocket monitoring
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [navigate]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Add SessionMonitor for WebSocket notifications */}
      <SessionMonitor sessionId={sessionId} />
      
      {/* TopBar component */}
      <TopBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Sidebar component */}
      <Sidebar open={sidebarOpen} />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 10,
          overflow: 'auto',
          bgcolor: (theme) => theme.palette.background.default
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout; 