import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PackedLogo } from '@/components/ui/PackedLogo';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { useAuth } from '@/store/AuthContext';
import { ApiError } from '@/services/api';
import { Check } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha seu e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);
      toast.success('Bem-vindo ao Packed!');
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
    <div className="min-h-screen w-full bg-[#F3F7F6] flex flex-col md:flex-row">
      {/* Coluna Esquerda: Vitrine da Marca (Visível em Desktop/Tablet) */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-[#0B7A75] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#085E5A]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Topo / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <PackedLogo variant="horizontal" className="h-9 w-auto brightness-110" />
        </div>

        {/* Mensagem de Marketing e Proposta de Valor */}
        <div className="relative z-10 my-10 md:my-auto flex flex-col gap-6 max-w-lg">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-white">
            Sua mala, sem esquecer nada.
          </h1>
          <p className="text-white/90 text-base lg:text-lg leading-relaxed font-normal">
            Conte o destino, o período e o que vai fazer. A gente olha o clima e monta a lista para você conferir.
          </p>

          {/* Stepper Pills */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white">
              1 · Destino
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white">
              2 · Clima
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white">
              3 · Lista
            </span>
          </div>

          {/* Card de Demonstração (Lisboa · 7 noites) */}
          <div className="mt-4 bg-white text-[#0B2B33] rounded-2xl p-5 shadow-xl border border-white/20 max-w-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <span className="font-bold text-sm">Lisboa · 7 noites</span>
              <span className="text-xs text-gray-500 font-medium">3 de 5 separados</span>
            </div>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#0B7A75] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="font-medium text-gray-700">Passaporte</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#0B7A75] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="font-medium text-gray-700">Casaco impermeável</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md border-2 border-gray-300 shrink-0" />
                <span className="text-gray-500">Adaptador de tomada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="relative z-10 text-xs text-white/60">
          Packed App &copy; {new Date().getFullYear()} · Viagens inteligentes
        </div>
      </div>

      {/* Coluna Direita: Formulário de Login */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white md:bg-transparent rounded-2xl md:rounded-none p-6 sm:p-8 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none">
          {/* Logo no mobile */}
          <div className="flex md:hidden items-center justify-center mb-6">
            <PackedLogo variant="header" size="md" />
          </div>

          <div className="mb-8">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33]">
              Entrar
            </h2>
            <p className="text-sm text-gray-600 mt-1.5">
              Acesse suas viagens e listas de bagagem.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12">
              <LottieLoader size="md" message="Entrando na sua conta..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

              <div className="flex flex-col gap-1.5">
                <PasswordInput
                  id="password"
                  name="password"
                  label="Senha"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end pt-1">
                  <Link
                    to="/esqueci-senha"
                    className="text-xs font-semibold text-[#0B7A75] hover:text-[#085E5A] transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer"
              >
                Entrar
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                Não tem uma conta?{' '}
                <Link
                  to="/cadastro"
                  className="font-semibold text-[#0B7A75] hover:text-[#085E5A] transition-colors"
                >
                  Cadastre-se
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
