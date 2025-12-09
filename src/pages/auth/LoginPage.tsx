import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, User } from "lucide-react";
import piwysImage from "@/assets/piwys-heladeria.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/login", formData);

      setToken(response.data.access_token, username);
      navigate("/");
      
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-4xl shadow-xl border-zinc-200 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Columna del Formulario */}
          <div className="p-6 md:p-8">
            <CardHeader className="space-y-1 px-0">
              <CardTitle className="text-2xl font-bold text-center tracking-tight">Acceso Heladería Piwy's</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      id="username" 
                      placeholder="admin" 
                      className="pl-9" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center border border-red-100">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando...
                    </>
                  ) : (
                    "Ingresar al Sistema"
                  )}
                </Button>
              </form>
            </CardContent>
          </div>
          
          {/* Columna de la Imagen */}
          <div className="relative hidden md:flex h-full items-center justify-center bg-zinc-100">
            <img 
              src={piwysImage} 
              alt="Piwy's Heladería" 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}