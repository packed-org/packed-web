import { AppRoutes } from '@/routes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/store/AuthContext';

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="bottom-center" richColors />
    </AuthProvider>
  );
}

export default App;
