import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ClipboardList,
  UserPlus,
  Clock,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Database,
  LogOut,
  ShieldCheck,
  MonitorPlay,
  Stethoscope,
  Info,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth, logoutUser } from '../services/authStore';

const navItems = [
  { to: '/',          label: 'Dashboard',     icon: Activity },
  { to: '/register',  label: 'Register',      icon: UserPlus },
  { to: '/queue',     label: 'Live Queue',    icon: ClipboardList },
  { to: '/care-hub',  label: 'Clinical Hub',  icon: Stethoscope },
  { to: '/history',   label: 'History',       icon: Clock },
  { to: '/reports',   label: 'Reports',       icon: BarChart3 },
  { to: '/ds-demo',   label: 'DS Visualizer', icon: Database },
  { to: '/about',     label: 'About',         icon: Info },
  { to: '/tv',        label: 'Launch TV',     icon: MonitorPlay },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  
  // Conditionally add User Registration if Admin
  const visibleNav = user?.role === 'Admin' 
    ? [...navItems, { to: '/user-register', label: 'Staff Access', icon: ShieldCheck }]
    : navItems;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center shadow-lg">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">TriageQ</div>
            <div className="text-slate-400 text-xs">Queue Management</div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mt-4 px-3 space-y-1">
          {visibleNav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            
            // Special handling to open TV in new tab
            if (to === '/tv') {
              return (
                <a
                  key={to}
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-700 hover:text-white mt-4 border border-slate-700"
                >
                  <Icon size={18} className="text-blue-400 group-hover:text-blue-300" />
                  <span className="text-sm font-medium text-blue-100">{label}</span>
                </a>
              );
            }

            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white',
                )}
              >
                <Icon size={18} className={cn(active ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                <span className="text-sm font-medium">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-700">
          <div className="text-slate-500 text-xs text-center">
            <div className="font-semibold text-slate-400">TriageQ v1.0</div>
            <div className="mt-0.5">Heap · DLL · MergeSort</div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-500 font-medium">System Online</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">{user?.fullName ?? 'Staff'}</div>
              <div className="text-xs text-gray-400">{user?.role ?? 'Role'}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
            </div>
            
            {/* Logout Button */}
            <div className="h-6 w-px bg-gray-200 mx-1 border-none" />
            <button
              onClick={logoutUser}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors title='Logout'"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
