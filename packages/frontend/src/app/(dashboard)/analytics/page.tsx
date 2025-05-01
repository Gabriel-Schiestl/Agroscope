"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Search,
  AlertCircle,
  CheckCircle,
  Leaf,
  History,
  BarChart2,
} from "lucide-react";
import api from "../../../../shared/http/http.config";
import { toast } from "react-toastify";

interface Data {
  prediction: string;
  handling: string;
}

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

export default function AnalyticsPage() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<Data>({ prediction: "", handling: "" });
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUrl(URL.createObjectURL(selectedFile));
      setResult({ prediction: "", handling: "" });
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);

    try {
      const response = await api.post<Data>(`${apiUrl}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        setResult({
          prediction: response.data.prediction || "Não identificado",
          handling: response.data.handling || "Sem orientação",
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
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Análise de Plantas</h1>
        <p className="text-mediumGray">
          Diagnóstico de doenças e recomendações de manejo
        </p>
      </div>

      <Tabs defaultValue="new-analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new-analysis" className="flex items-center gap-2">
            <Leaf size={16} />
            <span>Nova Análise</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart2 size={16} />
            <span>Estatísticas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upload de Imagem</CardTitle>
                <CardDescription>
                  Selecione uma imagem clara da planta para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:w-auto bg-primaryGreen hover:bg-lightGreen"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Imagem
                </Button>

                {file && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {file.name}
                  </p>
                )}

                {url && (
                  <div className="relative w-full h-64 mt-4 rounded-md overflow-hidden border">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt="Imagem para análise"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={!file || loading}
                  className="w-full bg-primaryGreen hover:bg-lightGreen"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
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

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Análise</CardTitle>
                <CardDescription>
                  Diagnóstico e recomendações de manejo
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                {!result.prediction && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Leaf className="h-12 w-12 mb-4 text-primaryGreen/30" />
                    <p>
                      Selecione uma imagem e clique em "Analisar Imagem" para
                      obter o diagnóstico.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primaryGreen border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">
                      Analisando a imagem...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Isso pode levar alguns segundos.
                    </p>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Diagnóstico</h3>
                        {/* {result.confidence && (
                          <Badge className="bg-primaryGreen">
                            Confiança: {result.confidence.toFixed(1)}%
                          </Badge>
                        )} */}
                      </div>
                      <p className="mt-1 text-lg font-semibold text-primaryGreen">
                        {result.prediction}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium">Recomendações de Manejo</h3>
                      <p className="mt-1 text-muted-foreground">
                        {result.handling}
                      </p>
                    </div>

                    <Alert className="mt-4 bg-primaryGreen/10 border-primaryGreen/20">
                      <CheckCircle className="h-4 w-4 text-primaryGreen" />
                      <AlertTitle className="text-primaryGreen">
                        Importante
                      </AlertTitle>
                      <AlertDescription className="text-sm">
                        Consulte um agrônomo para confirmar o diagnóstico e
                        obter recomendações específicas para sua lavoura.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas para Melhores Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2">Qualidade da Imagem</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilize imagens nítidas e bem iluminadas. Evite sombras e
                    reflexos excessivos.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2">Foco nos Sintomas</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture os sintomas visíveis da doença, como manchas, lesões
                    ou descolorações.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2">Múltiplas Amostras</h3>
                  <p className="text-sm text-muted-foreground">
                    Para maior precisão, analise várias imagens da mesma planta
                    em diferentes ângulos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Análises</CardTitle>
              <CardDescription>
                Análises realizadas anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ANALYSIS_HISTORY.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={analysis.imageUrl || "/placeholder.svg"}
                        alt={analysis.crop}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{analysis.prediction}</h3>
                        <span className="text-sm text-muted-foreground">
                          {analysis.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cultura: {analysis.crop}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-primaryGreen text-xs">
                          Confiança: {analysis.confidence.toFixed(1)}%
                        </Badge>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primaryGreen ml-auto"
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Análises</CardTitle>
              <CardDescription>
                Visão geral das análises realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total de Análises</CardDescription>
                    <CardTitle className="text-2xl">24</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-primaryGreen">+8 este mês</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Culturas Analisadas</CardDescription>
                    <CardTitle className="text-2xl">5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-primaryGreen">
                      Soja, Milho, Café, Algodão, Trigo
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Confiança Média</CardDescription>
                    <CardTitle className="text-2xl">89.4%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-primaryGreen">
                      +2.1% desde o último mês
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h3 className="font-medium mb-4">Doenças Mais Frequentes</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Ferrugem Asiática
                    </span>
                    <span className="text-sm text-muted-foreground">38%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primaryGreen h-2 rounded-full"
                      style={{ width: "38%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Mancha de Cercospora
                    </span>
                    <span className="text-sm text-muted-foreground">24%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primaryGreen h-2 rounded-full"
                      style={{ width: "24%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Ferrugem do Cafeeiro
                    </span>
                    <span className="text-sm text-muted-foreground">18%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primaryGreen h-2 rounded-full"
                      style={{ width: "18%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Antracnose</span>
                    <span className="text-sm text-muted-foreground">12%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primaryGreen h-2 rounded-full"
                      style={{ width: "12%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Outras</span>
                    <span className="text-sm text-muted-foreground">8%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primaryGreen h-2 rounded-full"
                      style={{ width: "8%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
