/**
 * @fileoverview Component to monitor session status via WebSocket. Does not render visible UI.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocketService';

/**
 * SessionMonitor component to monitor session status via WebSocket.
 *
 * @component
 * @param {Object} props
 * @param {string|number} props.sessionId - The session ID to monitor
 * @returns {null}
 */
const SessionMonitor = ({ sessionId }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;

    // Get token from local storage
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Connect to WebSocket for session monitoring
    websocketService
      .connectSessionMonitor(sessionId, token)
      .onSessionTerminated((message) => {
        console.log('Session terminated:', message);
        
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_id');
        
        // Redirect to login page with message
        navigate('/login', { 
          state: { 
            message: 'Your session has been terminated by the account owner.',
            severity: 'warning'
          } 
        });
      })
      .onError((error) => {
        console.error('WebSocket connection error:', error);
      });

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [sessionId, navigate]);

  // This component doesn't render anything visible
  return null;
};

SessionMonitor.propTypes = {
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default SessionMonitor; 