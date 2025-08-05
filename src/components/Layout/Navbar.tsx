import React from 'react';
import { Bell, User, LogOut, Settings, TrendingUp } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const { state, dispatch } = useTrading();
  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'strategies', label: 'Strategies', icon: Settings },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'history', label: 'History', icon: TrendingUp },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">TradePro</span>
          </div>
          
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => onPageChange('notifications')}
            className="relative p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{state.user?.name}</p>
              <p className="text-xs text-gray-400">{state.user?.role}</p>
            </div>
            <User className="h-8 w-8 text-gray-300 bg-gray-700 rounded-full p-1" />
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;