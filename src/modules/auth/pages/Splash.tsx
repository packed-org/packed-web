import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoPacked from '@/assets/Logo_Packed.svg';
import { useAuth } from '@/store/AuthContext';

export function Splash() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitializing || location.pathname !== '/') return;

    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/viagens' : '/login', { replace: true });
    }, 450);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitializing, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between bg-petroleo p-6 md:p-12 select-none">
      <div className="flex-1" />

      <div className="flex flex-col items-center justify-center gap-3">
        <img
          src={logoPacked}
          alt="PACKED"
          className="w-48 md:w-64 max-w-full object-contain transition-transform duration-300"
        />
        <p className="text-xs font-semibold tracking-widest uppercase text-teal-soft/80">
          Bagagem inteligente para qualquer destino
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-end w-full max-w-xs md:max-w-sm mb-8 md:mb-12 gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-petroleo-soft/20">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-sol" />
        </div>
        <span className="text-[11px] text-center text-petroleo-soft/70 font-medium">
          Preparando sua experiência...
        </span>
      </div>
    </div>
  );
}
