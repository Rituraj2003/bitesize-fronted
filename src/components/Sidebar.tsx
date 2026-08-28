import { LayoutDashboard, FileText, Flame, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';
import { type UserData } from './AuthModal';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  user?: UserData | null;
  onLogout?: () => void;
}

export default function Sidebar({ currentView, setView, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-snippets', label: 'All Notes', icon: FileText },
    { id: 'review-queue', label: 'Daily Review', icon: Flame },
    { id: 'create-new', label: 'New Snippet', icon: PlusCircle },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 border-r border-slate-800">
      <div>
        {/* App Logo/Header */}
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <div className="bg-blue-600 p-1.5 rounded-lg font-bold text-xl text-white tracking-wider">
            B⚡
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-slate-50">
            BiteSize
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        {user && (
          <div className="flex items-center gap-2 px-2 text-xs text-slate-400">
            <UserIcon size={14} className="text-slate-500 shrink-0" />
            <span className="truncate">{user.name || user.email}</span>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        )}

        <div className="text-[10px] text-slate-600 px-2 pt-1">
          v1.0.0 • Micro-Learning Platform
        </div>
      </div>
    </div>
  );
}