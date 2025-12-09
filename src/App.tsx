import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import SalesPage from '@/pages/dashboard/SalesPage';
import ProductsPage from '@/pages/dashboard/ProductsPage';
import { Toaster } from "@/components/ui/sonner";
import OrdersPage from './pages/dashboard/OrdersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<SalesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* 👇 AQUÍ PERSONALIZAMOS EL TOAST */}
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'bg-white border-2 border-black text-black shadow-none rounded-md', // Estilo minimalista
          descriptionClassName: 'text-zinc-600', // Texto secundario gris oscuro
          actionButtonStyle: {
            backgroundColor: 'black',
            color: 'white',
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;