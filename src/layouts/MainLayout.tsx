import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { BottomNav } from '@/components/ui/bottomNavbar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      
      {/* Menu Lateral - Oculto em telas pequenas (< md), visível em Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-slate-200 bg-white fixed h-screen left-0 top-0">
        <Sidebar />
      </aside>

      {/* 
        Conteúdo Principal 
        - No Desktop (md:ml-72): empurra o conteúdo para a direita do menu fixo.
        - No Mobile (pb-16): adiciona padding inferior para o conteúdo não ficar escondido pela BottomNav.
      */}
      <main className="flex-1 w-full max-w-full md:ml-72 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Barra Inferior - Visível apenas em telas pequenas (Mobile/Capacitor) */}
      <BottomNav />
    </div>
  );
}