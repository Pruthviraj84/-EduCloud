import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Trophy,
  Users,
  Building2,
  Cpu,
  BarChart3,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Materials', path: '/student/materials', icon: BookOpen },
    { name: 'Tests & Exams', path: '/student/tests', icon: FileText },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/student/profile', icon: UserCheck }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'AI Question Generator', path: '/admin/ai-generator', icon: Cpu },
    { name: 'Create Test', path: '/admin/create-test', icon: FileText },
    { name: 'Upload Material', path: '/admin/upload-material', icon: BookOpen },
    { name: 'Manage Colleges', path: '/admin/colleges', icon: Building2 },
    { name: 'Students Directory', path: '/admin/students', icon: Users },
    { name: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy }
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 min-h-screen p-4 flex flex-col justify-between sticky top-0 h-screen">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/25">
            E
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">EduCloud</h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">SaaS Exam Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-400">EduCloud Multi-Tenant v1.0</p>
        <p>Tenant Isolated SaaS System</p>
      </div>
    </aside>
  );
};
