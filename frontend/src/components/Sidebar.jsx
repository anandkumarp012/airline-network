import { BarChart3, Building2, Compass, GitBranchPlus, MapPinned, Network, Route, Search, ShieldCheck, Waypoints } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Network Graph', path: '/network', icon: Network },
  { label: 'Airport Analysis', path: '/airports', icon: Building2 },
  { label: 'Centrality Analysis', path: '/centrality', icon: Waypoints },
  { label: 'Route Explorer', path: '/routes', icon: Route },
  { label: 'Shortest Path', path: '/shortest-path', icon: Compass },
  { label: 'Communities', path: '/communities', icon: GitBranchPlus },
  { label: 'Network Statistics', path: '/statistics', icon: ShieldCheck },
  { label: 'About Project', path: '/about', icon: Search },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} hidden min-h-screen border-r border-sky-100 bg-white p-4 lg:flex lg:flex-col`}>
      <div className="mb-6 flex items-center justify-between px-2">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <MapPinned size={18} />
          </div>
          {!collapsed && <div>
            <div className="text-lg font-semibold text-slate-900">Airline</div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Intelligence</div>
          </div>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700"
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `sidebar-link flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${isActive ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-transparent text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'} ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <Icon size={18} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
