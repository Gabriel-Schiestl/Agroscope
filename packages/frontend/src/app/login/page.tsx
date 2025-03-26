"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const router = useRouter(); // Hook para redirecionamento

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentativa de login:", formData);
    // Simulação de login bem-sucedido
    router.push("/analyze"); // Redireciona para a página Analyze
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Acesse sua conta no{" "}
          <span className="text-primaryGreen">agroscope</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9134]"
            required
          />
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Senha"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9134]"
            required
          />
          <div className="flex items-center">
            <input type="checkbox" id="manterConectado" className="mr-2" />
            <label htmlFor="manterConectado" className="text-sm text-gray-600">
              Manter conectado
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-primaryGreen text-white p-3 rounded-md hover:bg-[#4a7c2f] transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          <Link
            href="/recuperar-senha"
            className="text-primaryGreen hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          Não tem uma conta?{" "}
          <Link href="/signin" className="text-primaryGreen hover:underline">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
