import React, { useState } from 'react';
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { format } from 'date-fns';

const TransactionHistory: React.FC = () => {
  const { state } = useTrading();
  const [dateRange, setDateRange] = useState('7d');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const filteredTrades = state.trades.filter(trade => {
    const matchesType = typeFilter === 'ALL' || trade.type === typeFilter;
    
    const now = new Date();
    const tradeDate = new Date(trade.executedAt);
    let matchesDate = true;

    switch (dateRange) {
      case '1d':
        matchesDate = now.getTime() - tradeDate.getTime() <= 24 * 60 * 60 * 1000;
        break;
      case '7d':
        matchesDate = now.getTime() - tradeDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        matchesDate = now.getTime() - tradeDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        break;
    }

    return matchesType && matchesDate;
  });

  const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const handleExport = () => {
    const csvContent = [
      ['Symbol', 'Type', 'Quantity', 'Price', 'Status', 'P&L', 'Date'],
      ...filteredTrades.map(trade => [
        trade.symbol,
        trade.type,
        trade.quantity,
        trade.price,
        trade.status,
        trade.pnl || 0,
        format(new Date(trade.executedAt), 'yyyy-MM-dd HH:mm:ss')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          <p className="text-gray-400 mt-1">View and analyze your trading performance</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{totalPnL.toLocaleString()}
              </p>
            </div>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-400" />
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-white">{totalTrades}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg P&L</p>
              <p className="text-2xl font-bold text-white">
                ₹{totalTrades > 0 ? (totalPnL / totalTrades).toFixed(0) : '0'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="BUY">Buy Orders</option>
            <option value="SELL">Sell Orders</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left py-4 px-6">Date & Time</th>
                <th className="text-left py-4 px-6">Symbol</th>
                <th className="text-left py-4 px-6">Type</th>
                <th className="text-left py-4 px-6">Quantity</th>
                <th className="text-left py-4 px-6">Price</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-left py-4 px-6">Strategy</th>
                <th className="text-right py-4 px-6">P&L</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6 text-gray-300">
                    {format(new Date(trade.executedAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">{trade.symbol}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{trade.quantity}</td>
                  <td className="py-4 px-6 text-gray-300">₹{trade.price}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' : 
                      trade.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{trade.strategy || 'Manual'}</td>
                  <td className={`py-4 px-6 text-right font-medium ${
                    (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl ? `₹${trade.pnl.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTrades.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No transactions found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;