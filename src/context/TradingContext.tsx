import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { apiService } from '../services/api';
import { webSocketService } from '../services/websocket';
import { User, Trade, Strategy, MarketData, Notification } from '../types/trading';

interface TradingState {
  user: User | null;
  isAuthenticated: boolean;
  trades: Trade[];
  strategies: Strategy[];
  marketData: MarketData[];
  notifications: Notification[];
  isLoading: boolean;
}

type TradingAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'UPDATE_TRADE'; payload: { id: string; updates: Partial<Trade> } }
  | { type: 'ADD_STRATEGY'; payload: Strategy }
  | { type: 'UPDATE_STRATEGY'; payload: { id: string; updates: Partial<Strategy> } }
  | { type: 'SET_MARKET_DATA'; payload: MarketData[] }
  | { type: 'UPDATE_MARKET_DATA'; payload: MarketData }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: TradingState = {
  user: null,
  isAuthenticated: false,
  trades: [],
  strategies: [],
  marketData: [],
  notifications: [],
  isLoading: false,
};

const tradingReducer = (state: TradingState, action: TradingAction): TradingState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'ADD_TRADE':
      return { ...state, trades: [action.payload, ...state.trades] };
    case 'UPDATE_TRADE':
      return {
        ...state,
        trades: state.trades.map(trade =>
          trade.id === action.payload.id ? { ...trade, ...action.payload.updates } : trade
        ),
      };
    case 'ADD_STRATEGY':
      return { ...state, strategies: [action.payload, ...state.strategies] };
    case 'UPDATE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.map(strategy =>
          strategy.id === action.payload.id ? { ...strategy, ...action.payload.updates } : strategy
        ),
      };
    case 'SET_MARKET_DATA':
      return { ...state, marketData: action.payload };
    case 'UPDATE_MARKET_DATA':
      return {
        ...state,
        marketData: state.marketData.map(data =>
          data.symbol === action.payload.symbol ? action.payload : data
        ).concat(
          state.marketData.find(data => data.symbol === action.payload.symbol) ? [] : [action.payload]
        ),
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const TradingContext = createContext<{
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;
} | null>(null);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  return (
    <TradingContext.Provider value={{ state, dispatch }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};