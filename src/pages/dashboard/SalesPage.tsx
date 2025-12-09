import { useEffect, useState, useRef, useCallback } from "react";
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
  CreditCard,
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// --- HOOK PERSONALIZADO PARA DETECTAR LONG PRESS ---
// Esto permite diferenciar entre un "Click" y un "Mantener presionado"
function useLongPress(
  onLongPress: (e: any) => void, 
  onClick: (e: any) => void, 
  { delay = 500 } = {}
) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null); 

  const start = useCallback(
    (e: any) => {
      setStartLongPress(true);
      timerRef.current = setTimeout(() => {
        onLongPress(e);
        setStartLongPress(false); // Resetear para que no se dispare el click al soltar
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (e: any, shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Si soltamos antes de que se cumpla el tiempo, es un click normal
      if (shouldTriggerClick && startLongPress) {
        onClick(e);
      }
      setStartLongPress(false);
    },
    [onClick, startLongPress]
  );

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false), // Si sale del elemento, cancela todo
    onTouchEnd: (e: any) => clear(e),
  };
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface PaymentMethod {
  id: number;
  name: string;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrder, setProcessingOrder] = useState(false);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  // ESTADO PARA EL MODAL DE EDICIÓN
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Ahora editingItem guarda el producto completo para poder agregarlo si no existe
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");

  const { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotal 
  } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // --- LÓGICA DEL MODAL ---
  
  // Abrir modal (desde long press o botón edit)
  const handleOpenEdit = (product: Product) => {
    setEditingItem(product);
    
    // Verificamos si ya está en el carrito para poner su cantidad actual
    const existingInCart = items.find((i) => i.id === product.id);
    
    if (existingInCart) {
      setEditQuantity(existingInCart.quantity.toString());
    } else {
      setEditQuantity("1"); // Si es nuevo, empezamos en 1
    }
    
    setIsEditOpen(true);
  };

  const handleSaveQuantity = () => {
    if (editingItem && editQuantity) {
      const qty = parseInt(editQuantity);
      if (qty > 0) {
        // Lógica inteligente:
        // 1. Ver si existe. Si no existe, lo agregamos primero.
        const existingInCart = items.find((i) => i.id === editingItem.id);
        
        if (!existingInCart) {
          addItem(editingItem); // Agrega 1 por defecto
        }
        
        // 2. Luego actualizamos a la cantidad exacta que puso el usuario (ej: 50)
        // Esto funciona instantáneamente para el usuario
        updateQuantity(editingItem.id, qty);
        
        setIsEditOpen(false);
      } else {
        // Si pone 0, lo quitamos
        removeItem(editingItem.id);
        setIsEditOpen(false);
      }
    }
  };

  const adjustEditQuantity = (amount: number) => {
    const current = parseInt(editQuantity || "0");
    const newValue = Math.max(1, current + amount);
    setEditQuantity(newValue.toString());
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!selectedPaymentId) {
      toast.error("Método de pago requerido");
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
      toast.success(`Venta completada: $${getTotal().toFixed(2)}`);
      clearCart();
      setSelectedPaymentId(""); 
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la venta");
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-120px)]">
      
      {/* MODAL DE EDICIÓN DE CANTIDAD */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md top-[20%] translate-y-0 gap-6"> 
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{editingItem?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              className="h-16 w-16 rounded-full border-2 border-zinc-200 hover:bg-zinc-100"
              onClick={() => adjustEditQuantity(-1)}
            >
              <Minus className="h-8 w-8" />
            </Button>

            <div className="w-32">
              <Input 
                value={editQuantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setEditQuantity(val);
                }}
                className="h-16 text-center text-3xl font-bold border-2 border-zinc-300 focus-visible:ring-zinc-900"
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*"
              />
            </div>

            <Button 
              variant="outline" 
              className="h-16 w-16 rounded-full border-2 border-zinc-200 hover:bg-zinc-100"
              onClick={() => adjustEditQuantity(1)}
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button 
               variant="default" 
               className="w-full h-12 text-lg bg-zinc-900 hover:bg-black"
               onClick={handleSaveQuantity}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- COLUMNA IZQUIERDA: PRODUCTOS --- */}
      <div className="flex-1 flex flex-col gap-3 lg:gap-4 lg:overflow-hidden min-h-[500px]">
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar producto..." 
            className="pl-9 bg-white shadow-sm"
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
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAdd={() => addItem(product)}
                    onLongPress={() => handleOpenEdit(product)}
                  />
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
                <div key={item.id} className="flex justify-between items-center gap-2 bg-zinc-50/50 p-2 rounded-lg border border-transparent hover:border-zinc-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900 truncate">{item.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">${item.price.toFixed(2)} unit.</p>
                  </div>

                  {/* Botón de edición en carrito (Mantenemos por usabilidad) */}
                  <Button 
                    variant="outline" 
                    className="h-10 px-3 bg-white border-zinc-300 flex items-center gap-2 shadow-sm"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <span className="text-base font-bold font-mono">{item.quantity}</span>
                    <Edit className="h-3 w-3 text-zinc-400" />
                  </Button>

                  <div className="text-right shrink-0 w-16">
                    <p className="font-bold text-sm font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-500 transition-colors mt-1 block ml-auto">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-zinc-50 border-t space-y-3 shrink-0">
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
            {processingOrder ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
            Cobrar
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE PRODUCT CARD (Para limpiar el código principal) ---
// Aquí aplicamos el Hook de Long Press
function ProductCard({ product, onAdd, onLongPress }: { product: Product, onAdd: () => void, onLongPress: () => void }) {
  // Configuración del hook: 
  // onLongPress -> abre modal
  // onClick -> agrega 1
  // delay -> 500ms (medio segundo) para detectar presión larga
  const longPressEvent = useLongPress(onLongPress, onAdd, { delay: 500 });

  return (
    <Card 
      className="cursor-pointer hover:border-zinc-400 transition-all active:scale-95 duration-100 shadow-sm border-zinc-200 select-none"
      {...longPressEvent} // 👈 AQUI MAGIA: Aplicamos los eventos de touch/mouse
    >
      <CardContent className="p-2 md:p-4 flex flex-col items-center justify-between text-center aspect-square h-full pointer-events-none"> 
         {/* pointer-events-none en el hijo ayuda a que el evento lo capture el padre Card */}
        <div className="mt-1 h-8 w-8 md:h-14 md:w-14 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 shadow-inner shrink-0">
          <span className="text-sm md:text-2xl font-bold">{product.name.charAt(0)}</span>
        </div>
        <div className="w-full flex items-center justify-center h-8 md:h-14 px-0.5">
          <h3 
            className="font-semibold leading-tight text-xs md:text-base w-full text-balance line-clamp-2 md:line-clamp-3 wrap-break-word"
          >
            {product.name}
          </h3>
        </div>
        <p className="text-zinc-500 font-mono text-xs md:text-sm mb-0.5">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}