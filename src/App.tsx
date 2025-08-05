import React, { useEffect, useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import LoginForm from './components/Auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import StrategyManagement from './components/Strategies/StrategyManagement';
import TradeExecution from './components/Trades/TradeExecution';
import TransactionHistory from './components/History/TransactionHistory';
import NotificationCenter from './components/Notifications/NotificationCenter';
import { mockTrades, mockStrategies, mockMarketData, mockNotifications } from './data/mockData';

const AppContent: React.FC = () => {
  const { state, dispatch } = useTrading();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Initialize mock data when authenticated
    if (state.isAuthenticated) {
      mockTrades.forEach(trade => dispatch({ type: 'ADD_TRADE', payload: trade }));
      mockStrategies.forEach(strategy => dispatch({ type: 'ADD_STRATEGY', payload: strategy }));
      dispatch({ type: 'SET_MARKET_DATA', payload: mockMarketData });
      mockNotifications.forEach(notification => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }));
    }
  }, [state.isAuthenticated, dispatch]);

  // Simulate real-time market data updates
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(() => {
      const updatedMarketData = mockMarketData.map(data => ({
        ...data,
        price: data.price + (Math.random() - 0.5) * 20,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 2,
        timestamp: new Date(),
      }));
      dispatch({ type: 'SET_MARKET_DATA', payload: updatedMarketData });
    }, 5000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, dispatch]);

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