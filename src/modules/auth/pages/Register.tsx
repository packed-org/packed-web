import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoPacked from '@/assets/Logo_Packed.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Dados de cadastro enviados:', { name, email, password });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redireciona para o login após concluir o cadastro
      navigate('/login');
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-petroleo flex flex-col items-center justify-between md:justify-center md:p-6 select-none">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md flex flex-col justify-between bg-clima md:rounded-3xl md:shadow-2xl md:overflow-hidden">
        
        {/* Topo - Fundo Petróleo com Logo */}
        <div className="flex-1 flex items-center justify-center p-6 min-h-[160px] md:min-h-[200px]">
          <img
            src={logoPacked}
            alt="PACKED"
            className="w-32 md:w-40 max-w-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Card do Formulário */}
        <div className="bg-petroleo-light rounded-t-[36px] md:rounded-t-none p-6 md:p-8 flex flex-col justify-between shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Título e Subtítulo do Figma */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-petroleo tracking-tight">
                Seja bem-vindo!
              </h1>
              <p className="text-sm text-slate-600 leading-snug">
                Para realizar seu cadastro preencha as informações abaixo:
              </p>
            </div>

            {/* Campo Nome */}
            <div className="flex flex-col gap-1.5 mt-1">
              <Label htmlFor="name" className="text-sm font-semibold text-petroleo flex gap-1">
                Nome <span className="text-erro">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Insira seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white border-petroleo-soft text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl focus-visible:ring-teal focus-visible:border-teal"
              />
            </div>

            {/* Campo Email */}
            <div className="flex flex-col gap-1.5">
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
            <div className="flex flex-col gap-1.5">
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

            {/* Botão Cadastro */}
            <Button
              type="submit"
              variant="teal"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-bold mt-2 shadow-sm"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastro'}
            </Button>

            {/* Link de Retorno para Login */}
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

          {/* Espaçador para Safe Area em Mobile */}
          <div className="h-6 md:h-0" />
        </div>

      </div>
    </div>
  );
}