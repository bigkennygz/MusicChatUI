import { NavLink } from 'react-router-dom';
import { cn } from '@lib/utils';
import { Home, Upload, BarChart3, MessageSquare, Library } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Analysis', href: '/analysis', icon: BarChart3 },
  { name: 'Query', href: '/query', icon: MessageSquare },
  { name: 'Library', href: '/library', icon: Library },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                'hover:bg-gray-100',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}