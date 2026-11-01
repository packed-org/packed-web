import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importando o Layout Responsivo
import { MainLayout } from '@/layouts/MainLayout';

// Importando páginas do módulo Auth
import { Splash } from '@/modules/auth/pages/Splash';
import { Login } from '@/modules/auth/pages/Login';
import { Register } from '@/modules/auth/pages/Register';

// Importando páginas do módulo Trips
import { TripsList } from '@/modules/trips/pages/TripsList';
import { NewTrip } from '@/modules/trips/pages/NewTrip';

// Importando páginas do módulo Packing
import { PackingList } from '@/modules/packing/pages/PackingList';
import { PackingInsights } from '@/modules/packing/pages/PackingInsights';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas (Sem Menu) */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        {/* Rotas Privadas COM Menu (Layout Responsivo) */}
        {/* Tudo que estiver dentro deste Route renderizará o Sidebar/BottomNav em volta */}
        <Route element={<MainLayout />}>
          <Route path="/viagens" element={<TripsList />} />
          
          {/* Se a tela de mala e insights precisar do menu, basta descomentar aqui dentro: */}
          <Route path="/mala/:id" element={<PackingList />} />
          {/* <Route path="/mala/:id/insights" element={<PackingInsights />} /> */}
        </Route>

        {/* Rotas Privadas SEM Menu (Tela Cheia) */}
        {/* O fluxo de Nova Viagem fica melhor em tela cheia para manter o foco do usuário */}
        <Route path="/viagens/nova" element={<NewTrip />} />
        
        {/* Fallback - Redireciona rotas inexistentes para a Splash */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}