import React, { useEffect, useState } from 'react';
import { testApi } from '../../services/testApi';
import { Bell, CheckCircle } from 'lucide-react';

export const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testApi.getNotifications()
      .then(res => setNotifications(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = (id) => {
    testApi.markNotificationRead(id).then(() => {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Notifications & Alerts</h1>
        <p className="text-xs text-slate-400 mt-1">Official college exam updates and system announcements</p>
      </div>

      <div className="space-y-4">
        {notifications.map(n => (
          <div
            key={n._id}
            className={`glass-card p-5 rounded-2xl border transition flex items-start justify-between ${
              n.isRead ? 'border-slate-800/80 opacity-75' : 'border-blue-500/30 bg-blue-950/10'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{n.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {!n.isRead && (
              <button
                onClick={() => handleMarkRead(n._id)}
                className="text-xs text-blue-400 hover:underline flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Mark read
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl text-slate-500">
            No notifications at this time.
          </div>
        )}
      </div>
    </div>
  );
};
