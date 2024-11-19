"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

// Componentes
import InputQuad from "./components/InputQuad";
import Navbar from "./components/Navbar";

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [url, setUrl] = useState("");

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setUrl(url);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className='p-2 bg-green-500'>
      <div className="flex justify-center mb-10">
          <input type="file" accept="image/*" onChange={onChange} />
        </div>
        <div className="flex justify-center">
          {url && (
            <div className="flex items-center p-3 bg-white text-black rounded shadow-md">
              <Image src={url} alt="Imagem para Analise" width={500} height={500} style={{ objectFit: "cover" }} />
            </div>
            
          )}
        </div>
      </div>

      {/* Menu Button with Icon */}
      <div className="flex justify-center mt-10">
        
      </div>
    </div>
  );
}