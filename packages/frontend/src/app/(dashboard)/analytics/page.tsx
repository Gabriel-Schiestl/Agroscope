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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
  Upload,
  Search,
  CheckCircle,
  Leaf,
  History,
  BarChart2,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../../../shared/http/http.config";
import { toast } from "react-toastify";
import type { History as HistoryModel } from "../../../models/History";
import { ChatPanel } from "../../../components/chat-panel";
import { useLimit } from "../../../hooks/use-limit";

const ANALYSIS_HISTORY: HistoryModel[] = [
  {
    id: "1",
    createdAt: new Date("2024-04-15"),
    crop: "Soja",
    cropConfidence: 95.0,
    sicknessId: "sid-ferrugem-asiatica",
    sicknessConfidence: 92.5,
    handling:
      "Aplicar fungicida triazol nas primeiras horas da manhã. Respeitar o intervalo de segurança de 14 dias entre aplicações.",
    explanation:
      "Ferrugem Asiática identificada na folhagem. Lesões pequenas de coloração marrom-avermelhada características desta doença.",
    causes:
      "Condições de alta umidade relativa do ar (acima de 85%) e temperatura entre 18°C e 26°C favoreceram o desenvolvimento do patógeno.",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    createdAt: new Date("2024-04-10"),
    crop: "Milho",
    cropConfidence: 88.0,
    sicknessId: "sid-mancha-cercospora",
    sicknessConfidence: 88.7,
    handling:
      "Utilizar híbridos resistentes e realizar aplicação preventiva de fungicida na fase de desenvolvimento vegetativo.",
    explanation:
      "Mancha de Cercospora identificada nas folhas. Lesões retangulares de coloração cinza-palha típicas da doença.",
    causes:
      "Alta umidade e temperaturas entre 22°C e 30°C. Plantio adensado favorece a disseminação do fungo.",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    createdAt: new Date("2024-04-05"),
    crop: "Café",
    cropConfidence: 97.0,
    sicknessId: "sid-ferrugem-cafeeiro",
    sicknessConfidence: 95.2,
    handling:
      "Aplicar fungicidas sistêmicos à base de triazol ou estrobilurina. Realizar podas para melhorar a aeração do cafezal.",
    explanation:
      "Ferrugem do Cafeeiro identificada. Pústulas alaranjadas na face inferior das folhas, características desta doença.",
    causes:
      "Temperatura entre 20°C e 25°C e períodos prolongados de molhamento foliar favoreceram o desenvolvimento.",
    image: "/placeholder.svg?height=100&width=100",
  },
];

export default function AnalyticsPage() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<HistoryModel | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [chatAnalysis, setChatAnalysis] = useState<HistoryModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { limit, refetch: refetchLimit } = useLimit();

  const applyFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
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

  const handleReset = () => {
    setFile(undefined);
    setPreviewUrl("");
    setResult(null);
  };

  const handleAnalyzeClick = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);

    try {
      const response = await api.post<HistoryModel>(
        `${apiUrl}/predict`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        setResult(response.data);
        refetchLimit();
      } else {
        toast.error("Falha na análise. Tente novamente.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro inesperado.");
      refetchLimit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#3c493b] min-h-full w-full">
      <div className="space-y-6 px-4 pb-16 md:space-y-8 md:px-8 md:pb-10 lg:px-12">
        {/* Page header */}
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
          <TabsList className="bg-[#1f2b20] text-white w-full max-w-lg md:w-auto md:self-start shadow-lg shadow-black/30">
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
            <TabsTrigger
              value="statistics"
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-white/90 data-[state=active]:bg-[#19241b] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <BarChart2 size={16} />
              <span>Estatísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* ── NOVA ANÁLISE ── */}
          <TabsContent value="new-analysis" className="w-full md:mt-1">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Left sidebar */}
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
                      onClick={handleReset}
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
                    <div className="flex flex-col gap-2 text-xs text-mediumGray leading-relaxed">
                      <p className="p-2 bg-[#2a3b2a] hover:bg-[#354a35] rounded-md transition-colors">
                        Tire fotos em boa iluminação, de preferência natural.
                      </p>
                      <p className="p-2 bg-[#2a3b2a] hover:bg-[#354a35] rounded-md transition-colors">
                        Certifique-se de que a planta esteja em foco e ocupe a
                        maior parte da imagem.
                      </p>
                      <p className="p-2 bg-[#2a3b2a] hover:bg-[#354a35] rounded-md transition-colors">
                        Evite fundos muito complexos ou com muitas plantas
                        juntas.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column: upload + results stacked */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                {/* Upload card */}
                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
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
                      onClick={() =>
                        !previewUrl && fileInputRef.current?.click()
                      }
                      className={`
                        flex-1 min-h-[200px] md:min-h-[240px] rounded-xl border-2 border-dashed
                        flex flex-col items-center justify-center gap-4
                        transition-colors duration-200
                        ${previewUrl ? "cursor-default" : "cursor-pointer"}
                        ${
                          isDragging
                            ? "border-primaryGreen bg-primaryGreen/5"
                            : "border-[#354a35] bg-[#1f2b20] hover:border-[#4a6b4a]"
                        }
                      `}
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-full min-h-[200px] md:min-h-[240px] rounded-lg overflow-hidden">
                          <Image
                            src={previewUrl}
                            alt="Imagem para análise"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <>
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

                    {file && previewUrl && (
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-mediumGray truncate max-w-[70%]">
                          {file.name}
                        </p>
                        <button
                          onClick={handleReset}
                          className="text-xs text-mediumGray hover:text-white underline underline-offset-2 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-2 md:px-6 md:pb-6 flex-col gap-2 items-stretch">
                    {limit && (
                      <p
                        className={`text-xs text-right ${
                          limit.imageRequests >= limit.imageLimit
                            ? "text-red-400"
                            : "text-mediumGray"
                        }`}
                      >
                        Análises: {limit.imageRequests}/{limit.imageLimit}
                      </p>
                    )}
                    <Button
                      onClick={handleAnalyzeClick}
                      disabled={
                        !file ||
                        loading ||
                        (limit !== null &&
                          limit.imageRequests >= limit.imageLimit)
                      }
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

                {/* Results card — only visible after analysis starts */}
                {(result || loading) && (
                  <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                    <CardHeader className="pb-2 px-5 pt-5 md:pb-3 md:px-6 md:pt-6">
                      <CardTitle className="text-lg md:text-2xl">
                        Resultado da Análise
                      </CardTitle>
                      <CardDescription className="text-mediumGray text-sm md:text-base">
                        Diagnóstico e recomendações de manejo
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-5 pb-5 md:px-6 md:pb-6 min-h-[200px]">
                      {loading && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="animate-spin h-12 w-12 border-4 border-primaryGreen border-t-transparent rounded-full mb-4" />
                          <p className="text-mediumGray">
                            Analisando a imagem...
                          </p>
                          <p className="text-sm text-mediumGray mt-2">
                            Isso pode levar alguns segundos.
                          </p>
                        </div>
                      )}

                      {result && !loading && (
                        <div className="space-y-4">
                          {/* Cultura */}
                          <div>
                            <h3 className="text-xs font-medium uppercase tracking-widest text-mediumGray mb-2">
                              Cultura Identificada
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-semibold text-primaryGreen">
                                {result.crop}
                              </p>
                              {result.cropConfidence > 0 && (
                                <Badge className="bg-primaryGreen text-white text-xs">
                                  {result.cropConfidence.toFixed(1)}% confiança
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Diagnóstico */}
                          {result.explanation && (
                            <>
                              <Separator className="bg-[#2a3b2a]" />
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="text-xs font-medium uppercase tracking-widest text-mediumGray">
                                    Diagnóstico
                                  </h3>
                                  {result.sicknessConfidence &&
                                    result.sicknessConfidence > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="border-[#354a35] text-mediumGray text-xs"
                                      >
                                        {result.sicknessConfidence.toFixed(1)}%
                                        confiança
                                      </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-mediumGray">
                                  {result.explanation}
                                </p>
                              </div>
                            </>
                          )}

                          {/* Causas */}
                          {result.causes && (
                            <>
                              <Separator className="bg-[#2a3b2a]" />
                              <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-mediumGray mb-1">
                                  Causas
                                </h3>
                                <p className="text-sm text-mediumGray">
                                  {result.causes}
                                </p>
                              </div>
                            </>
                          )}

                          <Separator className="bg-[#2a3b2a]" />

                          {/* Manejo */}
                          <div>
                            <h3 className="text-xs font-medium uppercase tracking-widest text-mediumGray mb-1">
                              Recomendações de Manejo
                            </h3>
                            <p className="text-sm text-mediumGray">
                              {result.handling}
                            </p>
                          </div>

                          <Alert className="mt-2 bg-primaryGreen/10 border-primaryGreen/20">
                            <CheckCircle className="h-4 w-4 text-primaryGreen" />
                            <AlertTitle className="text-primaryGreen text-sm">
                              Importante
                            </AlertTitle>
                            <AlertDescription className="text-xs text-mediumGray">
                              Consulte um agrônomo para confirmar o diagnóstico
                              e obter recomendações específicas para sua
                              lavoura.
                            </AlertDescription>
                          </Alert>

                          <Button
                            className="w-full mt-1 bg-[#2a3b2a] hover:bg-[#354a35] text-white"
                            onClick={() => setChatAnalysis(result)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Tirar dúvidas sobre esta análise
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── HISTÓRICO ── */}
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
                  {ANALYSIS_HISTORY.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-mediumGray">
                      <Leaf className="h-12 w-12 mb-4 text-primaryGreen/30" />
                      <p className="font-medium">
                        Nenhuma análise realizada ainda.
                      </p>
                      <p className="text-sm mt-1">
                        Faça sua primeira análise na aba &quot;Nova
                        Análise&quot;.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ANALYSIS_HISTORY.map((analysis) => (
                        <div
                          key={analysis.id}
                          className="flex items-start gap-4 p-4 md:p-5 rounded-xl bg-[#1f2b20]"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#2a3b2a]">
                            <Image
                              src={analysis.image || "/placeholder.svg"}
                              alt={analysis.crop}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium text-white">
                                  {analysis.crop}
                                </h3>
                                {analysis.explanation && (
                                  <p className="text-sm text-mediumGray mt-0.5 line-clamp-2">
                                    {analysis.explanation}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-mediumGray whitespace-nowrap">
                                {new Date(
                                  analysis.createdAt
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {analysis.cropConfidence > 0 && (
                                <Badge className="bg-primaryGreen text-white text-xs">
                                  Cultura: {analysis.cropConfidence.toFixed(1)}%
                                </Badge>
                              )}
                              {analysis.sicknessConfidence &&
                                analysis.sicknessConfidence > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-[#354a35] text-mediumGray"
                                  >
                                    Doença:{" "}
                                    {analysis.sicknessConfidence.toFixed(1)}%
                                  </Badge>
                                )}
                              <Button
                                variant="link"
                                size="sm"
                                className="text-primaryGreen ml-auto p-0 h-auto text-xs"
                              >
                                Ver detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primaryGreen border-primaryGreen/30 bg-transparent hover:bg-[#2a3b2a] h-7 px-2 text-xs"
                                onClick={() => setChatAnalysis(analysis)}
                              >
                                <MessageCircle className="mr-1 h-3 w-3" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── ESTATÍSTICAS ── */}
          <TabsContent value="statistics" className="w-full md:mt-1">
            <div className="w-full max-w-3xl mx-auto space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                  <CardHeader className="pb-1 px-5 pt-5 md:px-6">
                    <CardDescription className="text-mediumGray text-sm">
                      Total de Análises
                    </CardDescription>
                    <CardTitle className="text-3xl text-white">24</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 md:px-6">
                    <div className="text-xs text-primaryGreen">+8 este mês</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                  <CardHeader className="pb-1 px-5 pt-5 md:px-6">
                    <CardDescription className="text-mediumGray text-sm">
                      Culturas Analisadas
                    </CardDescription>
                    <CardTitle className="text-3xl text-white">5</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 md:px-6">
                    <div className="text-xs text-primaryGreen">
                      Soja, Milho, Café, Algodão, Trigo
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                  <CardHeader className="pb-1 px-5 pt-5 md:px-6">
                    <CardDescription className="text-mediumGray text-sm">
                      Confiança Média
                    </CardDescription>
                    <CardTitle className="text-3xl text-white">89.4%</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 md:px-6">
                    <div className="text-xs text-primaryGreen">
                      +2.1% desde o último mês
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Disease frequency chart */}
              <Card className="bg-[#19241b] border-none text-white md:rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-2 md:px-6 md:pt-6 md:pb-4">
                  <CardTitle className="text-lg md:text-2xl">
                    Doenças Mais Frequentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 md:pb-6 space-y-4">
                  {[
                    { label: "Ferrugem Asiática", pct: 38 },
                    { label: "Mancha de Cercospora", pct: 24 },
                    { label: "Ferrugem do Cafeeiro", pct: 18 },
                    { label: "Antracnose", pct: 12 },
                    { label: "Outras", pct: 8 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {item.label}
                        </span>
                        <span className="text-sm text-mediumGray">
                          {item.pct}%
                        </span>
                      </div>
                      <div className="w-full bg-[#2a3b2a] rounded-full h-2">
                        <div
                          className="bg-primaryGreen h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatPanel
        open={chatAnalysis !== null}
        analysis={chatAnalysis}
        onClose={() => setChatAnalysis(null)}
      />
    </div>
  );
}
