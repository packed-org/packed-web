import { NavLink } from 'react-router-dom';
import { Home, Plane, Compass, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function Sidebar() {
  const navItems = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Viagens', path: '/viagens', icon: Plane },
    { name: 'Explorar', path: '/explorar', icon: Compass },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col gap-6 py-8 px-4">
      {/* Logo Desktop */}
      <div className="flex items-center gap-2 px-2">
        <div className="bg-teal p-2 rounded-xl">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-extrabold text-petroleo tracking-tight">Pack&Go</span>
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-2 flex-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: isActive ? 'default' : 'ghost' }),
                'w-full justify-start gap-3 h-12 px-4 rounded-xl font-bold transition-all',
                isActive 
                  ? 'bg-petroleo text-white hover:bg-petroleo/90' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-petroleo'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}