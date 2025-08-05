import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Target, StopCircle, Edit3 } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import NewTradeModal from './NewTradeModal';

const TradeExecution: React.FC = () => {
  const { state } = useTrading();
  const [showNewTradeModal, setShowNewTradeModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  const filteredTrades = state.trades.filter(trade => {
    if (filter === 'ALL') return true;
    return trade.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/20 text-blue-400';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trade Execution</h2>
          <p className="text-gray-400 mt-1">Manage your active and completed trades</p>
        </div>
        <button
          onClick={() => setShowNewTradeModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Trade</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        {['ALL', 'OPEN', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Trades Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrades.map(trade => (
          <div key={trade.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.type === 'BUY' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{trade.symbol}</h3>
                  <p className="text-sm text-gray-400">{trade.strategy || 'Manual'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(trade.status)}`}>
                  {trade.status}
                </span>
                {trade.status === 'OPEN' && (
                  <button className="p-1 rounded text-gray-400 hover:text-white">
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Quantity</p>
                <p className="text-white font-medium">{trade.quantity}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Entry Price</p>
                <p className="text-white font-medium">₹{trade.price}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current P&L</p>
                <p className={`font-medium ${
                  (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ₹{trade.pnl?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Executed At</p>
                <p className="text-white font-medium">
                  {new Date(trade.executedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {trade.status === 'OPEN' && (
              <div className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StopCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-400">Stop Loss</span>
                  </div>
                  <span className="text-white">₹{trade.stopLoss || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-400">Take Profit</span>
                  </div>
                  <span className="text-white">₹{trade.takeProfit || 'Not Set'}</span>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Close Position
                  </button>
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Modify
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTrades.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No {filter.toLowerCase()} trades found
          </h3>
          <p className="text-gray-500">
            {filter === 'ALL' ? 'Execute your first trade to get started' : `No ${filter.toLowerCase()} trades at the moment`}
          </p>
        </div>
      )}

      {showNewTradeModal && (
        <NewTradeModal onClose={() => setShowNewTradeModal(false)} />
      )}
    </div>
  );
};

export default TradeExecution;