import React, { useEffect, useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { apiService } from './services/api';
import { webSocketService } from './services/websocket';
import LoginForm from './components/Auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import StrategyManagement from './components/Strategies/StrategyManagement';
import TradeExecution from './components/Trades/TradeExecution';
import TransactionHistory from './components/History/TransactionHistory';
import NotificationCenter from './components/Notifications/NotificationCenter';

const AppContent: React.FC = () => {
  const { state, dispatch } = useTrading();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Load real data when authenticated
    if (state.isAuthenticated) {
      loadInitialData();
    }
  }, [state.isAuthenticated, dispatch]);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load trades
      const trades = await apiService.getTrades();
      trades.forEach((trade: any) => dispatch({ type: 'ADD_TRADE', payload: trade }));
      
      // Load strategies
      const strategies = await apiService.getStrategies();
      strategies.forEach((strategy: any) => dispatch({ type: 'ADD_STRATEGY', payload: strategy }));
      
      // Load notifications
      const notifications = await apiService.getNotifications();
      notifications.forEach((notification: any) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }));
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Simulate real-time market data updates
  useEffect(() => {
    // Real-time updates are now handled via WebSocket in LoginForm
    // This effect is kept for any additional real-time logic if needed
    return () => {
      // Cleanup WebSocket connections on unmount
      webSocketService.disconnect();
    };
  }, []);

  const handleLogout = () => {
    apiService.logout();
    webSocketService.disconnect();
    dispatch({ type: 'LOGOUT' });
  };

  // Add logout handler to context
  useEffect(() => {
    (window as any).handleLogout = handleLogout;
  }, []);

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'strategies': return <StrategyManagement />;
      case 'trades': return <TradeExecution />;
      case 'history': return <TransactionHistory />;
      case 'notifications': return <NotificationCenter />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <TradingProvider>
      <AppContent />
    </TradingProvider>
  );
}

export default App;