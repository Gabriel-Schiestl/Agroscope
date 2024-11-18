'use client';

import axios from 'axios';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';

// Componentes
import InputQuad from './components/InputQuad';
import Navbar from './components/Navbar';

export default function Home() {
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
      <Navbar />

      <InputQuad>
        <div className="flex justify-center mb-10">
          <input type="file" accept="image/*" onChange={onChange} />
        </div>
        <div className="flex justify-center">
          {url && (
            <div className="flex items-center p-3 bg-white text-black rounded shadow-md">
              <Image
                src={url}
                alt="Teste"
                width={500}
                height={500}
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          <button onClick={onClick}>Predict</button>
        </div>
      </InputQuad>

      {/* Menu Button with Icon */}
      <div className="flex justify-center mt-10"></div>
    </body>
  );
}
