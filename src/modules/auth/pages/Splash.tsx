import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { PackedLogo } from '@/components/ui/PackedLogo';

export function Splash() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Force minimum 3 seconds display
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Redirect after min time and auth initialization
  useEffect(() => {
    if (!minTimeElapsed || isInitializing || location.pathname !== '/') return;

    navigate(isAuthenticated ? '/viagens' : '/login', { replace: true });
  }, [minTimeElapsed, isInitializing, isAuthenticated, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between bg-[#0B2B33] p-6 md:p-12 select-none text-white">
      <div className="flex-1" />

      <div className="flex flex-col items-center justify-center gap-4 text-center max-w-sm">
        {/* Animated Lottie Logo Signature */}
        <LottieLoader size="lg" className="p-0" />

        <div className="flex flex-col items-center gap-1.5 -mt-2">
          <PackedLogo variant="horizontal" className="h-10 md:h-12 w-auto brightness-110" />
          <p className="text-sm font-medium tracking-wide text-[#F3F7F6]/80 mt-1">
            Sua mala, sem esquecer nada.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end w-full max-w-xs md:max-w-sm mb-8 md:mb-12 gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-[progress_3s_ease-in-out_infinite] rounded-full bg-[#F2B640]" />
        </div>
        <span className="text-xs text-center text-white/50 font-normal">
          Carregando suas listas e destinos...
        </span>
      </div>
    </div>
  );
}
