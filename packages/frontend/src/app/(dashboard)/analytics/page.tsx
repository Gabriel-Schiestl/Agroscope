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
  AlertCircle,
  CheckCircle,
  Leaf,
  History,
  BarChart2,
} from "lucide-react";
import api from "../../../../shared/http/http.config";
import { toast } from "react-toastify";
import type { History as HistoryModel } from "../../../models/History";

// Mock history data matching HistoryDto shape
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
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
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        setResult(response.data);
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

                {previewUrl && (
                  <div className="relative w-full h-64 mt-4 rounded-md overflow-hidden border">
                    <Image
                      src={previewUrl}
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
                {!result && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Leaf className="h-12 w-12 mb-4 text-primaryGreen/30" />
                    <p>
                      Selecione uma imagem e clique em &quot;Analisar
                      Imagem&quot; para obter o diagnóstico.
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
                    {/* Cultura */}
                    <div>
                      <h3 className="font-medium mb-2">Cultura Identificada</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-primaryGreen">
                          {result.crop}
                        </p>
                        {result.cropConfidence > 0 && (
                          <Badge className="bg-primaryGreen">
                            {result.cropConfidence.toFixed(1)}% confiança
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Diagnóstico */}
                    {result.explanation && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-medium">Diagnóstico</h3>
                            {result.sicknessConfidence &&
                              result.sicknessConfidence > 0 && (
                                <Badge variant="outline">
                                  {result.sicknessConfidence.toFixed(1)}%
                                  confiança
                                </Badge>
                              )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.explanation}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Causas */}
                    {result.causes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-1">Causas</h3>
                          <p className="text-sm text-muted-foreground">
                            {result.causes}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Manejo */}
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

          {/* Tips Card */}
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
              {ANALYSIS_HISTORY.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Leaf className="h-12 w-12 mb-4 text-primaryGreen/30" />
                  <p className="font-medium">Nenhuma análise realizada ainda.</p>
                  <p className="text-sm mt-1">
                    Faça sua primeira análise na aba &quot;Nova Análise&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ANALYSIS_HISTORY.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={analysis.image || "/placeholder.svg"}
                          alt={analysis.crop}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{analysis.crop}</h3>
                            {analysis.explanation && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {analysis.explanation}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(analysis.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {analysis.cropConfidence > 0 && (
                            <Badge className="bg-primaryGreen text-xs">
                              Cultura: {analysis.cropConfidence.toFixed(1)}%
                            </Badge>
                          )}
                          {analysis.sicknessConfidence &&
                            analysis.sicknessConfidence > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Doença: {analysis.sicknessConfidence.toFixed(1)}
                                %
                              </Badge>
                            )}
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primaryGreen ml-auto p-0 h-auto"
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {[
                  { label: "Ferrugem Asiática", pct: 38 },
                  { label: "Mancha de Cercospora", pct: 24 },
                  { label: "Ferrugem do Cafeeiro", pct: 18 },
                  { label: "Antracnose", pct: 12 },
                  { label: "Outras", pct: 8 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primaryGreen h-2 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
