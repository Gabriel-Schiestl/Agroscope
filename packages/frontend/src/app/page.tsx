'use client';

import axios from 'axios';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import Head from 'next/head';

import Navbar from './components/Navbar';

export default function Home() {
  const result = 0; // Não é válido!

  const [file, setFile] = useState<File | undefined>();
  const [url, setUrl] = useState('');
  const apiUrl =
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL // Ambiente Docker (backend `flask`)
      : 'http://localhost:3000';

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
    formData.append('image', file);
    try {
      const result = await axios.post(`${apiUrl}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(result.data);
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error);
    }
  };

  return (
    <body>

      <Head>
        <link rel="shortcut icon" href="/assets/favicon.ico" /> {/*Tem que colocar Favicon*/}
        <title>AgroScope - Plants Classifications</title>
      </Head>


      <Navbar />

      {/* Container Principal */}
      <div className="mx-[10%] p-10 bg-white min-h-screen">
        <div className="flex flex-col md:flex-row md:space-x-6 items-center justify-center mx-32">
          
          {/* Coluna da Esquerda (Imagem de Entrada) */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={onChange}
                className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none"
              />
            </div>
            {url && (
              <div
                className="p-3 bg-white text-black rounded shadow-md"
                style={{
                  width: "300px", // Largura padrão
                  height: "300px", // Altura padrão
                  overflow: "hidden",
                }}
              >
                <Image
                  src={url}
                  alt="Imagem para Análise"
                  width={300} // Defina largura padrão
                  height={300} // Defina altura padrão
                  style={{ objectFit: "cover" }} // Corta ou ajusta a imagem para caber
                  className="rounded"
                />
              </div>
            )}
          </div>

          {/* Coluna da Direita (Botão e Informações) */}
            <div className="w-full md:w-1/2 md:items-start bg-white p-4 rounded shadow-md">
              <button
                onClick={onClick}
                className="px-4 py-2 mb-6 bg-blue-500 text-white rounded shadow hover:bg-blue-600">Analisar</button>

              {/*Informações Analisadas*/}
              <div className="text-left w-full">
                <h2 className="text-lg font-bold mb-2">Resultados da Análise</h2>
                <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Classe Predita: <span className="font-semibold">{result.prediction || "N/A"}</span></li>
                <li className="text-gray-700">Confiança: <span className="font-semibold">{result.handling || "N/A"}</span></li>
                </ul>
              </div>

            </div>

        </div>
      </div>
    </body>
  );
}
