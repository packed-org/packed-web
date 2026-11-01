import { AppRoutes } from '@/routes';
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="bottom-center" richColors />
    </>
  );
}

export default App;