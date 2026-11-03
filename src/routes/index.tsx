import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute, GuestRoute } from '@/routes/ProtectedRoute';

import { Splash } from '@/modules/auth/pages/Splash';
import { Login } from '@/modules/auth/pages/Login';
import { Register } from '@/modules/auth/pages/Register';
import { VerifyEmail } from '@/modules/auth/pages/VerifyEmail';
import { ForgotPassword } from '@/modules/auth/pages/ForgotPassword';
import { Profile } from '@/modules/auth/pages/Profile';

import { TripsList } from '@/modules/trips/pages/TripsList';
import { NewTrip } from '@/modules/trips/pages/NewTrip';

import { PackingList } from '@/modules/packing/pages/PackingList';
import { PackingInsights } from '@/modules/packing/pages/PackingInsights';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Inicial (Splash com redirecionamento inteligente) */}
        <Route path="/" element={<Splash />} />

        {/* Rotas Públicas (Visitantes) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
        </Route>

        {/* Rotas Autenticadas com Shell Responsivo (Sidebar Desktop + BottomNav Mobile) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/viagens" element={<TripsList />} />
            <Route path="/viagens/nova" element={<NewTrip />} />
            <Route path="/viagens/:id/editar" element={<NewTrip />} />
            <Route path="/mala/:id" element={<PackingList />} />
            <Route path="/mala/:id/insights" element={<PackingInsights />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback para rotas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
