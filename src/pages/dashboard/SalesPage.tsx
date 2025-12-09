import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Loader2, 
  CreditCard 
} from "lucide-react";
import { Input } from "@/components/ui/input";
// NUEVO: Importamos el componente Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
}

// NUEVO: Interfaz para métodos de pago
interface PaymentMethod {
  id: number;
  name: string;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // NUEVO: Estados para pagos
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  const { 
    items, 
    addItem, 
    removeItem, 
    increaseQuantity, 
    decreaseQuantity, 
    clearCart,
    getTotal 
  } = useCartStore();

  // Carga inicial de Productos y Métodos de Pago
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hacemos las dos peticiones en paralelo
        const [productsRes, paymentsRes] = await Promise.all([
          api.get("/products/"),
          api.get("/payments/")
        ]);
        
        setProducts(productsRes.data);
        setPaymentMethods(paymentsRes.data);
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!selectedPaymentId) {
      // 🔴 Error visual en lugar de alert
      toast.error("Método de pago requerido", {
        description: "Por favor selecciona cómo va a pagar el cliente."
      });
      return;
    }

    setProcessingOrder(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        payment_method_id: Number(selectedPaymentId)
      };

      await api.post("/orders/", orderPayload);
      
      // 🟢 Éxito visual
      toast.success("¡Venta completada!", {
        description: `Se cobró un total de $${getTotal().toFixed(2)}`,
        duration: 4000, // Se va solo en 4 segundos
      });

      clearCart();
      setSelectedPaymentId(""); 
    } catch (error) {
      console.error("Error en la venta:", error);
      // 🔴 Error de servidor
      toast.error("Error al procesar", {
        description: "Hubo un problema de conexión con el servidor."
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-120px)]">
      
      {/* --- COLUMNA IZQUIERDA: PRODUCTOS --- */}
      <div className="flex-1 flex flex-col gap-3 lg:gap-4 lg:overflow-hidden min-h-[500px]">
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar producto..." 
            className="pl-9 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 lg:overflow-hidden">
           <ScrollArea className="h-full pr-0 lg:pr-4">
            {loadingProducts ? (
              <div className="flex justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 pb-4">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:border-zinc-400 transition-all active:scale-95 duration-100 shadow-sm border-zinc-200"
                    onClick={() => addItem(product)}
                  >
                    <CardContent className="p-2 md:p-4 flex flex-col items-center justify-between text-center aspect-square h-full">
                      <div className="mt-1 h-8 w-8 md:h-14 md:w-14 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 shadow-inner shrink-0">
                        <span className="text-sm md:text-2xl font-bold">{product.name.charAt(0)}</span>
                      </div>
                      <div className="w-full flex items-center justify-center h-8 md:h-14 px-0.5">
                        <h3 
                          className="font-semibold leading-tight text-xs md:text-base w-full text-balance line-clamp-2 md:line-clamp-3 wrap-break-word"
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-zinc-500 font-mono text-xs md:text-sm mb-0.5">
                        ${product.price.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: CARRITO --- */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm h-auto lg:h-full overflow-hidden mb-6 lg:mb-0">
        
        <div className="p-4 border-b bg-zinc-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 font-semibold text-zinc-700">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm md:text-base">Carrito ({items.length})</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
            onClick={clearCart}
            disabled={items.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Vaciar
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 min-h-[200px] lg:min-h-0">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2 opacity-60 py-10 lg:py-0">
              <ShoppingCart className="h-10 w-10 md:h-12 md:w-12" />
              <p className="text-sm">Carrito vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-2 bg-zinc-50/50 p-2 rounded-lg border border-transparent hover:border-zinc-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => decreaseQuantity(item.id)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-mono font-medium">
                      {item.quantity}
                    </span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => increaseQuantity(item.id)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right shrink-0 w-16">
                    <p className="font-bold text-sm font-mono">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors mt-1 block ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-zinc-50 border-t space-y-3 shrink-0">
          
          {/* NUEVO: Selector de Método de Pago */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Método de Pago</label>
            <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-lg md:text-xl font-bold text-zinc-900">
              <span>Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <Button 
            className="w-full h-10 md:h-12 text-base bg-zinc-900 hover:bg-black shadow-md hover:shadow-lg transition-all"
            disabled={items.length === 0 || processingOrder || !selectedPaymentId}
            onClick={handleCheckout}
          >
            {processingOrder ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-5 w-5" />
            )}
            Cobrar
          </Button>
        </div>

      </div>
    </div>
  );
}