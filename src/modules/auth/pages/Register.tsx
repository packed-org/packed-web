import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import logoPacked from '@/assets/Logo_Packed.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';

export function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres, com letras maiúsculas, minúsculas e números.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup(email.trim(), password);
      toast.success('Conta criada!', {
        description: 'Verifique seu e-mail para ativar sua conta.',
      });
      navigate(`/verificar-email?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Erro no cadastro', { description: error.message });
      } else {
        toast.error('Não foi possível conectar ao servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-petroleo flex flex-col items-center justify-between md:justify-center md:p-6 select-none">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md flex flex-col justify-between bg-clima md:rounded-3xl md:shadow-2xl md:overflow-hidden">
        {/* Topo com Logo */}
        <div className="flex-1 flex items-center justify-center p-6 min-h-40 md:min-h-48">
          <img
            src={logoPacked}
            alt="PACKED"
            className="w-32 md:w-40 max-w-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Card do Formulário */}
        <div className="bg-petroleo-light rounded-t-[36px] md:rounded-t-none p-6 md:p-8 flex flex-col justify-between shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-petroleo tracking-tight">
                Crie sua conta
              </h1>
              <p className="text-sm text-slate-600 leading-snug">
                Salve suas viagens e listas personalizadas na nuvem.
              </p>
            </div>

            {/* Campo Email */}
            <div className="flex flex-col gap-1.5 mt-1">
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
              <Label htmlFor="password" className="text-sm font-semibold text-petroleo flex gap-1">
                Senha <span className="text-erro">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mín. 8 caracteres (Aa1)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl focus-visible:ring-teal focus-visible:border-teal"
              />
              <span className="text-[11px] text-slate-500">
                Use no mínimo 8 caracteres com letra maiúscula, minúscula e número.
              </span>
            </div>

            {/* Confirmar Senha */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-petroleo flex gap-1">
                Confirmar senha <span className="text-erro">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl focus-visible:ring-teal focus-visible:border-teal"
              />
            </div>

            <Button
              type="submit"
              variant="teal"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-bold mt-2 shadow-sm cursor-pointer"
            >
              {isLoading ? 'Criando conta...' : 'Cadastrar'}
            </Button>

            <p className="text-center text-sm text-petroleo mt-1">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-bold text-teal hover:text-teal-dark hover:underline transition-colors"
              >
                Faça login
              </Link>
            </p>
          </form>

          <div className="h-4 md:h-0" />
        </div>
      </div>
    </div>
  );
}
