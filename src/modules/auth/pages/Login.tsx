import { useState, useEffect, type FormEvent } from 'react';
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
import { Check, CloudRain, Snowflake, Sun, CloudSun } from 'lucide-react';

interface ShowcaseTrip {
  city: string;
  nights: string;
  weather: string;
  weatherType: 'rain' | 'cold' | 'sun' | 'mild';
  progress: string;
  items: { label: string; checked: boolean }[];
}

const SHOWCASE_TRIPS: ShowcaseTrip[] = [
  {
    city: 'Lisboa',
    nights: '7 noites',
    weather: '14°–21°C · Chuva leve',
    weatherType: 'rain',
    progress: '3 de 4 separados',
    items: [
      { label: 'Passaporte e documentos', checked: true },
      { label: 'Casaco impermeável', checked: true },
      { label: 'Tênis confortável para passeio', checked: true },
      { label: 'Adaptador de tomada europeu', checked: false },
    ],
  },
  {
    city: 'Bariloche',
    nights: '5 noites',
    weather: '-1°–7°C · Frio intenso',
    weatherType: 'cold',
    progress: '3 de 4 separados',
    items: [
      { label: 'Casaco térmico pesado', checked: true },
      { label: 'Segunda pele térmica (x3)', checked: true },
      { label: 'Luvas, gorro e cachecol', checked: true },
      { label: 'Protetor labial e hidratante', checked: false },
    ],
  },
  {
    city: 'Fernando de Noronha',
    nights: '4 noites',
    weather: '26°–30°C · Sol forte',
    weatherType: 'sun',
    progress: '2 de 4 separados',
    items: [
      { label: 'Protetor solar FPS 50', checked: true },
      { label: 'Roupas de banho (x3)', checked: true },
      { label: 'Óculos de sol com proteção UV', checked: false },
      { label: 'Sandália / Chinelo', checked: false },
    ],
  },
  {
    city: 'Tóquio',
    nights: '10 noites',
    weather: '12°–19°C · Clima ameno',
    weatherType: 'mild',
    progress: '3 de 4 separados',
    items: [
      { label: 'Passaporte válido', checked: true },
      { label: 'Powerbank 10.000mAh', checked: true },
      { label: 'Jaqueta corta-vento leve', checked: true },
      { label: 'Adaptador de tomada Tipo A', checked: false },
    ],
  },
  {
    city: 'Gramado',
    nights: '4 noites',
    weather: '8°–16°C · Neblina e frio',
    weatherType: 'cold',
    progress: '3 de 4 separados',
    items: [
      { label: 'Suéter de tricô / lã (x2)', checked: true },
      { label: 'Calça jeans / sarja (x2)', checked: true },
      { label: 'Guarda-chuva compacto', checked: true },
      { label: 'Meias térmicas (x4)', checked: false },
    ],
  },
];

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estado da animação dinâmica de destinos
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => {
          // Sorteia um próximo destino diferente do atual
          let next = Math.floor(Math.random() * SHOWCASE_TRIPS.length);
          if (next === prev) {
            next = (prev + 1) % SHOWCASE_TRIPS.length;
          }
          return next;
        });
        setIsAnimating(false);
      }, 280);
    }, 3600);

    return () => clearInterval(interval);
  }, []);

  const currentShowcase = SHOWCASE_TRIPS[activeIndex];

  const getWeatherBadgeIcon = (type: ShowcaseTrip['weatherType']) => {
    switch (type) {
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 text-[#0B7A75]" />;
      case 'cold':
        return <Snowflake className="w-3.5 h-3.5 text-[#094A74]" />;
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-[#F2B640]" />;
      default:
        return <CloudSun className="w-3.5 h-3.5 text-[#0B7A75]" />;
    }
  };

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
      {/* Coluna Esquerda: Fundo escuro de alto contraste (Petróleo Profundo) + Animação Dinâmica */}
      <div className="w-full md:w-[46%] lg:w-[45%] bg-gradient-to-br from-[#0B2B33] via-[#08242B] to-[#05181D] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Efeitos de luz suaves */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0B7A75]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#F2B640]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo / Logo Horizontal com contraste perfeito no fundo escuro */}
        <div className="relative z-10 flex items-center">
          <PackedLogo variant="horizontal" className="h-10 md:h-11 w-auto" />
        </div>

        {/* Mensagem Principal + Card Dinâmico */}
        <div className="relative z-10 my-10 md:my-auto flex flex-col gap-6 max-w-md">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] text-white">
            Sua mala, sem esquecer nada.
          </h1>
          <p className="text-white/85 text-base lg:text-[17px] leading-relaxed font-normal">
            Conte o destino, o período e o que vai fazer. A gente olha o clima e monta a lista para você conferir.
          </p>

          {/* Stepper Pills */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white">
              1 · Destino
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white">
              2 · Clima
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white">
              3 · Lista
            </span>
          </div>

          {/* Card Dinâmico que alterna Cidades e Itens */}
          <div className="mt-2 bg-white text-[#0B2B33] rounded-2xl p-5 shadow-2xl border border-white/15 max-w-sm transition-all duration-300">
            <div
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-base text-[#0B2B33]">
                    {currentShowcase.city} · {currentShowcase.nights}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mt-0.5">
                    {getWeatherBadgeIcon(currentShowcase.weatherType)}
                    {currentShowcase.weather}
                  </span>
                </div>
                <span className="text-xs text-[#0B7A75] font-semibold bg-[#E3F1EF] px-2.5 py-1 rounded-full">
                  {currentShowcase.progress}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-sm">
                {currentShowcase.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    {item.checked ? (
                      <div className="w-5 h-5 rounded-md bg-[#0B7A75] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-gray-300 shrink-0" />
                    )}
                    <span
                      className={
                        item.checked
                          ? 'font-medium text-gray-400 line-through decoration-gray-300'
                          : 'font-medium text-[#0B2B33]'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicadores de carrossel */}
            <div className="flex items-center justify-center gap-1.5 pt-4 mt-3 border-t border-gray-50">
              {SHOWCASE_TRIPS.map((trip, i) => (
                <button
                  key={trip.city}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Ver exemplo ${trip.city}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === activeIndex ? 'w-5 bg-[#0B7A75]' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="relative z-10 text-xs text-white/50">
          Packed App &copy; {new Date().getFullYear()} · Viagens inteligentes
        </div>
      </div>

      {/* Coluna Direita: Formulário de Login */}
      <div className="w-full md:w-[54%] lg:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-[400px] bg-white md:bg-transparent rounded-2xl md:rounded-none p-6 sm:p-8 md:p-0 shadow-xs md:shadow-none border border-gray-100 md:border-none">
          <div className="mb-8">
            <h2 className="font-heading font-extrabold text-3xl sm:text-[34px] text-[#0B2B33]">
              Entrar
            </h2>
            <p className="text-sm text-gray-600 mt-1.5">
              Acesse suas viagens e listas de bagagem.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12">
              <LottieLoader size="md" variant="light-bg" message="Entrando na sua conta..." />
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
                  className="h-12 rounded-xl border-gray-200 bg-white px-3.5 focus:border-[#0B7A75] focus:ring-[#0B7A75]/20 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <PasswordInput
                  id="password"
                  name="password"
                  label="Senha"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
                <div className="flex justify-start pt-0.5">
                  <Link
                    to="/esqueci-senha"
                    className="text-xs font-semibold text-[#0B7A75] hover:text-[#085E5A] underline underline-offset-4 transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-1 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer"
              >
                Entrar
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4 pt-5 border-t border-gray-200/70">
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
