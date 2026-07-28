import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorStyles = {
    blue: 'from-blue-600/20 to-blue-900/10 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-900/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-900/10 text-amber-400 border-amber-500/20',
    purple: 'from-purple-600/20 to-purple-900/10 text-purple-400 border-purple-500/20'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`glass-card p-5 rounded-2xl border bg-gradient-to-br ${colorStyles[color] || colorStyles.blue}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
