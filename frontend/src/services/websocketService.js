/**
 * @fileoverview WebSocket service for real-time session monitoring and notifications
 * 
 * @module websocketService
 */

import { API_BASE_URL } from './config';

/**
 * WebSocket service for managing real-time connections
 * @class
 */
class WebSocketService {
  /**
   * Creates a new WebSocket service instance
   */
  constructor() {
    /** @type {WebSocket|null} */
    this.socket = null;
    
    /** @type {Object} */
    this.callbacks = {
      onSessionTerminated: null,
      onOpen: null,
      onClose: null,
      onError: null
    };
  }

  /**
   * Converts HTTP/HTTPS URL to WebSocket URL
   * 
   * @param {string} path - The WebSocket endpoint path
   * @returns {string} WebSocket URL
   * @private
   */
  getWebSocketUrl(path) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${baseUrl}${path}`;
  }

  /**
   * Connects to WebSocket for session monitoring
   * 
   * @param {string} sessionId - The session ID to monitor
   * @param {string} accessToken - Authentication token
   * @returns {WebSocketService} This instance for chaining
   */
  connectSessionMonitor(sessionId, accessToken) {
    if (this.socket) {
      this.disconnect();
    }

    const wsUrl = this.getWebSocketUrl(`/ws/sessions/${sessionId}/`);
    this.socket = new WebSocket(wsUrl);

    // Add authentication headers
    if (accessToken) {
      this.socket.onopen = () => {
        // Send auth token after connection is established
        this.socket.send(JSON.stringify({
          type: 'authenticate',
          token: accessToken
        }));

        if (this.callbacks.onOpen) {
          this.callbacks.onOpen();
        }
      };
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle session termination
        if (data.type === 'session_terminated' && this.callbacks.onSessionTerminated) {
          this.callbacks.onSessionTerminated(data.message);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.socket.onclose = (event) => {
      if (this.callbacks.onClose) {
        this.callbacks.onClose(event);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    };

    return this;
  }

  /**
   * Disconnects the WebSocket connection
   * 
   * @returns {WebSocketService} This instance for chaining
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    return this;
  }

  /**
   * Sets callback for session termination events
   * 
   * @param {Function} callback - Function to call when session is terminated
   * @returns {WebSocketService} This instance for chaining
   */
  onSessionTerminated(callback) {
    this.callbacks.onSessionTerminated = callback;
    return this;
  }

  /**
   * Sets callback for connection open events
   * 
   * @param {Function} callback - Function to call when connection opens
   * @returns {WebSocketService} This instance for chaining
   */
  onOpen(callback) {
    this.callbacks.onOpen = callback;
    return this;
  }

  /**
   * Sets callback for connection close events
   * 
   * @param {Function} callback - Function to call when connection closes
   * @returns {WebSocketService} This instance for chaining
   */
  onClose(callback) {
    this.callbacks.onClose = callback;
    return this;
  }

  /**
   * Sets callback for connection error events
   * 
   * @param {Function} callback - Function to call when an error occurs
   * @returns {WebSocketService} This instance for chaining
   */
  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService; 