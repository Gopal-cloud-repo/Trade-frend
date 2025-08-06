import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { apiService } from '../../services/api';

interface NewTradeModalProps {
  onClose: () => void;
}

const NewTradeModal: React.FC<NewTradeModalProps> = ({ onClose }) => {
  const { dispatch } = useTrading();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'BUY' as 'BUY' | 'SELL',
    quantity: 0,
    price: 0,
    stopLoss: 0,
    takeProfit: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const tradeData = {
        symbol: formData.symbol,
        type: formData.type,
        quantity: formData.quantity,
        price: formData.price,
        stopLoss: formData.stopLoss || null,
        takeProfit: formData.takeProfit || null,
      };

      const newTrade = await apiService.executeTrade(tradeData);
      dispatch({ type: 'ADD_TRADE', payload: newTrade });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Execute New Trade</h3>
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
              Symbol
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., NIFTY24JAN22000CE"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trade Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'BUY' })}
                className={`p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
                  formData.type === 'BUY'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>BUY</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'SELL' })}
                className={`p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
                  formData.type === 'SELL'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                <span>SELL</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="125.50"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-lg font-medium text-white mb-3">Risk Management (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.stopLoss}
                  onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Take Profit (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.takeProfit}
                  onChange={(e) => setFormData({ ...formData, takeProfit: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="150.00"
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
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                formData.type === 'BUY'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Executing...' : `Execute ${formData.type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTradeModal;