import React from 'react';
import { Bell, Check, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { format } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const { state, dispatch } = useTrading();

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const markAllAsRead = () => {
    state.notifications.forEach(notification => {
      if (!notification.read) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TRADE_EXECUTED': return TrendingUp;
      case 'STRATEGY_TRIGGERED': return Settings;
      case 'RISK_ALERT': return AlertTriangle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'HIGH') {
      return 'border-red-500 bg-red-500/5';
    }
    switch (type) {
      case 'TRADE_EXECUTED': return 'border-green-500 bg-green-500/5';
      case 'STRATEGY_TRIGGERED': return 'border-blue-500 bg-blue-500/5';
      case 'RISK_ALERT': return 'border-red-500 bg-red-500/5';
      default: return 'border-gray-600 bg-gray-700/50';
    }
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Check className="h-5 w-5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {state.notifications.map(notification => {
          const Icon = getNotificationIcon(notification.type);
          const colorClass = getNotificationColor(notification.type, notification.priority);
          
          return (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${colorClass} ${
                !notification.read ? 'shadow-lg' : 'opacity-75'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  notification.type === 'TRADE_EXECUTED' ? 'bg-green-500/20 text-green-400' :
                  notification.type === 'STRATEGY_TRIGGERED' ? 'bg-blue-500/20 text-blue-400' :
                  notification.type === 'RISK_ALERT' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{notification.title}</h3>
                      <p className="text-gray-300 mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {format(new Date(notification.timestamp), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.priority === 'HIGH' && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded font-medium">
                          HIGH
                        </span>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {state.notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No notifications</h3>
          <p className="text-gray-500">You'll see trade alerts and system updates here</p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;