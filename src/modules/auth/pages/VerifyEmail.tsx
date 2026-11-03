import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import logoPacked from '@/assets/Logo_Packed.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Informe o token de verificação.');
      return;
    }

    setIsConfirming(true);
    try {
      await authService.confirmEmail(token.trim());
      toast.success('E-mail verificado com sucesso! Agora você já pode entrar.');
      navigate('/login', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Falha na verificação', { description: error.message });
      } else {
        toast.error('Erro ao validar o token.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Informe seu e-mail para reenviar o link.');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(email.trim());
      toast.success('Se a conta existir e estiver pendente, um novo e-mail foi enviado.');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Não foi possível reenviar o e-mail.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-petroleo flex flex-col items-center justify-between md:justify-center md:p-6 select-none">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md flex flex-col justify-between bg-clima md:rounded-3xl md:shadow-2xl md:overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6 min-h-40">
          <img src={logoPacked} alt="PACKED" className="w-32 md:w-40 object-contain" />
        </div>

        <div className="bg-petroleo-light rounded-t-[36px] md:rounded-t-none p-6 md:p-8 flex flex-col gap-5 shadow-lg">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-petroleo">Ativar conta</h1>
            <p className="text-sm text-slate-600">
              Cole o código de verificação recebido no seu e-mail para liberar o acesso.
            </p>
          </div>

          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="token" className="text-sm font-semibold text-petroleo">
                Token de ativação
              </Label>
              <Input
                id="token"
                type="text"
                placeholder="Cole o token recebido por e-mail"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo h-12 px-4 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              variant="teal"
              disabled={isConfirming}
              className="w-full h-12 rounded-xl font-bold text-base cursor-pointer"
            >
              {isConfirming ? 'Confirmando...' : 'Confirmar e-mail'}
            </Button>
          </form>

          <div className="border-t border-petroleo-soft pt-4 flex flex-col gap-3">
            <Label htmlFor="resend-email" className="text-xs font-semibold text-slate-600">
              Não recebeu o código? Informe seu e-mail para reenviar:
            </Label>
            <div className="flex gap-2">
              <Input
                id="resend-email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-petroleo-soft text-petroleo h-11 px-3 rounded-xl text-sm"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isResending}
                onClick={handleResend}
                className="h-11 rounded-xl border-teal text-teal font-bold px-4 cursor-pointer"
              >
                {isResending ? '...' : 'Reenviar'}
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-petroleo">
            <Link to="/login" className="font-bold text-teal hover:underline">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

