import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoPacked from '@/assets/Logo_Packed.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulação de chamada de API (dados mockados)
      console.log('Dados enviados:', { email, password });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redireciona para o painel de viagens após o login bem-sucedido
      navigate('/viagens');
    } catch (error) {
      console.error('Erro ao realizar login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-petroleo flex flex-col items-center justify-between md:justify-center md:p-6 select-none">
      {/* Container Principal: Fullscreen no mobile, Card centralizado no desktop */}
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md flex flex-col justify-between bg-clima md:rounded-3xl md:shadow-2xl md:overflow-hidden">
        
        {/* Topo - Fundo Petróleo com Logo */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-55 md:min-h-65">
          <img
            src={logoPacked}
            alt="PACKED"
            className="w-36 md:w-44 max-w-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Card do Formulário - Bottom Sheet arredondado no Mobile */}
        <div className="bg-petroleo-light rounded-tl-[36px] md:rounded-t-none p-6 md:p-8 flex flex-col justify-between shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h1 className="text-3xl md:text-3xl font-bold text-petroleo tracking-tight">
              Bem-vindo de volta!
            </h1>

            {/* Campo Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-semibold text-petroleo flex gap-1">
                Email <span className="text-erro">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl focus-visible:ring-teal focus-visible:border-teal"
              />
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-semibold text-petroleo flex gap-1">
                Senha <span className="text-erro">*</span>
              </Label>
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
              className="w-full bg-teal hover:bg-teal-dark active:scale-[0.98] text-white font-bold h-12 rounded-xl text-base mt-2 transition-all duration-150 shadow-sm"
            >
              {isLoading ? 'Entrando...' : 'Login'}
            </Button>
            
            {/*Redirecionamento para Cadastro*/}
            <p className="text-center text-sm text-petroleo mt-1">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="font-bold text-teal hover:text-teal-dark hover:underline transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </form>

          {/* Espaçador inferior para Safe Area de dispositivos móveis */}
          <div className="h-6 md:h-0" />
        </div>

      </div>
    </div>
  );
}