import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PackedLogo } from '@/components/ui/PackedLogo';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';
import { ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [step, setStep] = useState<'request' | 'confirm'>(initialToken ? 'confirm' : 'request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.requestPasswordReset(email.trim());
      toast.success('Solicitação enviada!', { description: res.message });
      setStep('confirm');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao solicitar recuperação de senha.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.confirmPasswordReset(token.trim(), newPassword);
      toast.success('Senha atualizada com sucesso! Faça login com a nova senha.');
      navigate('/login', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Não foi possível redefinir a senha', { description: error.message });
      } else {
        toast.error('Erro ao redefinir a senha.');
      }
    } finally {
      setIsLoading(false);
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
            {step === 'request' ? 'Recuperar acesso' : 'Criar nova senha'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            {step === 'request'
              ? 'Informe seu e-mail cadastrado para receber as instruções de recuperação.'
              : 'Informe o código recebido no seu e-mail e defina sua nova senha.'}
          </p>
        </div>

        {isLoading ? (
          <div className="py-10">
            <LottieLoader size="md" message="Processando recuperação de senha..." />
          </div>
        ) : step === 'request' ? (
          <form onSubmit={handleRequest} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#0B2B33]">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="rounded-xl border-gray-200 py-3 px-3.5 focus:border-[#0B7A75] focus:ring-[#0B7A75]/20 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              Enviar link de recuperação
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="token" className="text-sm font-semibold text-[#0B2B33]">
                Código de verificação
              </Label>
              <Input
                id="token"
                type="text"
                placeholder="Cole o código do e-mail"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="rounded-xl border-gray-200 py-3 px-3.5 focus:border-[#0B7A75] focus:ring-[#0B7A75]/20 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="Nova senha"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              Salvar nova senha
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
