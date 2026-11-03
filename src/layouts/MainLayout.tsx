import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useNetworkStatus } from '@/platform/pwa/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export function MainLayout() {
  const isOnline = useNetworkStatus();

  return (
    <div className="flex min-h-screen w-full bg-petroleo-light">
      {/* Menu Lateral fixo no Desktop */}
      <aside className="hidden md:flex flex-col w-72 fixed h-screen left-0 top-0 z-30 shadow-xl">
        <Sidebar />
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-full md:ml-72 pb-20 md:pb-8 flex flex-col">
        {!isOnline && (
          <div className="bg-beleza text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Modo Offline ativo — exibindo dados salvos no dispositivo.</span>
          </div>
        )}
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </main>

      {/* Barra Inferior para Mobile / PWA */}
      <BottomNav />
    </div>
  );
}
