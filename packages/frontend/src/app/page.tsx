"use client";

import axios from "axios";
import Image from "next/image";
import { ChangeEvent, ReactEventHandler, useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [url, setUrl] = useState("");
  const apiUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL // Ambiente Docker (backend `flask`)
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
      const result = await axios.post(`${apiUrl}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(result.data);
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-400">
      <div className="w-1/2 bg-white rounded-md flex justify-start p-6 items-center flex-col">
        <div className="mb-8">
          <input type="file" accept="image/*" onChange={onChange} />
        </div>
        {url && <Image src={url} alt="Teste" width={500} height={500} />}
        <button onClick={onClick}>Predict</button>
      </div>
    </div>
  );
}
