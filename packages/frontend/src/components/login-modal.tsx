"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "../contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import LoginAPI from "../../api/login/Login";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenSignup,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await LoginAPI(email, password);

      if (!result.success) {
        setError(
          result.blocked
            ? "Sua conta foi bloqueada por excesso de tentativas incorretas. Entre em contato com o suporte ou recupere sua senha."
            : "Email ou senha inválidos. Tente novamente."
        );
        return;
      }

      await refreshAuth();
      onClose();
      router.push("/analytics");
    } catch (error) {
      setError("Email ou senha inválidos. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSignup = () => {
    onClose();
    onOpenSignup();
  };

  // const validateAuth = useCallback(async () => {
  //   try {
  //     // Mock de usuário autenticado - comentar para usar backend real
  //     setAuth({
  //       isEngineer: true,
  //       isAdmin: true,
  //       name: "Usuário Teste",
  //       email: "teste@agroscope.com",
  //     });

  //     /* Descomentar quando o backend estiver funcionando
  //     const response = await Validate();

  //     if (response && typeof response === "object") {
  //       setAuth({
  //         isEngineer: response.isEngineer,
  //         isAdmin: response.isAdmin || false,
  //         name: response.name,
  //         email: response.email,
  //       });
  //     }
  //     */
  //   } catch (error) {
  //     console.error("Erro ao validar autenticação:", error);
  //     setAuth(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [router, setAuth, setIsLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#3C493B]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <h2 className="text-[#4DAE50] font-bold text-2xl">AgroScope</h2>
          </div>
          <DialogTitle className="text-2xl text-center text-[#F4FFF4]">Entrar</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Entre com sua conta para acessar o sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-[#F4FFF4]">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 text-[#F4FFF4]">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  className="text-sm text-primaryGreen hover:underline"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#text-[#F4FFF4]] hover:text-[#F4FFF4]/50"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4dae50] hover:bg-[#4dae50]/60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <div className="text-sm text-center text-[#F4FFF4] mt-4">
          Não tem uma conta?{" "}
          <button
            className="text-[#4dae50] hover:underline"
            onClick={handleOpenSignup}
          >
            Cadastre-se
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
