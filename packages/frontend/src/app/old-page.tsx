"use client";

import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useState, useRef } from "react";
import { FaSearch, FaUpload, FaUserPlus } from "react-icons/fa";
// import Navbar from "./components/Navbar";
import { toast } from "react-toastify";
// import Footer from "./components/Footer";
import api from "../../shared/http/http.config";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
      const result = await api.post<Result>(`${apiUrl}/predict`, formData, {
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
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto py-12 px-4 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Texto principal e CTA */}
          <div className="w-full md:w-1/2 text-left space-y-6">
            <h1 className="text-5xl font-bold text-primaryGreen">Agrocope</h1>
            <p className="text-gray-700 text-lg">
              Descubra doenças em suas plantas com IA avançada. Faça upload de
              uma imagem e obtenha recomendações imediatas!
            </p>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-primaryGreen text-white rounded-lg shadow-md hover:bg-green-700 flex items-center">
                <FaUserPlus className="mr-2" /> Criar Conta
              </button>
              <button
                onClick={onClick}
                className="px-6 py-3 bg-green-400 text-white rounded-lg shadow-md hover:bg-green-600 flex items-center"
              >
                <FaSearch className="mr-2" /> Analisar Imagem
              </button>
            </div>
          </div>

          {/* Ilustração / Skeleton */}
          <div className="w-full md:w-1/2 flex justify-center">
            {url ? (
              <Image
                src={url}
                alt="Imagem para Análise"
                width={400}
                height={400}
                className="rounded-md shadow-lg"
              />
            ) : (
              <div className="w-80 h-80 bg-gray-300 animate-pulse rounded-md shadow-lg"></div>
            )}
          </div>
        </div>

        {/* Upload e Resultados */}
        <div className="mt-12 flex flex-col md:flex-row justify-center items-center md:space-x-12">
          {/* Upload de Imagem */}
          <div className="w-full md:w-1/2 flex flex-col items-center bg-white rounded-lg shadow-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center px-4 py-3 bg-primaryGreen text-white rounded-md shadow-md hover:bg-green-700"
            >
              <FaUpload className="mr-2" /> <strong>Selecionar Imagem</strong>
            </button>
            {file && <p className="mt-2 text-gray-600">{file.name}</p>}
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

          {/* Resultados */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800">Diagnóstico</h2>
            <p className="text-gray-700 mt-2">
              <strong>Doença:</strong> {result.prediction || "N/A"}
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Manejo:</strong> {result.handling || "N/A"}
            </p>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
