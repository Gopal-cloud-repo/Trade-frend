export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  accountBalance: number;
  totalPnL: number;
  openPositions: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  executedAt: Date;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  pnl?: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
}

export interface Strategy {
  id: string;
  name: string;
  type: 'EMA_CROSSOVER' | 'RSI' | 'MACD' | 'CUSTOM';
  isActive: boolean;
  parameters: {
    timeFrame: string;
    indicators: Record<string, any>;
    riskManagement: {
      stopLoss: number;
      takeProfit: number;
      maxCapital: number;
    };
  };
  performance: {
    totalTrades: number;
    winRate: number;
    avgPnL: number;
  };
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: Date;
}

export interface ChartData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
}

export interface Notification {
  id: string;
  type: 'TRADE_EXECUTED' | 'STRATEGY_TRIGGERED' | 'RISK_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}