import { User, Trade, Strategy, MarketData, Notification, ChartData } from '../types/trading';

export const mockUser: User = {
  id: '1',
  email: 'trader@example.com',
  name: 'John Trader',
  role: 'user',
  accountBalance: 250000,
  totalPnL: 12500,
  openPositions: 5,
};

export const mockTrades: Trade[] = [
  {
    id: '1',
    symbol: 'NIFTY24JAN22000CE',
    type: 'BUY',
    quantity: 50,
    price: 125.50,
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'OPEN',
    pnl: 2250,
    stopLoss: 100,
    takeProfit: 150,
    strategy: 'EMA Crossover',
  },
  {
    id: '2',
    symbol: 'BANKNIFTY24JAN46000PE',
    type: 'SELL',
    quantity: 25,
    price: 89.25,
    executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'CLOSED',
    pnl: -875,
    strategy: 'RSI Reversal',
  },
  {
    id: '3',
    symbol: 'RELIANCE',
    type: 'BUY',
    quantity: 100,
    price: 2450.75,
    executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'OPEN',
    pnl: 1250,
    stopLoss: 2400,
    takeProfit: 2500,
  },
];

export const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: '20-50 EMA Crossover',
    type: 'EMA_CROSSOVER',
    isActive: true,
    parameters: {
      timeFrame: '15m',
      indicators: {
        ema1: 20,
        ema2: 50,
      },
      riskManagement: {
        stopLoss: 2,
        takeProfit: 4,
        maxCapital: 10,
      },
    },
    performance: {
      totalTrades: 45,
      winRate: 68,
      avgPnL: 850,
    },
  },
  {
    id: '2',
    name: 'RSI Oversold/Overbought',
    type: 'RSI',
    isActive: false,
    parameters: {
      timeFrame: '5m',
      indicators: {
        rsiPeriod: 14,
        oversold: 30,
        overbought: 70,
      },
      riskManagement: {
        stopLoss: 1.5,
        takeProfit: 3,
        maxCapital: 15,
      },
    },
    performance: {
      totalTrades: 32,
      winRate: 62,
      avgPnL: 625,
    },
  },
];

export const mockMarketData: MarketData[] = [
  {
    symbol: 'NIFTY',
    price: 21845.30,
    change: 125.75,
    changePercent: 0.58,
    volume: 125000000,
    high: 21890.50,
    low: 21720.25,
    timestamp: new Date(),
  },
  {
    symbol: 'BANKNIFTY',
    price: 46234.85,
    change: -89.25,
    changePercent: -0.19,
    volume: 85000000,
    high: 46450.75,
    low: 46125.30,
    timestamp: new Date(),
  },
  {
    symbol: 'SENSEX',
    price: 72456.92,
    change: 234.56,
    changePercent: 0.32,
    volume: 95000000,
    high: 72580.45,
    low: 72125.78,
    timestamp: new Date(),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'TRADE_EXECUTED',
    title: 'Trade Executed',
    message: 'BUY order for NIFTY24JAN22000CE executed at ₹125.50',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    priority: 'HIGH',
  },
  {
    id: '2',
    type: 'STRATEGY_TRIGGERED',
    title: 'Strategy Alert',
    message: 'EMA Crossover signal detected for BANKNIFTY',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: 'MEDIUM',
  },
  {
    id: '3',
    type: 'RISK_ALERT',
    title: 'Stop Loss Hit',
    message: 'Stop loss triggered for RELIANCE position',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
    priority: 'HIGH',
  },
];

export const generateChartData = (): ChartData[] => {
  const data: ChartData[] = [];
  let basePrice = 21800;
  
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * 50;
    basePrice += change;
    
    const high = basePrice + Math.random() * 25;
    const low = basePrice - Math.random() * 25;
    const open = i === 0 ? basePrice : data[i - 1].close;
    const close = basePrice;
    
    data.push({
      timestamp: new Date(Date.now() - (100 - i) * 15 * 60 * 1000),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      ema20: close + Math.sin(i * 0.1) * 10,
      ema50: close + Math.sin(i * 0.05) * 20,
    });
  }
  
  return data;
};