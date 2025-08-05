import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

const MarketOverview: React.FC = () => {
  const { state } = useTrading();
  const { marketData } = state;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Market Overview</h3>
      <div className="space-y-4">
        {marketData.map((data, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <p className="text-white font-medium">{data.symbol}</p>
              <p className="text-gray-400 text-sm">₹{data.price.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className={`flex items-center space-x-1 ${
                data.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">{data.changePercent.toFixed(2)}%</span>
              </div>
              <p className="text-gray-400 text-sm">
                {data.change >= 0 ? '+' : ''}₹{data.change.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;