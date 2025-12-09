import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // <--- Nuevo
import { LayoutDashboard, ShoppingCart, LogOut, Package, Menu } from "lucide-react"; // <--- Menu Icon
import piwysLogo from "@/assets/piwys-heladeria.png";

export default function DashboardLayout() {
  const { isAuthenticated, logout, username } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Extraemos el contenido del sidebar para reutilizarlo en Desktop y Mobile
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
         <img 
           src={piwysLogo} 
           alt="Logo Piwys" 
           className="h-10 w-10 rounded-full object-cover border border-zinc-100 shadow-sm"
         />
         <span className="font-bold text-xl tracking-tight text-zinc-800">Piwy's Heladería</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <ShoppingCart className="h-4 w-4" />
            Punto de Venta
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Package className="h-4 w-4" />
            Productos
          </Button>
        </Link>
        <Link to="/orders">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Historial Ventas
          </Button>
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <div className="mb-4 px-2 text-sm text-zinc-500">
          Usuario: <span className="font-semibold text-zinc-900">{username}</span>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* SIDEBAR DESKTOP (Oculto en móviles, visible en md en adelante) */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER MÓVIL (Visible solo en móviles) */}
        <header className="h-16 bg-white border-b flex items-center px-4 md:hidden shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-zinc-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-bold text-lg">Piwy's Heladería</span>
        </header>

        {/* ÁREA DE PÁGINAS */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}