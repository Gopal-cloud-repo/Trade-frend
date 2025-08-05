import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateChartData } from '../../data/mockData';

const TradingChart: React.FC = () => {
  const chartData = generateChartData();

  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">
            {new Date(label).toLocaleString()}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-white">
              <span className="text-gray-400">Close:</span> ₹{data.close.toFixed(2)}
            </p>
            <p className="text-blue-400">
              <span className="text-gray-400">EMA 20:</span> ₹{data.ema20?.toFixed(2)}
            </p>
            <p className="text-purple-400">
              <span className="text-gray-400">EMA 50:</span> ₹{data.ema50?.toFixed(2)}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Volume:</span> {data.volume.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            name="Price"
          />
          <Line 
            type="monotone" 
            dataKey="ema20" 
            stroke="#10B981" 
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            name="EMA 20"
          />
          <Line 
            type="monotone" 
            dataKey="ema50" 
            stroke="#8B5CF6" 
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            name="EMA 50"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;