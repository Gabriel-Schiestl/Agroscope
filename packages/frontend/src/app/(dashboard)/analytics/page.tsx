"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Upload, Search, Leaf, History, RefreshCw } from "lucide-react";
import api from "../../../../shared/http/http.config";
import { toast } from "react-toastify";
import { Sickness } from "../../../models/Sickness";

// Mock history data
const ANALYSIS_HISTORY = [
  {
    id: "1",
    date: "15/04/2024",
    crop: "Soja",
    prediction: "Ferrugem Asiática",
    confidence: 92.5,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    date: "10/04/2024",
    crop: "Milho",
    prediction: "Mancha de Cercospora",
    confidence: 88.7,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    date: "05/04/2024",
    crop: "Café",
    prediction: "Ferrugem do Cafeeiro",
    confidence: 95.2,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
];

export interface PredicResponse {
  sickness: Sickness;
  handling: string;
  sicknessConfidence: number;
  crop: string;
  cropConfidence: number;
}

export default function AnalyticsPage() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<PredicResponse>({
    crop: "",
    handling: "",
    sickness: { name: "", description: "", symptoms: [] },
    cropConfidence: 0,
    sicknessConfidence: 0,
  });
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const applyFile = (selectedFile: File) => {
    setFile(selectedFile);
    setUrl(URL.createObjectURL(selectedFile));
    setResult({
      crop: "",
      handling: "",
      sickness: { name: "", description: "", symptoms: [] },
      cropConfidence: 0,
      sicknessConfidence: 0,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) applyFile(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      applyFile(droppedFile);
    } else {
      toast.error("Por favor, selecione um arquivo de imagem.");
    }
  }, []);

  const handleAnalyzeClick = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);

    try {
      const response = await api.post<PredicResponse>(
        `${apiUrl}/predict`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        setResult({
          sickness: response.data.sickness || "Não identificado",
          handling: response.data.handling || "Sem orientação",
          crop: response.data.crop || "Não identificado",
          cropConfidence: response.data.cropConfidence || 0,
          sicknessConfidence: response.data.sicknessConfidence || 0,
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
    <div className="bg-[#3c493b] min-h-full w-full">
      <div className="space-y-6 px-4 pb-16 md:space-y-8 md:px-8 md:pb-10 lg:px-12">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-xl md:text-3xl text-white py-3 font-semibold tracking-tight">
            Análise de Plantas
          </h1>
          <p className="text-mediumGray md:text-base md:max-w-2xl">
            Diagnóstico de doenças e recomendações de manejo
          </p>
        </div>

        <Tabs
          defaultValue="new-analysis"
          className="space-y-6 flex flex-col items-stretch w-full max-w-6xl mx-auto md:space-y-7"
        >
          <TabsList className="bg-[#1f2b20] text-white w-full max-w-md md:w-auto md:self-start shadow-lg shadow-black/30">
            <TabsTrigger
              value="new-analysis"
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-white/90 data-[state=active]:bg-[#19241b] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Leaf size={16} />
              <span>Nova Análise</span>
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-white/90 data-[state=active]:bg-[#19241b] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <History size={16} />
              <span>Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* NOVA ANÁLISE */}
          <TabsContent value="new-analysis" className="w-full md:mt-1">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              <div className="flex flex-col gap-4 w-full lg:w-[280px] xl:w-[320px] flex-shrink-0">
                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                  <CardContent className="p-5 md:p-6 flex flex-col gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#2a3b2a] flex items-center justify-center">
                      <Search size={20} className="text-primaryGreen" />
                    </div>

                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-white mb-1">
                        Análise de Plantas
                      </h2>
                      <p className="text-sm text-mediumGray leading-relaxed">
                        Diagnóstico de doenças e recomendações de manejo
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setFile(undefined);
                        setUrl("");
                        setResult({
                          crop: "",
                          handling: "",
                          sickness: { name: "", description: "", symptoms: [] },
                          cropConfidence: 0,
                          sicknessConfidence: 0,
                        });
                      }}
                      className="w-full bg-[#2a3b2a] hover:bg-[#354a35] text-white border-none md:text-sm"
                    >
                      <RefreshCw size={15} className="mr-2" />
                      Nova Análise
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                  <CardContent className="p-5 md:p-6">
                    <p className="text-sm text-mediumGray mb-3">
                      Formatos aceitos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["PNG", "JPG", "WEBP"].map((fmt) => (
                        <span
                          key={fmt}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-[#2a3b2a] text-mediumGray border border-[#354a35]"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                  <CardContent className="p-5 md:p-6">
                    <p className="text-sm text-mediumGray mb-3">
                      Dicas para melhores resultados
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-mediumGray leading-relaxed text-center">
                      <p className="p-2 bg-[#2a3b2a] hover:bg-[#354a35] rounded-md">
                        Tire fotos em boa iluminação, de preferência natural.
                      </p>
                      <p className="p-2 bg-[#2a3b2a] hover:bg-[#354a35] rounded-md">
                        Certifique-se de que a planta esteja em foco e ocupe a
                        maior parte da imagem.
                      </p>
                      <p className="p-2 bg-[#2a3b2a] hover:bg-[#354a35] rounded-md">
                        Evite fundos muito complexos ou com muitas plantas
                        juntas.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN: Upload panel */}
              <div className="flex-1 min-w-0">
                <Card className="bg-[#19241b] border-none text-white flex w-full flex-col md:rounded-2xl h-full">
                  <CardHeader className="pb-2 px-5 pt-5 md:pb-3 md:px-6 md:pt-6">
                    <CardTitle className="text-lg md:text-2xl">
                      Upload de Imagem
                    </CardTitle>
                    <CardDescription className="text-mediumGray text-sm md:text-base">
                      Selecione uma imagem clara da planta para análise
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col items-stretch px-5 pb-4 md:px-6 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />

                    {/* Drop zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !url && fileInputRef.current?.click()}
                      className={`
                        flex-1 min-h-[220px] md:min-h-[260px] rounded-xl border-2 border-dashed
                        flex flex-col items-center justify-center gap-4
                        transition-colors duration-200 cursor-pointer
                        ${
                          isDragging
                            ? "border-primaryGreen bg-primaryGreen/5"
                            : "border-[#354a35] bg-[#1f2b20] hover:border-[#4a6b4a]"
                        }
                        ${url ? "cursor-default" : ""}
                      `}
                    >
                      {url ? (
                        <div className="relative w-full h-full min-h-[220px] md:min-h-[260px] rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt="Imagem para análise"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <>
                          {/* Upload icon box */}
                          <div className="w-14 h-14 rounded-2xl bg-[#2a3b2a] flex items-center justify-center">
                            <Upload size={24} className="text-primaryGreen" />
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="bg-primaryGreen hover:bg-lightGreen text-white px-6 py-2.5 text-sm md:text-base"
                          >
                            <Upload size={15} className="mr-2" />
                            Selecionar Imagem
                          </Button>

                          <p className="text-xs text-mediumGray">
                            ou arraste e solte aqui
                          </p>
                        </>
                      )}
                    </div>

                    {/* File name display after selection */}
                    {file && url && (
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-mediumGray truncate max-w-[70%]">
                          {file.name}
                        </p>
                        <button
                          onClick={() => {
                            setFile(undefined);
                            setUrl("");
                          }}
                          className="text-xs text-mediumGray hover:text-white underline underline-offset-2 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-2 md:px-6 md:pb-6">
                    <Button
                      onClick={handleAnalyzeClick}
                      disabled={!file || loading}
                      className="w-full bg-primaryGreen hover:bg-lightGreen disabled:opacity-50 disabled:cursor-not-allowed md:text-base md:py-5"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Analisar Imagem
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* HISTÓRICO */}
          <TabsContent value="history" className="w-full md:mt-1">
            <div className="w-full max-w-3xl mx-auto">
              <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-2 md:px-6 md:pt-6 md:pb-3">
                  <CardTitle className="text-lg md:text-2xl">
                    Histórico de Análises
                  </CardTitle>
                  <CardDescription className="text-mediumGray text-sm md:text-base">
                    Análises realizadas anteriormente
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                  <div className="space-y-3">
                    {ANALYSIS_HISTORY.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-[#1f2b20]"
                      >
                        {/* Icon */}
                        <div className="w-11 h-11 rounded-xl bg-[#2a3b2a] flex items-center justify-center flex-shrink-0">
                          <Leaf size={18} className="text-primaryGreen" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm md:text-base truncate">
                            {analysis.prediction}
                          </p>
                          <p className="text-xs md:text-sm text-mediumGray mt-0.5">
                            Cultura: {analysis.crop}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs md:text-sm text-mediumGray">
                            {analysis.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
