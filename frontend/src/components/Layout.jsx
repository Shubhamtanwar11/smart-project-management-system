import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const links = [['/', 'Dashboard', LayoutDashboard], ['/projects', 'Projects', FolderKanban], ['/profile', 'Profile', User]];
export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:w-56 md:border-r md:border-b-0">
        <div className="p-4 text-lg font-bold text-indigo-600">TaskFlow</div>
        <nav className="flex gap-1 px-2 pb-2 md:flex-col">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 py-3 text-sm">
          <span>{user.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-slate-500 hover:text-red-600"><LogOut size={14} />Logout</button>
        </header>
        <main className="mx-auto max-w-5xl p-4"><Outlet /></main>
      </div>
    </div>
  );
}
