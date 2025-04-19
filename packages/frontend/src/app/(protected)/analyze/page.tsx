"use client";

import { useRouter } from "next/navigation";
import { FaUpload } from "react-icons/fa";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setPreviewUrl(URL.createObjectURL(uploadedFile));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu lateral */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Bem-vindo ao AgroScope!
        </h1>

        {/* Botão de Anexar Imagem */}
        <div className="flex justify-center mb-6">
          <label className="cursor-pointer flex items-center justify-center w-20 h-20 bg-primaryGreen text-white rounded-full shadow-lg hover:bg-green-700 transition">
            <FaUpload size={24} />
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Exibir Imagem Anexada */}
        {previewUrl && (
          <div className="flex justify-center mb-6">
            <Image
              src={previewUrl}
              alt="Imagem Anexada"
              width={200}
              height={200}
              className="rounded-md shadow-md"
            />
          </div>
        )}

        {/* Galeria de Skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className="w-full h-32 bg-gray-300 animate-pulse rounded-md"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
