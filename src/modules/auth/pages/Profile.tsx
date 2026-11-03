import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, ShieldCheck, Wifi, WifiOff, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/store/AuthContext';
import { useNetworkStatus } from '@/platform/pwa/useNetworkStatus';

export function Profile() {
  const { user, logout } = useAuth();
  const isOnline = useNetworkStatus();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Você saiu da sua conta.');
    navigate('/login', { replace: true });
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-8 pb-16 flex flex-col gap-6 select-none">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33]">
          Minha Conta
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Gerencie suas informações de acesso e preferências do Packed.
        </p>
      </div>

      {/* Card do Usuário */}
      <Card className="bg-[#0B2B33] text-white border-none rounded-3xl p-6 shadow-md">
        <CardContent className="p-0 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0B7A75] flex items-center justify-center text-xl font-extrabold text-white shadow-sm">
                {user?.email?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <p className="text-base font-bold text-white break-all">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#0B7A75]/30 text-white border border-[#0B7A75]/40 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Viajante'}
                  </span>
                  {user?.is_active && (
                    <span className="bg-[#E3F1EF] text-[#085E5A] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Conta ativa
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes Técnicos & Status PWA */}
      <Card className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
        <CardContent className="p-0 flex flex-col gap-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-3 text-[#0B2B33]">
              <Mail className="w-5 h-5 text-[#0B7A75]" />
              <span className="text-sm font-semibold">E-mail cadastrado</span>
            </div>
            <span className="text-xs text-gray-600 font-medium">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-3 text-[#0B2B33]">
              <Calendar className="w-5 h-5 text-[#0B7A75]" />
              <span className="text-sm font-semibold">Membro desde</span>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {formatDate(user?.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-3 text-[#0B2B33]">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-[#0B7A75]" />
              ) : (
                <WifiOff className="w-5 h-5 text-[#C93E22]" />
              )}
              <span className="text-sm font-semibold">Conectividade PWA</span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isOnline
                  ? 'bg-[#E3F1EF] text-[#085E5A]'
                  : 'bg-[#FDF2F0] text-[#C93E22]'
              }`}
            >
              {isOnline ? 'Online (Sincronizado)' : 'Offline (Modo local)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 text-[#0B2B33]">
              <ShieldCheck className="w-5 h-5 text-[#0B7A75]" />
              <span className="text-sm font-semibold">Segurança</span>
            </div>
            <span className="text-xs text-gray-600 font-medium">JWT com Refresh Seguro</span>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Logout */}
      <Button
        onClick={handleLogout}
        className="h-12 rounded-2xl bg-white border border-[#C93E22]/30 text-[#C93E22] hover:bg-[#FDF2F0] font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </Button>
    </div>
  );
}
