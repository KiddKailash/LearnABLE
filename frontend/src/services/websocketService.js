/**
 * @fileoverview WebSocket service for real-time notifications
 */

import { API_BASE_URL } from './config';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onSessionTerminated: null,
      onOpen: null,
      onClose: null,
      onError: null
    };
  }

  // Convert HTTP/HTTPS to WS/WSS
  getWebSocketUrl(path) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${baseUrl}${path}`;
  }

  // Connect to WebSocket for session monitoring
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

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    return this;
  }

  // Set callback for session termination
  onSessionTerminated(callback) {
    this.callbacks.onSessionTerminated = callback;
    return this;
  }

  // Set callback for connection open
  onOpen(callback) {
    this.callbacks.onOpen = callback;
    return this;
  }

  // Set callback for connection close
  onClose(callback) {
    this.callbacks.onClose = callback;
    return this;
  }

  // Set callback for connection error
  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }
}

export default new WebSocketService(); 