'use client';

import axios from 'axios';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { FaSearch } from "react-icons/fa";

import Navbar from './components/Navbar';

interface Data {
  prediction: string;
  handling: number;
}

interface Result {
  data: Data;
  success: boolean;
}

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<Data>({
    prediction: '',
    handling: 0
  });
  const [url, setUrl] = useState('');
  const apiUrl =
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL
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
      const result = await axios.post<Result>(`${apiUrl}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(result.data);
      if (result.data.success) {
        setResult({
          prediction: result.data.data.prediction,
          handling: result.data.data.handling
        });
      }
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error);
    }
  };

  return (
    <body>

        <link rel="shortcut icon" href="/assets/favicon-16x16.png" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@300;400&display=swap" rel="stylesheet" />

        <title>AgroScope - Plants Classifications</title>


      <Navbar />

      {/* Container Principal */}
      <div className="mx-[10%] p-10 min-h-screen ">

        {/* Título Principal */}
        <h1 className='text-primaryGreen'>Bem-vindo ao AgroScope!</h1>
        <p>Faça aqui o teste de sua planta!</p>

        <div className="flex flex-col md:flex-row md:space-x-6 items-top justify-between align-middle mx-40">
  
          
        
          <div className="w-full md:w-1/2 flex flex-col items-center bg-gray-200 rounded shadow-md p-2">
            <div className="mb-4">
              <input id='card'
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
                  width: '480px', // Largura padrão
                  height: '480px', // Altura padrão
                  overflow: 'hidden'
                }}
              >
                <Image
                  src={url}
                  alt="Imagem para Análise"
                  width={600} // Defina largura padrão
                  height={600} // Defina altura padrão
                  style={{ objectFit: 'cover' }} // Corta ou ajusta a imagem para caber
                  className="rounded"
                />
              </div>
            )}
          </div>

        

          
          {/* Coluna da Direita (Botão e Informações) */}
          <div className="w-full md:w-1/2 md:items-start p-4 rounded shadow-md bg-gray-200">
            <button
              onClick={onClick}
              className="flex items-center justify-center px-4 py-2 mb-6 bg-primaryGreen text-white rounded shadow hover:bg-blue-600 w-36"
            >
              <strong>Analisar</strong> <FaSearch className='ml-2'/>
            </button>

            {/*Informações Analisadas*/}
            <div className="text-left w-full bg-lightGray p-2 rounded-sm">
              <h2 className="text-lg font-bold mb-2">Diagnóstico</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">
                📋 <strong>Doença:</strong>{' '}
                  <span className="font-semibold">
                    {result.prediction || 'N/A'}
                  </span>
                </li>{' '}
                {/* Verificar! */}
                <li className="text-gray-700">
                🌱 <strong>Manejo:</strong>{' '}
                  <span className="font-semibold">
                    {result.handling || 'N/A'}
                  </span>
                </li>{' '}
                {/* Verificar! */}
              </ul>
            </div>


          </div>
        </div>
      </div>
    </body>
  );
}
