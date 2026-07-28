import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { testApi } from '../../services/testApi';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      testApi.getNotifications()
        .then(res => setNotifications(res.data || []))
        .catch(err => console.error(err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* College Info & Welcome */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600/10 border border-blue-500/30 p-2 rounded-lg text-blue-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">
            {user?.collegeId?.name || 'Multi-College Portal'}
          </h2>
          <span className="text-xs text-slate-400">
            Role: <span className="text-blue-400 font-medium">{user?.role}</span>
          </span>
        </div>
      </div>

      {/* User Controls & Notifications */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl border border-slate-800 shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300 uppercase">Notifications</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{unreadCount} new</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(n => (
                    <div key={n._id} className="p-3 text-xs hover:bg-slate-800/50 transition">
                      <p className="font-semibold text-slate-200">{n.title}</p>
                      <p className="text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-xs text-slate-500 text-center">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
