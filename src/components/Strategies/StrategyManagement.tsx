import React, { useState } from 'react';
import { Plus, Play, Pause, Settings, TrendingUp, Target } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import CreateStrategyModal from './CreateStrategyModal';

const StrategyManagement: React.FC = () => {
  const { state, dispatch } = useTrading();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleStrategy = (id: string, isActive: boolean) => {
    dispatch({
      type: 'UPDATE_STRATEGY',
      payload: { id, updates: { isActive: !isActive } }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Strategy Management</h2>
          <p className="text-gray-400 mt-1">Configure and monitor your trading strategies</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Strategy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.strategies.map(strategy => (
          <div key={strategy.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  strategy.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                  <p className="text-sm text-gray-400">{strategy.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStrategy(strategy.id, strategy.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    strategy.isActive 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {strategy.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-white">{strategy.performance.totalTrades}</p>
                <p className="text-sm text-gray-400">Total Trades</p>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{strategy.performance.winRate}%</p>
                <p className="text-sm text-gray-400">Win Rate</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Time Frame:</span>
                <span className="text-white">{strategy.parameters.timeFrame}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="text-white">{strategy.parameters.riskManagement.stopLoss}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Take Profit:</span>
                <span className="text-white">{strategy.parameters.riskManagement.takeProfit}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Capital:</span>
                <span className="text-white">{strategy.parameters.riskManagement.maxCapital}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Avg P&L</span>
              </div>
              <span className={`font-medium ${
                strategy.performance.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ₹{strategy.performance.avgPnL.toLocaleString()}
              </span>
            </div>

            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              strategy.isActive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {strategy.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateStrategyModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default StrategyManagement;