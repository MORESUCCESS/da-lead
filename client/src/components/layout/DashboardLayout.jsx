import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, Target, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen flex bg-[#000] lg:ml-64"
      style={{
        backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
    `,
        backgroundSize: "40px 40px",
      }}
    >
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#121212] border-r border-gray-800 flex flex-col z-30 transition-transform duration-400
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:z-auto`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8c63d2] to-[#8c63d2] flex items-center justify-center shadow">
            <Target size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[#E0E0E0]">Da-<span className='text-[#8c63d2]'>Lead</span></span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                ${isActive
                  ? 'bg-[#1E1E1E] text-[#E0E0E0]'
                  : 'text-[#A0A0A0] hover:bg-[#1E1E1E] hover:text-[#A0A0A0'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-3 space-y-1">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#522398] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#8c63d2] truncate">{user?.name}</p>
              <p className="text-xs text-[#A0A0A0] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-[#1E1E1E] transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="h-16 bg-[#121212] border-b border-gray-800 flex items-center px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu size={22} className='text-[#a0a0a0]'/>
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#8c63d2] to-[#8c63d2] flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-bold text-[#e0e0e0]">Da-<span className='text-[#8c63d2]'>Lead</span></span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
