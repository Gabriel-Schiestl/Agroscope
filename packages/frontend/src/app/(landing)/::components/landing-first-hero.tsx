"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/contexts/auth-modal-context";
import Link from "next/link";
import { useState } from "react";
import { Upload } from "lucide-react";

export default function FirstHero() {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { openLogin, openSignup } = useAuthModal();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);

          setTimeout(() => setUploadStatus("success"), 1500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetUpload = () => {
    setPreviewUrl(null);
    setUploadStatus("idle");
  };

  return (
    <>
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-[1400px] mx-auto gap-8 flex flex-col items-center ">
          <div className="flex w-full items-center justify-center text-center">
            <div className="flex flex-col items-center justify-center text-center w-full">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-[#f4fff4] m-4">
                Diagnóstico de Plantas com{" "}
                <span className="text-[#43a547]">Inteligência Artificial</span>
              </h1>
              <p className="text-lg text-[#f4fff4] mb-6">
                Identifique doenças em suas plantas instantaneamente com nossa
                tecnologia avançada de IA. Obtenha recomendações precisas para
                tratamento e prevenção.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-[#4dae50] hover:bg-[#334f36] text-[#f4fff4] px-6 py-2 rounded-md"
                  onClick={openSignup}
                >
                  Criar Conta Grátis
                </Button>
                <Link href="/">
                  <Button variant="outline" className="px-6 py-2 rounded-md">
                    Saiba Mais
                  </Button>
                </Link>
              </div>
            </div>
            {/* <div className="order-first md:order-last flex justify-center">
              <Image
                src={placeholder}
                alt="Análise de plantas com IA"
                width={300}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div> */}
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center flex flex-col w-full ${
              previewUrl
                ? "border-primaryGreen"
                : "border-mediumGray/50 hover:border-primaryGreen/50"
            } transition-colors`}
          >
            {!previewUrl ? (
              <>
                <div className="mb-4 flex justify-center ">
                  <div className="w-16 h-16 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen">
                    <Upload size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#f4fff4]">
                  Arraste e solte sua imagem aqui
                </h3>
                <p className="text-[#f4fff4] mb-4">ou</p>
                <Button
                  className="bg-[#4dae50] hover:bg-[#334f36] relative"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Selecionar Imagem
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </Button>
                <p className="text-sm text-[#f4fff4] mt-4">
                  Formatos suportados: JPG, PNG, GIF (máx. 10MB)
                </p>
              </>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl || "https://placehold.co/300"}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-md object-contain"
                />
                <div className="mt-4 flex justify-center gap-2">
                  <Button variant="outline" onClick={resetUpload}>
                    Escolher outra imagem
                  </Button>
                  {uploadStatus === "idle" && (
                    <Button className="bg-primaryGreen hover:bg-lightGreen">
                      Analisar Imagem
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
