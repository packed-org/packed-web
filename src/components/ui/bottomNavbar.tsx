import { NavLink } from 'react-router-dom';
import { Home, Plane, Compass, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const navItems = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Viagens', path: '/viagens', icon: Plane },
    { name: 'Explorar', path: '/explorar', icon: Compass },
    { name: 'Ajustes', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 flex items-center justify-around pb-safe">
      {/* 'pb-safe' é recomendado para apps Capacitor devido ao entalhe de alguns iPhones */}
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1',
              isActive ? 'text-teal' : 'text-slate-400 hover:text-slate-500'
            )
          }
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
}