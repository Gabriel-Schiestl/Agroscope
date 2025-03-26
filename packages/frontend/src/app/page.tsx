"use client";

import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Navbar from "./components/Navbar";
import { toast } from "react-toastify";
import Footer from "./components/Footer";

interface Data {
  prediction: string;
  handling: string;
}

interface Result {
  data?: Data;
  success: boolean;
  exception?: Error;
}

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<Data>({ prediction: "", handling: "" });
  const [url, setUrl] = useState("");
  const apiUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL
      : "http://localhost:3000";

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setUrl(url);
    }
  };

  const onClick = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const result = await axios.post<Result>(`${apiUrl}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (result.data.success) {
        setResult({
          prediction: result.data.data?.prediction || "",
          handling: result.data.data?.handling || "",
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto py-12 px-4 md:px-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primaryGreen">
            Bem-vindo ao AgroScope!
          </h1>
          <p className="text-gray-700 text-lg">
            Faça aqui o teste de sua planta!
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:space-x-12">
          {/* Upload de Imagem */}
          <div className="w-full md:w-1/2 flex flex-col items-center bg-white rounded-lg shadow-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
            />
            {url && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={url}
                  alt="Imagem para Análise"
                  width={400}
                  height={400}
                  className="rounded-md"
                />
              </div>
            )}
          </div>

          {/* Resultados e Botão */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={onClick}
              className="w-full flex items-center justify-center px-4 py-3 bg-primaryGreen text-white rounded-md shadow-md hover:bg-green-700"
            >
              <FaSearch className="mr-2" /> <strong>Analisar Imagem</strong>
            </button>
            <div className="mt-6 bg-gray-100 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800">
                Diagnóstico
              </h2>
              <p className="text-gray-700 mt-2">
                <strong>Doença:</strong> {result.prediction || "N/A"}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Manejo:</strong> {result.handling || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
