import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
        {/* Rotas Públicas (Auth) */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        {/* Rotas Privadas (Viagens) */}
        <Route path="/viagens" element={<TripsList />} />
        <Route path="/viagens/nova" element={<NewTrip />} />

        {/* Rotas Privadas (Bagagem) */}
        {/* <Route path="/mala/:id" element={<PackingList />} />
        <Route path="/mala/:id/insights" element={<PackingInsights />} /> */}
        
        {/* Fallback - Redireciona rotas inexistentes para a Splash */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}