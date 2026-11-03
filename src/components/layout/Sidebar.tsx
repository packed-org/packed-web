import { NavLink, useNavigate } from 'react-router-dom';
import { Luggage, PlusCircle, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import logoPacked from '@/assets/Logo_Packed.svg';
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
    <div className="flex h-full flex-col justify-between py-8 px-5 bg-petroleo text-white select-none">
      <div className="flex flex-col gap-8">
        {/* Marca Oficial */}
        <div className="flex items-center gap-3 px-2">
          <img src={logoPacked} alt="PACKED" className="h-9 w-auto object-contain" />
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
                  'w-full justify-start gap-3 h-12 px-4 rounded-xl font-bold text-sm transition-all',
                  isActive
                    ? 'bg-teal text-white hover:bg-teal-dark hover:text-white shadow-sm'
                    : 'text-petroleo-soft hover:bg-white/10 hover:text-white'
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
            <p className="text-xs font-semibold text-teal-soft uppercase tracking-wider">
              Viajante conectado
            </p>
            <p className="text-sm font-medium text-white truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-sm font-bold text-erro-soft hover:bg-erro/20 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

