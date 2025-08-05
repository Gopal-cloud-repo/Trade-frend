import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, AlertTriangle } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import TradingChart from './TradingChart';
import MarketOverview from './MarketOverview';

const Dashboard: React.FC = () => {
  const { state } = useTrading();
  const { user, trades } = state;

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const todaysPnL = trades
    .filter(t => new Date(t.executedAt).toDateString() === new Date().toDateString())
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  const stats = [
    {
      title: 'Account Balance',
      value: `₹${user?.accountBalance.toLocaleString()}`,
      icon: DollarSign,
      change: '+2.4%',
      positive: true,
    },
    {
      title: 'Total P&L',
      value: `₹${totalPnL.toLocaleString()}`,
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      change: `${totalPnL >= 0 ? '+' : ''}${((totalPnL / (user?.accountBalance || 1)) * 100).toFixed(2)}%`,
      positive: totalPnL >= 0,
    },
    {
      title: "Today's P&L",
      value: `₹${todaysPnL.toLocaleString()}`,
      icon: todaysPnL >= 0 ? TrendingUp : TrendingDown,
      change: `${todaysPnL >= 0 ? '+' : ''}${todaysPnL.toFixed(2)}`,
      positive: todaysPnL >= 0,
    },
    {
      title: 'Open Positions',
      value: openTrades.length.toString(),
      icon: Activity,
      change: `${trades.length} total`,
      positive: true,
    },
  ];

  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">NIFTY Live Chart</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">15m</button>
                <button className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded">1h</button>
                <button className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded">1d</button>
              </div>
            </div>
            <TradingChart />
          </div>
        </div>

        <div className="space-y-6">
          <MarketOverview />
          
          {/* Active Strategies */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Active Strategies</h3>
            <div className="space-y-3">
              {state.strategies.filter(s => s.isActive).map(strategy => (
                <div key={strategy.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{strategy.name}</p>
                    <p className="text-xs text-gray-400">{strategy.parameters.timeFrame}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">{strategy.performance.winRate}%</p>
                    <p className="text-xs text-gray-400">Win Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left py-3">Symbol</th>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Quantity</th>
                <th className="text-left py-3">Price</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3">P&L</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map(trade => (
                <tr key={trade.id} className="border-b border-gray-700/50">
                  <td className="py-4 text-white font-medium">{trade.symbol}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{trade.quantity}</td>
                  <td className="py-4 text-gray-300">₹{trade.price}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' : 
                      trade.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className={`py-4 text-right font-medium ${
                    (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl ? `₹${trade.pnl.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;