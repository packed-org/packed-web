import { NavLink } from 'react-router-dom';
import { Luggage, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const navItems = [
    { name: 'Viagens', path: '/viagens', icon: Luggage, end: true },
    { name: 'Nova Viagem', path: '/viagens/nova', icon: PlusCircle, end: false },
    { name: 'Perfil', path: '/perfil', icon: User, end: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-around pb-safe shadow-lg select-none">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
              isActive
                ? 'text-[#0B7A75] font-bold'
                : 'text-gray-400 hover:text-[#0B2B33] font-medium'
            )
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[11px]">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
