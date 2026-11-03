import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logoPacked from '@/assets/Logo_Packed.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/AuthContext';
import { ApiError } from '@/services/api';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      toast.success('Login realizado com sucesso!');
      navigate('/viagens', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Não foi possível entrar', {
          description: error.message,
        });
      } else {
        toast.error('Erro de conexão com o servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-petroleo flex flex-col items-center justify-between md:justify-center md:p-6 select-none">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md flex flex-col justify-between bg-clima md:rounded-3xl md:shadow-2xl md:overflow-hidden">
        {/* Topo com Logo */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-48 md:min-h-56 gap-2">
          <img
            src={logoPacked}
            alt="PACKED"
            className="w-36 md:w-44 max-w-full object-contain transition-transform duration-300 hover:scale-105"
          />
          <span className="text-xs font-medium text-clima-soft">
            Planeje sua mala com inteligência climática
          </span>
        </div>

        {/* Card do Formulário */}
        <div className="bg-petroleo-light rounded-t-[36px] md:rounded-t-none p-6 md:p-8 flex flex-col justify-between shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-petroleo tracking-tight">
                Bem-vindo de volta!
              </h1>
              <p className="text-sm text-slate-600">
                Acesse sua conta para gerenciar suas viagens e listas de bagagem.
              </p>
            </div>

            {/* Campo Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-petroleo flex gap-1">
                E-mail <span className="text-erro">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl focus-visible:ring-teal focus-visible:border-teal"
              />
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-petroleo flex gap-1">
                  Senha <span className="text-erro">*</span>
                </Label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs font-bold text-teal hover:text-teal-dark hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl focus-visible:ring-teal focus-visible:border-teal"
              />
            </div>

            {/* Botão Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal hover:bg-teal-dark active:scale-[0.98] text-white font-bold h-12 rounded-xl text-base mt-1 transition-all duration-150 shadow-sm cursor-pointer"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Links auxiliares */}
            <div className="flex flex-col gap-2 text-center text-sm text-petroleo mt-1">
              <p>
                Não tem uma conta?{' '}
                <Link
                  to="/cadastro"
                  className="font-bold text-teal hover:text-teal-dark hover:underline transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
              <p className="text-xs text-slate-500">
                Recebeu um código de ativação?{' '}
                <Link
                  to="/verificar-email"
                  className="font-semibold text-petroleo hover:text-teal underline"
                >
                  Confirmar e-mail
                </Link>
              </p>
            </div>
          </form>

          <div className="h-4 md:h-0" />
        </div>
      </div>
    </div>
  );
}
