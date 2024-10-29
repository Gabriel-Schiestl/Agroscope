"use client";

import Image from "next/image";
import { ChangeEvent, ReactEventHandler, useState } from "react";

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
    <div className="w-full h-screen flex justify-center items-center bg-slate-400">
      <div className="w-1/2 h-2/3 bg-white rounded-md flex justify-start p-6 items-center flex-col">
        <div className="mb-8">
          <input type="file" accept="image/*" onChange={onChange} />
        </div>
        {url && <Image src={url} alt="Teste" width={500} height={500} />}
      </div>
    </div>
  );
}
