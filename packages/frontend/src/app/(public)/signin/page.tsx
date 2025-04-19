"use client";
import { useState } from "react";
import Link from "next/link";
import RegisterUser from "../../../../api/login/RegisterUser";

export default function Signin() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await RegisterUser({
      email: formData.email,
      name: formData.nome,
      password: formData.senha,
    });

    if (response) {
      alert("Cadastro realizado com sucesso!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Crie sua conta no <span className="text-primaryGreen">agroscope</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9134]"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9134]"
            required
          />

          {/* Senha */}
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Senha"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9134]"
            required
          />

          {/* Botão de Cadastro */}
          <button
            type="submit"
            className="w-full bg-primaryGreen text-white p-3 rounded-md hover:bg-[#4a7c2f] transition"
          >
            Cadastrar
          </button>
        </form>

        {/* Link para Login */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primaryGreen hover:underline">
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
