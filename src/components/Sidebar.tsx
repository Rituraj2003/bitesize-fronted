// import React from 'react';
import { LayoutDashboard, FileText, Flame, PlusCircle } from 'lucide-react';

// 1. REVISION: TypeScript Interface for Props
// This defines exactly what data this component expects from its parent.
interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Sidebar({ currentView, setView }: SidebarProps) {
  
  // 2. REVISION: Array Mapping for UI Elements
  // Instead of copying and pasting HTML for 4 buttons, we map through an array.
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-snippets', label: 'All Notes', icon: FileText },
    { id: 'review-queue', label: 'Daily Review', icon: Flame, badge: 5 },
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
            // 3. REVISION: Dynamic Tailwind Class Names
            // We check if this item is the currently active view to change its color.
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)} // Triggers state change in parent
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

                {/* Optional Badge for Daily Review */}
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-600' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Footer */}
      <div className="text-xs text-slate-500 px-2 border-t border-slate-800 pt-4">
        v1.0.0 • Micro-Learning
      </div>
    </div>
  );
}