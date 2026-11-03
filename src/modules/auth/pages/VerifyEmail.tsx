import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackedLogo } from '@/components/ui/PackedLogo';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [email] = useState(searchParams.get('email') || '');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Informe o código de verificação.');
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
        toast.error('Erro ao validar o código.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Informe seu e-mail para reenviar o código.');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(email.trim());
      toast.success('Novo código enviado para sua caixa de entrada.');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Não foi possível reenviar o código.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F7F6] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <PackedLogo variant="header" size="sm" />
          <Link
            to="/login"
            className="text-xs font-semibold text-gray-500 hover:text-[#0B7A75] inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao login
          </Link>
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#0B2B33]">
            Verifique seu e-mail
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Enviamos um código de confirmação para{' '}
            <strong className="text-[#0B2B33]">{email || 'seu e-mail'}</strong>. Insira-o abaixo para ativar sua conta.
          </p>
        </div>

        {isConfirming ? (
          <div className="py-10">
            <LottieLoader size="md" message="Confirmando seu e-mail..." />
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="token" className="text-sm font-semibold text-[#0B2B33]">
                Código de ativação
              </Label>
              <Input
                id="token"
                type="text"
                placeholder="Ex: 123456"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                autoFocus
                className="rounded-xl border-gray-200 py-3 px-3.5 focus:border-[#0B7A75] focus:ring-[#0B7A75]/20 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isConfirming}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              Ativar minha conta
            </Button>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 text-center text-xs text-gray-500">
              <p>Não recebeu o código?</p>
              <button
                type="button"
                disabled={isResending}
                onClick={handleResend}
                className="font-semibold text-[#0B7A75] hover:text-[#085E5A] inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                Reenviar código
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
