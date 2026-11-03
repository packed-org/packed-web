import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, ShieldCheck, Wifi, WifiOff, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="w-full max-w-2xl mx-auto px-5 pt-8 pb-12 flex flex-col gap-6 select-none">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-petroleo tracking-tight">Minha Conta</h1>
        <p className="text-sm text-slate-500 font-medium">
          Gerencie suas informações de acesso e preferências do aplicativo.
        </p>
      </div>

      {/* Card do Usuário */}
      <Card className="bg-petroleo text-white border-none rounded-3xl p-6 shadow-md">
        <CardContent className="p-0 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal flex items-center justify-center text-xl font-extrabold text-white shadow-sm">
                {user?.email?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <p className="text-base font-bold text-white break-all">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-teal/20 text-teal-soft border-none text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Viajante'}
                  </Badge>
                  {user?.is_active && (
                    <Badge className="bg-sucesso/25 text-sucesso-soft border-none text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Conta verificada
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes Técnicos & Status PWA */}
      <Card className="bg-white border-none rounded-3xl p-6 shadow-xs">
        <CardContent className="p-0 flex flex-col gap-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-3 text-petroleo">
              <Mail className="w-5 h-5 text-teal" />
              <span className="text-sm font-semibold">E-mail verificado em</span>
            </div>
            <span className="text-sm font-bold text-slate-600">
              {formatDate(user?.email_verified_at)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-3 text-petroleo">
              <Calendar className="w-5 h-5 text-teal" />
              <span className="text-sm font-semibold">Membro desde</span>
            </div>
            <span className="text-sm font-bold text-slate-600">
              {formatDate(user?.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-3 text-petroleo">
              <ShieldCheck className="w-5 h-5 text-teal" />
              <span className="text-sm font-semibold">Motor de Recomendação</span>
            </div>
            <span className="text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full">
              Determinístico + Clima Ativo
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 text-petroleo">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-sucesso" />
              ) : (
                <WifiOff className="w-5 h-5 text-beleza" />
              )}
              <span className="text-sm font-semibold">Status da Conexão (PWA)</span>
            </div>
            <Badge
              className={
                isOnline
                  ? 'bg-sucesso-light text-sucesso-dark border-none font-bold'
                  : 'bg-beleza-light text-beleza-dark border-none font-bold'
              }
            >
              {isOnline ? 'Online · Sincronizado' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Botão Sair */}
      <Button
        type="button"
        onClick={handleLogout}
        variant="outline"
        className="w-full h-13 rounded-2xl border-erro/30 text-erro hover:bg-erro-light font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        Encerrar sessão neste dispositivo
      </Button>
    </div>
  );
}
