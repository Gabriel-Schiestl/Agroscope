'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { cropLabel, sicknessLabel } from '../../../lib/agro-labels';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import {
  Upload,
  Search,
  CheckCircle,
  Leaf,
  History,
  BarChart2,
  MessageCircle,
  FileText,
  CalendarIcon,
  Filter,
  Grid,
  List,
  Download,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  X,
} from 'lucide-react';
import api from '../../../../shared/http/http.config';
import { toast } from 'react-toastify';
import type { History as HistoryModel } from '../../../models/History';
import { ChatPanel } from '../../../components/chat-panel';
import { AnalyticsDashboard } from '../../../components/analytics-dashboard';
import { useLimit } from '../../../hooks/use-limit';
import { useHistory } from '../../../hooks/use-history';
import { toImageSrc } from '../../../lib/utils';
import { generateAnalysisReportPdf } from '../../../lib/pdf/generate-analysis-report';
import {
  hasPlanFeature,
  PLAN_FEATURE_REPORT_GENERATION,
} from '../../../lib/plan-features';

const CROP_OPTIONS = ['Todos', 'Soja', 'Milho', 'Café', 'Algodão', 'Trigo'];
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Data (mais recente)' },
  { value: 'date-asc', label: 'Data (mais antiga)' },
  { value: 'confidence-desc', label: 'Confiança (maior)' },
  { value: 'confidence-asc', label: 'Confiança (menor)' },
];
const ITEMS_PER_PAGE = 5;

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'new-analysis';

  // analysis tab state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [file, setFile] = useState<File | undefined>();
  const [result, setResult] = useState<HistoryModel | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatAnalysis, setChatAnalysis] = useState<HistoryModel | null>(null);
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { limit, refetch: refetchLimit } = useLimit();
  const canGenerateReport = hasPlanFeature(limit?.featureFlags, PLAN_FEATURE_REPORT_GENERATION);
  const {
    history: analysisHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useHistory();

  // history tab filter/sort/pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState('date-desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/analytics?tab=${value}`, { scroll: false });
  };

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
      const response = await api.post<HistoryModel>(`${apiUrl}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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
      toast.error('Relatórios em PDF disponíveis apenas nos planos pagos. Faça upgrade do seu plano.');
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

  const clearFilters = () => {
    setSearchQuery('');
    setCropFilter('Todos');
    setDateFilter(undefined);
    setSortOption('date-desc');
    setCurrentPage(1);
  };

  const filteredHistories = analysisHistory
    .filter((h) => {
      const searchText = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        (h.explanation || '').toLowerCase().includes(searchText) ||
        (h.crop || '').toLowerCase().includes(searchText) ||
        (h.sicknessName || '').toLowerCase().includes(searchText);
      const matchesCrop = cropFilter === 'Todos' || cropLabel(h.crop) === cropFilter;
      const matchesDate =
        !dateFilter ||
        format(new Date(h.createdAt), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      return matchesSearch && matchesCrop && matchesDate;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'confidence-desc':
          return (b.sicknessConfidence ?? 0) - (a.sicknessConfidence ?? 0);
        case 'confidence-asc':
          return (a.sicknessConfidence ?? 0) - (b.sicknessConfidence ?? 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredHistories.length / ITEMS_PER_PAGE);
  const paginatedHistories = filteredHistories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Análise de Plantas</h1>
        <p className="text-mediumGray">Diagnóstico de doenças e recomendações de manejo</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
                    <Image src={previewUrl} alt="Imagem para análise" fill className="object-contain" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-2 items-stretch">
                {limit && (
                  <p className={`text-xs text-right ${limit.imageRequests >= limit.imageLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                    Análises: {limit.imageRequests}/{limit.imageLimit}
                  </p>
                )}
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={!file || loading || (limit !== null && limit.imageRequests >= limit.imageLimit)}
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
                {limit !== null && limit.imageRequests >= limit.imageLimit && (
                  <p className="text-xs text-red-500 text-center">
                    Limite de {limit.imageLimit} análises atingido. Faça upgrade do seu plano para continuar analisando imagens.
                  </p>
                )}
              </CardFooter>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Análise</CardTitle>
                <CardDescription>Diagnóstico e recomendações de manejo</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                {!result && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Leaf className="h-12 w-12 mb-4 text-primaryGreen/30" />
                    <p>Selecione uma imagem e clique em &quot;Analisar Imagem&quot; para obter o diagnóstico.</p>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primaryGreen border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">Analisando a imagem...</p>
                    <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos.</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Cultura Identificada</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-primaryGreen">
                          {cropLabel(result.crop)}
                        </p>
                        {result.cropConfidence > 0 && (
                          <Badge className="bg-primaryGreen">
                            {(result.cropConfidence * 100).toFixed(1)}% confiança
                          </Badge>
                        )}
                      </div>
                    </div>

                    {result.sicknessId ? (
                      <>
                        <Separator />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium">Diagnóstico</h3>
                            {result.sicknessConfidence != null && result.sicknessConfidence > 0 && (
                              <Badge variant="outline">
                                {(result.sicknessConfidence * 100).toFixed(1)}% confiança
                              </Badge>
                            )}
                          </div>
                          {result.sicknessName && (
                            <p className="font-semibold text-base mb-1">
                              {sicknessLabel(result.sicknessName)}
                            </p>
                          )}
                          {result.explanation && (
                            <p className="text-sm text-muted-foreground">{result.explanation}</p>
                          )}
                        </div>
                      </>
                    ) : result.handling === 'Nenhuma ação necessária' ? (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primaryGreen text-white text-sm px-3 py-1">
                            Planta Saudável
                          </Badge>
                        </div>
                      </>
                    ) : null}

                    {result.causes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-1">Causas</h3>
                          <p className="text-sm text-muted-foreground">{result.causes}</p>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div>
                      <h3 className="font-medium">Recomendações de Manejo</h3>
                      <p className="mt-1 text-muted-foreground">{result.handling}</p>
                    </div>

                    <Alert className="mt-4 bg-primaryGreen/10 border-primaryGreen/20">
                      <CheckCircle className="h-4 w-4 text-primaryGreen" />
                      <AlertTitle className="text-primaryGreen">Importante</AlertTitle>
                      <AlertDescription className="text-sm">
                        Consulte um agrônomo para confirmar o diagnóstico e obter recomendações específicas para sua lavoura.
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
                        disabled={generatingReportId === result.id || !canGenerateReport}
                        onClick={() => handleGenerateReport(result)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {generatingReportId === result.id ? 'Gerando...' : 'Gerar Relatório PDF'}
                      </Button>
                    </div>
                    {!canGenerateReport && (
                      <p className="text-xs text-red-500 text-center">
                        Relatórios em PDF disponíveis nos planos pagos. Faça upgrade do seu plano para gerar relatórios.
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
                    Utilize imagens nítidas e bem iluminadas. Evite sombras e reflexos excessivos.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2">Foco nos Sintomas</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture os sintomas visíveis da doença, como manchas, lesões ou descolorações.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2">Múltiplas Amostras</h3>
                  <p className="text-sm text-muted-foreground">
                    Para maior precisão, analise várias imagens da mesma planta em diferentes ângulos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Histórico tab with full filter/sort/pagination UI ── */}
        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediumGray" size={16} />
                  <Input
                    placeholder="Buscar por cultura ou diagnóstico..."
                    className="pl-10 pr-10"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mediumGray hover:text-darkGray"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={cropFilter} onValueChange={(v) => { setCropFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Cultura" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_OPTIONS.map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[150px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, 'dd/MM/yyyy') : 'Data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={(d) => { setDateFilter(d); setCurrentPage(1); }}
                        initialFocus
                      />
                      {dateFilter && (
                        <div className="p-2 border-t flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)}>
                            Limpar
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <Filter className="h-4 w-4" />
                    Limpar
                  </Button>

                  <div className="flex rounded-md border">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      className={`rounded-none rounded-l-md ${viewMode === 'list' ? 'bg-primaryGreen hover:bg-lightGreen' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      className={`rounded-none rounded-r-md ${viewMode === 'grid' ? 'bg-primaryGreen hover:bg-lightGreen' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {!historyLoading && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Mostrando {paginatedHistories.length} de {filteredHistories.length} análises
                </p>
              </div>
            )}

            {historyLoading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primaryGreen border-t-transparent rounded-full mb-4"></div>
                  <p className="text-muted-foreground">Carregando histórico...</p>
                </CardContent>
              </Card>
            )}

            {!historyLoading && analysisHistory.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Leaf className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-center">Nenhuma análise realizada ainda.</p>
                </CardContent>
              </Card>
            )}

            {!historyLoading && analysisHistory.length > 0 && filteredHistories.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Leaf className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Nenhuma análise encontrada com os filtros atuais.
                  </p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Limpar todos os filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* List view */}
            {!historyLoading && viewMode === 'list' && paginatedHistories.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {paginatedHistories.map((h) => (
                      <div
                        key={h.id}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/history/${h.id}`)}
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="relative w-full md:w-32 h-32 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                            <Image src={toImageSrc(h.image)} alt={h.crop || 'Análise'} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-medium text-lg">
                                  {h.sicknessName
                                    ? sicknessLabel(h.sicknessName)
                                    : h.sicknessId
                                    ? 'Doença identificada'
                                    : 'Planta saudável'}
                                </h3>
                                {h.causes && (
                                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{h.causes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {h.sicknessConfidence != null && (
                                  <Badge className="bg-primaryGreen">
                                    {(h.sicknessConfidence * 100).toFixed(1)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                <span>
                                  {format(new Date(h.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                              {h.crop && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Leaf className="mr-1 h-3 w-3" />
                                  <span>
                                    Cultura: {cropLabel(h.crop)}
                                    {h.cropConfidence != null && ` (${(h.cropConfidence * 100).toFixed(1)}%)`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primaryGreen border-primaryGreen/30"
                                onClick={(e) => { e.stopPropagation(); setChatAnalysis(h); }}
                              >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                Chat
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); handleGenerateReport(h); }}
                                    disabled={generatingReportId === h.id || !canGenerateReport}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {generatingReportId === h.id ? 'Gerando relatório...' : 'Gerar relatório'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grid view */}
            {!historyLoading && viewMode === 'grid' && paginatedHistories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedHistories.map((h) => (
                  <Card
                    key={h.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/history/${h.id}`)}
                  >
                    <div className="relative w-full h-48 bg-muted">
                      <Image src={toImageSrc(h.image)} alt={h.crop || 'Análise'} fill className="object-cover" />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base line-clamp-2">
                        {h.sicknessName
                          ? sicknessLabel(h.sicknessName)
                          : h.sicknessId
                          ? 'Doença identificada'
                          : 'Planta saudável'}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center justify-between">
                          <span>Cultura: {cropLabel(h.crop) || '—'}</span>
                          {h.sicknessConfidence != null && (
                            <Badge className="bg-primaryGreen text-xs">
                              {(h.sicknessConfidence * 100).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {format(new Date(h.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primaryGreen border-primaryGreen/30"
                        onClick={(e) => { e.stopPropagation(); setChatAnalysis(h); }}
                      >
                        <MessageCircle className="mr-1 h-4 w-4" />
                        Chat
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleGenerateReport(h); }}
                            disabled={generatingReportId === h.id || !canGenerateReport}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {generatingReportId === h.id ? 'Gerando relatório...' : 'Gerar relatório'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!historyLoading && filteredHistories.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNumber: number;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber); }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
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
  );
}
