import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Importamos español
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Calendar as CalendarIcon, FilterX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: number;
  total_amount: number;
  created_at: string;
  payment_method: { name: string };
  items: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "50"); // Paginación simple: últimas 50
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const { data } = await api.get(`/orders/?${params.toString()}`);
      setOrders(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    // Truco: llamamos a fetchOrders directamente después de limpiar, 
    // pero como el estado es asíncrono, mejor recargar la página o usar useEffect dependiente.
    // Por simplicidad, recargaremos manual al dar clic en buscar de nuevo o con un useEffect.
    // Aquí forzamos una recarga limpia:
    window.location.reload(); 
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Historial de Ventas</h1>
          <p className="text-zinc-500">Revisa y filtra las transacciones pasadas.</p>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-end gap-2 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
          <div className="grid gap-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Desde</span>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                type="date" 
                className="w-40 pl-9 h-9 text-xs bg-zinc-50 border-zinc-200" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Hasta</span>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                type="date" 
                className="w-40 pl-9 h-9 text-xs bg-zinc-50 border-zinc-200"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={fetchOrders} className="h-9 bg-zinc-900 hover:bg-black">
              <Search className="h-4 w-4 md:mr-2" /> 
              <span className="hidden md:inline">Filtrar</span>
            </Button>
            
            {(startDate || endDate) && (
              <Button size="sm" variant="ghost" onClick={clearFilters} className="h-9 px-2 text-zinc-500 hover:text-red-600">
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <Card className="shadow-sm border-zinc-200 overflow-hidden">
        <CardHeader className="p-4 border-b bg-zinc-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium text-zinc-700">
            Últimas Transacciones
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {orders.length} registros
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]"> {/* Scroll interno si la lista es larga */}
            <Table>
              <TableHeader className="bg-zinc-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead>Ítems</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-300" />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                      No se encontraron ventas en este rango de fechas.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <TableCell className="font-mono font-medium text-zinc-500">
                        #{order.id.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="text-zinc-700 text-sm">
                        {/* FORMATO CON DATE-FNS */}
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {format(new Date(order.created_at), "HH:mm a", { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-normal ${
                            order.payment_method.name === 'Efectivo' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {order.payment_method.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono text-zinc-900">
                        ${order.total_amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}