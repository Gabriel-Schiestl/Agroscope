'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Upload,
  Search,
  AlertCircle,
  CheckCircle,
  Leaf,
  History,
  BarChart2,
  MessageCircle,
  FileText,
} from 'lucide-react';
import api from '../../../../shared/http/http.config';
import { toast } from 'react-toastify';
import type { History as HistoryModel } from '../../../models/History';
import { ChatPanel } from '../../../components/chat-panel';
import { AnalyticsDashboard } from '../../../components/analytics-dashboard';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useLimit } from '../../../hooks/use-limit';
import { useHistory } from '../../../hooks/use-history';
import { toImageSrc } from '../../../lib/utils';
import { generateAnalysisReportPdf } from '../../../lib/pdf/generate-analysis-report';
import {
  hasPlanFeature,
  PLAN_FEATURE_REPORT_GENERATION,
} from '../../../lib/plan-features';

export default function AnalyticsPage() {
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<HistoryModel | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatAnalysis, setChatAnalysis] = useState<HistoryModel | null>(null);
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { limit, refetch: refetchLimit } = useLimit();
  const canGenerateReport = hasPlanFeature(
    limit?.featureFlags,
    PLAN_FEATURE_REPORT_GENERATION
  );
  const {
    history: analysisHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useHistory();

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
    formData.append('image', file);
    setLoading(true);

    try {
      const response = await api.post<HistoryModel>(
        `${apiUrl}/predict`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status === 201) {
        setResult(response.data);
        refetchLimit();
        refetchHistory();
      } else {
        toast.error('Falha na análise. Tente novamente.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro inesperado.');
      refetchLimit();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (analysis: HistoryModel) => {
    if (!canGenerateReport) {
      toast.error(
        'Relatórios em PDF disponíveis apenas nos planos pagos. Faça upgrade do seu plano.'
      );
      return;
    }
    setGeneratingReportId(analysis.id);
    try {
      await generateAnalysisReportPdf(analysis);
    } catch (error) {
      toast.error('Não foi possível gerar o relatório em PDF.');
    } finally {
      setGeneratingReportId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 pb-16 md:pb-0">
        <div>
          <h1 className="text-xl md:text-2xl">Análise de Plantas</h1>
          <p className="text-mediumGray">
            Diagnóstico de doenças e recomendações de manejo
          </p>
        </div>

        <Tabs defaultValue="new-analysis" className="space-y-6">
          <TabsList>
            <TabsTrigger
              value="new-analysis"
              className="flex items-center gap-2"
            >
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
                <CardFooter className="flex-col gap-2 items-stretch">
                  {limit && (
                    <p
                      className={`text-xs text-right ${limit.imageRequests >= limit.imageLimit ? 'text-red-500' : 'text-muted-foreground'}`}
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
                  {limit !== null &&
                    limit.imageRequests >= limit.imageLimit && (
                      <p className="text-xs text-red-500 text-center">
                        Limite de {limit.imageLimit} análises atingido. Faça
                        upgrade do seu plano para continuar analisando imagens.
                      </p>
                    )}
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
                        <h3 className="font-medium mb-2">
                          Cultura Identificada
                        </h3>
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

                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button
                          className="w-full bg-primaryGreen hover:bg-lightGreen"
                          onClick={() => setChatAnalysis(result)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Tirar dúvidas
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-primaryGreen border-primaryGreen/30"
                          disabled={
                            generatingReportId === result.id ||
                            !canGenerateReport
                          }
                          onClick={() => handleGenerateReport(result)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {generatingReportId === result.id
                            ? 'Gerando...'
                            : 'Gerar Relatório PDF'}
                        </Button>
                      </div>
                      {!canGenerateReport && (
                        <p className="text-xs text-red-500 text-center">
                          Relatórios em PDF disponíveis nos planos pagos.
                          Faça upgrade do seu plano para gerar relatórios.
                        </p>
                      )}
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
                      Capture os sintomas visíveis da doença, como manchas,
                      lesões ou descolorações.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h3 className="font-medium mb-2">Múltiplas Amostras</h3>
                    <p className="text-sm text-muted-foreground">
                      Para maior precisão, analise várias imagens da mesma
                      planta em diferentes ângulos.
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
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primaryGreen border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">
                      Carregando histórico...
                    </p>
                  </div>
                ) : analysisHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Leaf className="h-12 w-12 mb-4 text-primaryGreen/30" />
                    <p className="font-medium">
                      Nenhuma análise realizada ainda.
                    </p>
                    <p className="text-sm mt-1">
                      Faça sua primeira análise na aba &quot;Nova Análise&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisHistory.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex items-start gap-4 p-4 rounded-lg border"
                      >
                        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                          <Image
                            src={toImageSrc(analysis.image)}
                            alt={analysis.crop || 'Análise'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium">
                                {analysis.crop || 'Planta saudável'}
                              </h3>
                              {analysis.explanation && (
                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                  {analysis.explanation}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(analysis.createdAt).toLocaleDateString(
                                'pt-BR'
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
                                  Doença:{' '}
                                  {analysis.sicknessConfidence.toFixed(1)}%
                                </Badge>
                              )}
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primaryGreen ml-auto p-0 h-auto"
                            >
                              Ver detalhes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primaryGreen border-primaryGreen/30 h-7 px-2 text-xs"
                              onClick={() => setChatAnalysis(analysis)}
                            >
                              <MessageCircle className="mr-1 h-3 w-3" />
                              Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primaryGreen border-primaryGreen/30 h-7 px-2 text-xs"
                              disabled={
                                generatingReportId === analysis.id ||
                                !canGenerateReport
                              }
                              title={
                                !canGenerateReport
                                  ? 'Disponível nos planos pagos'
                                  : undefined
                              }
                              onClick={() => handleGenerateReport(analysis)}
                            >
                              <FileText className="mr-1 h-3 w-3" />
                              {generatingReportId === analysis.id
                                ? 'Gerando...'
                                : 'Relatório PDF'}
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
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

        <ChatPanel
          open={chatAnalysis !== null}
          analysis={chatAnalysis}
          onClose={() => setChatAnalysis(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
