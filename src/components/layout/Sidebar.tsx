import { NavLink, useNavigate } from 'react-router-dom';
import { Luggage, PlusCircle, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { PackedLogo } from '@/components/ui/PackedLogo';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/store/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Minhas Viagens', path: '/viagens', icon: Luggage },
    { name: 'Nova Viagem', path: '/viagens/nova', icon: PlusCircle },
    { name: 'Minha Conta', path: '/perfil', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão encerrada com sucesso.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col justify-between py-8 px-6 bg-[#0B2B33] text-white select-none shadow-xl border-r border-[#0B2B33]/20">
      <div className="flex flex-col gap-8">
        {/* Marca Oficial Horizontal na Sidebar Desktop */}
        <div className="px-2 pt-1">
          <PackedLogo variant="horizontal" className="h-9 w-auto brightness-110" />
        </div>

        {/* Navegação Principal */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/viagens'}
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: 'ghost' }),
                  'w-full justify-start gap-3 h-12 px-4 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-[#0B7A75] text-white hover:bg-[#085E5A] hover:text-white shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Rodapé da Conta */}
      <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
        {user && (
          <div className="px-2">
            <p className="text-[11px] font-semibold text-[#F2B640] uppercase tracking-wider">
              Viajante conectado
            </p>
            <p className="text-sm font-medium text-white truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-sm font-semibold text-[#C93E22] hover:bg-[#C93E22]/20 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
