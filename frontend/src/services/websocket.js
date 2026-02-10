import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(token, onConnected, onError) {
    // Check if already connected and active
    if (this.client && this.client.active && this.connected) {
      console.log('WebSocket already connected and active');
      return;
    }

    // If client exists but isn't active, deactivate it first
    if (this.client) {
      console.log('Cleaning up existing client...');
      try {
        this.client.deactivate();
      } catch (e) {
        console.error('Error deactivating old client:', e);
      }
    }

    this.connected = false;
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    const socket = new SockJS(wsUrl);
    
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('✅ WebSocket Connected successfully:', frame);
      this.connected = true;
      console.log('Connection state - connected:', this.connected, ', client.active:', this.client.active);
      if (onConnected) onConnected();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ WebSocket STOMP Error:', frame);
      this.connected = false;
      if (onError) onError(frame);
    };

    this.client.onWebSocketError = (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.connected = false;
      if (onError) onError(error);
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('WebSocket disconnected');
    }
  }

  subscribe(destination, callback) {
    if (!this.isConnected()) {
      console.error('WebSocket not connected');
      return null;
    }

    console.log('📡 Subscribing to:', destination);

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('📥 Message received on', destination, ':', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  isConnected() {
    return this.connected && this.client && this.client.active;
  }

  sendMessage(destination, body) {
    if (!this.isConnected()) {
      console.error('❌ WebSocket not connected - cannot send message');
      console.error('   Client exists:', !!this.client);
      console.error('   Client active:', this.client?.active);
      console.error('   Internal connected flag:', this.connected);
      throw new Error('WebSocket not connected');
    }

    console.log('📤 Publishing message to:', destination);
    console.log('   Body:', body);

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
      console.log('✅ Message published successfully');
    } catch (error) {
      console.error('❌ Error publishing message:', error);
      throw error;
    }
  }

  // Specific methods for chat
  sendChatMessage(receiverId, communityId, content) {
    console.log('📤 WebSocket sending message:', {
      receiverId,
      communityId,
      content,
      destination: '/app/chat.sendMessage'
    });
    
    try {
      this.sendMessage('/app/chat.sendMessage', {
        receiverId,
        communityId,
        content,
        type: 'DM',
      });
      console.log('✅ Chat message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send chat message:', error);
      throw error;
    }
  }

  markAsRead(messageId) {
    this.sendMessage('/app/chat.markAsRead', messageId);
  }

  subscribeToUserMessages(callback) {
    return this.subscribe('/user/queue/messages', callback);
  }

  isConnected() {
    return this.connected;
  }
}

// Export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
