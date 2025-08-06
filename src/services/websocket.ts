import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type WebSocketMessageHandler = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private subscriptions: Map<string, any> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('WebSocket Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('WebSocket connected');
        this.connected = true;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('WebSocket error:', frame.headers['message']);
        reject(new Error(frame.headers['message']));
      };

      this.client.onDisconnect = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
      };

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  subscribeToMarketData(symbol: string, handler: WebSocketMessageHandler) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const destination = `/topic/market-data/${symbol}`;
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing market data message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  subscribeToAllMarketData(handler: WebSocketMessageHandler) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const destination = '/topic/market-data/all';
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing market data message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  subscribeToTrades(handler: WebSocketMessageHandler) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const destination = '/user/queue/trades';
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing trade message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  subscribeToNotifications(handler: WebSocketMessageHandler) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const destination = '/user/queue/notifications';
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error('Error parsing notification message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination: string) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();