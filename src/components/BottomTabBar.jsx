import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserCheck, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

const BottomTabBar = () => {
  const tabs = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/form', label: 'Check-In', icon: UserCheck },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/occurrence', label: 'Report', icon: AlertTriangle },
    { path: '/helpdesk', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="mx-3 mb-2 rounded-2xl glass-panel dark:glass-panel-dark bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.15)] p-1">
        <nav className="grid grid-cols-5 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 dark:bg-emerald-500 text-white shadow-md font-extrabold scale-105'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 font-semibold'
                  }`
                }
              >
                <Icon size={18} className="stroke-[2.2]" />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomTabBar;
