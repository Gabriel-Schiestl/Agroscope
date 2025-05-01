"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { FaSearch, FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../shared/http/http.config";

interface Data {
  prediction: string;
  handling: string;
}

export default function Analytics() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<Data>({ prediction: "", handling: "" });
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUrl(URL.createObjectURL(selectedFile));
      setResult({ prediction: "", handling: "" });
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);

    try {
      const response = await api.post<Data>(`${apiUrl}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response);

      if (response.status === 201) {
        setResult({
          prediction: response.data.prediction || "Não identificado",
          handling: response.data.handling || "Sem orientação",
        });
      } else {
        toast.error("Falha na análise. Tente novamente.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 px-4 md:px-12">
      {/* Cabeçalho */}
      <header className="mt-8">
        <h1 className="text-2xl font-bold">Minhas análises</h1>
        <p className="text-gray-500">
          Realize a análise de suas plantas com uma imagem
        </p>
      </header>

      {/* Área de Upload e Resultado */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Upload */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primaryGreen hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center shadow"
          >
            <FaUpload className="mr-2" />
            Selecionar Imagem
          </button>

          {file && <p className="mt-3 text-sm text-gray-600">{file.name}</p>}

          {url && (
            <div className="mt-6 w-full rounded-lg overflow-hidden shadow">
              <Image
                src={url}
                alt="Imagem selecionada"
                width={400}
                height={400}
                className="rounded-lg mx-auto"
              />
            </div>
          )}
        </div>

        {/* Resultado */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Resultado da Análise
          </h2>

          <button
            onClick={handleAnalyzeClick}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg flex items-center"
            disabled={loading || !file}
          >
            {loading ? (
              <span className="animate-pulse">Analisando...</span>
            ) : (
              <>
                <FaSearch className="mr-2" />
                Analisar Imagem
              </>
            )}
          </button>

          <div className="mt-4 space-y-2">
            <p className="text-gray-700">
              <strong>Doença:</strong>{" "}
              {result.prediction || "Nenhuma análise ainda"}
            </p>
            <p className="text-gray-700">
              <strong>Manejo:</strong>{" "}
              {result.handling || "Nenhuma orientação disponível"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
