const API_BASE_URL = 'http://localhost:8080/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<{ token: string; user: any }>(response);
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });

    const data = await this.handleResponse<{ token: string; user: any }>(response);
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async getTrades() {
    const response = await fetch(`${API_BASE_URL}/trades`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async executeTrade(tradeData: any) {
    const response = await fetch(`${API_BASE_URL}/trades`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(tradeData),
    });

    return this.handleResponse(response);
  }

  async closeTrade(tradeId: string) {
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/close`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getStrategies() {
    const response = await fetch(`${API_BASE_URL}/strategies`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createStrategy(strategyData: any) {
    const response = await fetch(`${API_BASE_URL}/strategies`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(strategyData),
    });

    return this.handleResponse(response);
  }

  async toggleStrategy(strategyId: string) {
    const response = await fetch(`${API_BASE_URL}/strategies/${strategyId}/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async markNotificationRead(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async markAllNotificationsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getMarketData(symbol: string, timeFrame: string = '1m', limit: number = 100) {
    const response = await fetch(
      `${API_BASE_URL}/market-data/historical/${symbol}?timeFrame=${timeFrame}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();