import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { apiService } from '../../services/api';

interface CreateStrategyModalProps {
  onClose: () => void;
}

const CreateStrategyModal: React.FC<CreateStrategyModalProps> = ({ onClose }) => {
  const { dispatch } = useTrading();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMA_CROSSOVER',
    timeFrame: '15m',
    ema1: 20,
    ema2: 50,
    rsiPeriod: 14,
    stopLoss: 2,
    takeProfit: 4,
    maxCapital: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const strategyData = {
        name: formData.name,
        type: formData.type,
        timeFrame: formData.timeFrame,
        emaFast: formData.emaFast,
        emaSlow: formData.emaSlow,
        rsiPeriod: formData.rsiPeriod,
        stopLossPercentage: formData.stopLoss,
        takeProfitPercentage: formData.takeProfit,
        maxCapitalPercentage: formData.maxCapital,
      };

      const newStrategy = await apiService.createStrategy(strategyData);
      dispatch({ type: 'ADD_STRATEGY', payload: newStrategy });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create strategy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-white">Create New Strategy</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Strategy Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter strategy name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Strategy Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EMA_CROSSOVER">EMA Crossover</option>
              <option value="RSI">RSI Strategy</option>
              <option value="MACD">MACD Strategy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Frame
            </label>
            <select
              value={formData.timeFrame}
              onChange={(e) => setFormData({ ...formData, timeFrame: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
            </select>
          </div>

          {formData.type === 'EMA_CROSSOVER' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fast EMA
                </label>
                <input
                  type="number"
                  value={formData.ema1}
                  onChange={(e) => setFormData({ ...formData, ema1: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slow EMA
                </label>
                <input
                  type="number"
                  value={formData.ema2}
                  onChange={(e) => setFormData({ ...formData, ema2: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-lg font-medium text-white mb-3">Risk Management</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.stopLoss}
                  onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.takeProfit}
                  onChange={(e) => setFormData({ ...formData, takeProfit: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Capital (%)
                </label>
                <input
                  type="number"
                  value={formData.maxCapital}
                  onChange={(e) => setFormData({ ...formData, maxCapital: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Strategy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStrategyModal;