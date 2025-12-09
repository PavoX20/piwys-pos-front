import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definimos cómo es un producto en el carrito (Producto + Cantidad)
interface CartItem {
  id: number; // ID del producto
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: { id: number; name: string; price: number }) => void;
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  
  // ✅ NUEVO: Función para actualizar la cantidad manualmente (para el input del modal)
  updateQuantity: (id: number, quantity: number) => void;
  
  clearCart: () => void;
  // Getters computados
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          // Si ya existe, sumamos 1
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // Si no, lo agregamos con cantidad 1
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      increaseQuantity: (id) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        });
      },

      decreaseQuantity: (id) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === id);

        if (item && item.quantity > 1) {
          set({
            items: currentItems.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        } else {
          // Si llega a 0, lo dejamos en 1. El usuario debe usar el botón de basura para borrar.
        }
      },

      // ✅ IMPLEMENTACIÓN NUEVA
      updateQuantity: (id, quantity) => {
        const currentItems = get().items;
        // Evitamos cantidades negativas o cero con Math.max(1, quantity)
        // Si quieres permitir 0 para borrar, cambia esto, pero es más seguro manejar el borrado con removeItem.
        set({
          items: currentItems.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'pos-cart-storage', // Persistencia en localStorage
    }
  )
);