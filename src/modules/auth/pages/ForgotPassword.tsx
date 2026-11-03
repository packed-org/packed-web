import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import logoPacked from '@/assets/Logo_Packed.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';

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
      toast.success('Solicitação enviada', { description: res.message });
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
    <div className="min-h-screen w-full bg-petroleo flex flex-col items-center justify-between md:justify-center md:p-6 select-none">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md flex flex-col justify-between bg-clima md:rounded-3xl md:shadow-2xl md:overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6 min-h-40">
          <img src={logoPacked} alt="PACKED" className="w-32 md:w-40 object-contain" />
        </div>

        <div className="bg-petroleo-light rounded-t-[36px] md:rounded-t-none p-6 md:p-8 flex flex-col gap-5 shadow-lg">
          {step === 'request' ? (
            <form onSubmit={handleRequest} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-petroleo">Recuperar senha</h1>
                <p className="text-sm text-slate-600">
                  Informe seu e-mail cadastrado para receber o código de redefinição.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-petroleo">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-petroleo-soft text-petroleo h-12 px-4 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                variant="teal"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-base cursor-pointer"
              >
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="text-xs font-semibold text-teal hover:underline cursor-pointer"
              >
                Já tenho um token de redefinição
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-petroleo">Nova senha</h1>
                <p className="text-sm text-slate-600">
                  Informe o token recebido por e-mail e defina sua nova senha.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="token" className="text-sm font-semibold text-petroleo">
                  Token de recuperação
                </Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Cole o token recebido"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="bg-white border-petroleo-soft text-petroleo h-12 px-4 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-petroleo">
                  Nova senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mín. 8 caracteres (Aa1)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-white border-petroleo-soft text-petroleo h-12 px-4 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                variant="teal"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-base cursor-pointer"
              >
                {isLoading ? 'Salvando...' : 'Redefinir senha'}
              </Button>
            </form>
          )}

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

