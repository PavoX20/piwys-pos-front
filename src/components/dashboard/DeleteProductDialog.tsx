import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash } from "lucide-react";

interface Product {
  id: number;
  name: string;
}

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductDeleted: () => void;
}

export default function DeleteProductDialog({ product, open, onOpenChange, onProductDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!product) return;
    setLoading(true);

    try {
      await api.delete(`/products/${product.id}`);
      onProductDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("No se pudo eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash className="h-5 w-5" /> Eliminar Producto
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar <strong>"{product?.name}"</strong>?
            <br />
            Esta acción lo ocultará del inventario (Soft Delete).
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}