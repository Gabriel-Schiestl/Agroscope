"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, Leaf, Check, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useAuthModal } from "../../contexts/auth-modal-context";
import placeholder from "../../../public/assets/placeholder300x300.svg";

export default function LandingPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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
    <div className="flex flex-col min-h-full pb-16 md:pb-0">
      <section className="bg-gradient-to-b from-primaryGreen/10 to-white py-12 md:py-20 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-darkGray mb-4">
                Diagnóstico de Plantas com Inteligência Artificial
              </h1>
              <p className="text-lg text-mediumGray mb-6">
                Identifique doenças em suas plantas instantaneamente com nossa
                tecnologia avançada de IA. Obtenha recomendações precisas para
                tratamento e prevenção.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-primaryGreen hover:bg-lightGreen text-white px-6 py-2 rounded-md"
                  onClick={openSignup}
                >
                  Criar Conta Grátis
                </Button>
                <Link href="/recursos-detalhes">
                  <Button variant="outline" className="px-6 py-2 rounded-md">
                    Saiba Mais
                  </Button>
                </Link>
              </div>
            </div>
            <div className="order-first md:order-last flex justify-center">
              <Image
                src={placeholder}
                alt="Análise de plantas com IA"
                width={300}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Analise sua planta agora
              </h2>
              <p className="text-mediumGray mb-6">
                Faça o upload de uma imagem da sua planta para obter um
                diagnóstico instantâneo. Nossa IA identificará possíveis doenças
                e fornecerá recomendações.
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  previewUrl
                    ? "border-primaryGreen"
                    : "border-mediumGray/50 hover:border-primaryGreen/50"
                } transition-colors`}
              >
                {!previewUrl ? (
                  <>
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen">
                        <Upload size={24} />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Arraste e solte sua imagem aqui
                    </h3>
                    <p className="text-mediumGray mb-4">ou</p>
                    <Button
                      className="bg-primaryGreen hover:bg-lightGreen relative"
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
                    <p className="text-sm text-mediumGray mt-4">
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

              {uploadStatus === "success" && (
                <Alert className="mt-4 bg-primaryGreen/10 border-primaryGreen/20">
                  <Check className="h-4 w-4 text-primaryGreen" />
                  <AlertTitle className="text-primaryGreen">
                    Análise concluída!
                  </AlertTitle>
                  <AlertDescription>
                    Para ver o diagnóstico completo e recomendações,
                    <button
                      className="font-medium text-primaryGreen hover:underline ml-1"
                      onClick={openSignup}
                    >
                      crie uma conta gratuita
                    </button>
                    .
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="bg-lightGray rounded-lg flex flex-col items-center justify-center p-8 h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-mediumGray/20 flex items-center justify-center text-mediumGray mx-auto mb-4">
                  <Leaf size={24} />
                </div>
                <h3 className="text-xl font-medium mb-2">Tutorial em Vídeo</h3>
                <p className="text-mediumGray mb-4">
                  Assista ao nosso vídeo tutorial para aprender como utilizar o
                  AgroScope para diagnóstico de plantas e gestão agronômica.
                </p>
                <p className="text-sm text-mediumGray italic">
                  Vídeo em breve disponível
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-lightGray">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Por que escolher o AgroScope?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <Leaf size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Diagnóstico Preciso
                </h3>
                <p className="text-mediumGray">
                  Nossa IA foi treinada com milhares de imagens para identificar
                  com precisão mais de 50 doenças em plantas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <Check size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Recomendações Personalizadas
                </h3>
                <p className="text-mediumGray">
                  Receba orientações específicas para tratamento e prevenção
                  baseadas no diagnóstico da sua planta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-4">
                  <ArrowRight size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2">Gestão Completa</h3>
                <p className="text-mediumGray">
                  Além do diagnóstico, nossa plataforma oferece ferramentas
                  completas para gestão agronômica.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <Button
              className="bg-primaryGreen hover:bg-lightGreen"
              onClick={openSignup}
            >
              Comece Agora Gratuitamente
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
