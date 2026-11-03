import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PackedLogo } from '@/components/ui/PackedLogo';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

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
      toast.error('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup(email.trim(), password);
      toast.success('Conta criada com sucesso!', {
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
    <div className="min-h-screen w-full bg-[#F3F7F6] flex flex-col md:flex-row">
      {/* Coluna Esquerda: Vitrine da Marca */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-[#0B7A75] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#085E5A]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <PackedLogo variant="horizontal" className="h-9 w-auto brightness-110" />
        </div>

        <div className="relative z-10 my-10 md:my-auto flex flex-col gap-6 max-w-lg">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-white">
            Viaje leve, seguro e sem esquecer nada.
          </h1>
          <p className="text-white/90 text-base lg:text-lg leading-relaxed font-normal">
            Crie sua conta em segundos e comece a gerar malas sob medida para qualquer clima e duração.
          </p>

          <div className="flex flex-col gap-3.5 pt-2 text-sm text-white/90">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#F2B640] shrink-0" />
              <span>Listas inteligentes calculadas para as suas datas</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#F2B640] shrink-0" />
              <span>Previsão do tempo integrada ao planejamento</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#F2B640] shrink-0" />
              <span>100% gratuito e sincronizado em tempo real</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          Packed App &copy; {new Date().getFullYear()} · Viagens inteligentes
        </div>
      </div>

      {/* Coluna Direita: Formulário de Cadastro */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white md:bg-transparent rounded-2xl md:rounded-none p-6 sm:p-8 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none">
          <div className="flex md:hidden items-center justify-center mb-6">
            <PackedLogo variant="header" size="md" />
          </div>

          <div className="mb-8">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33]">
              Criar conta
            </h2>
            <p className="text-sm text-gray-600 mt-1.5">
              Comece a organizar suas viagens agora mesmo.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12">
              <LottieLoader size="md" message="Criando sua conta Packed..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmar senha"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer"
              >
                Criar minha conta
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#0B7A75] hover:text-[#085E5A] transition-colors"
                >
                  Entrar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
