"use client";

import { useState } from "react";
import { cropLabel, sicknessLabel } from "../../../lib/agro-labels";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import { Separator } from "../../../components/ui/separator";
import {
  Search,
  CalendarIcon,
  Filter,
  Grid,
  List,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  FileText,
  Leaf,
  ArrowUpDown,
  X,
  MessageCircle,
} from "lucide-react";
import type { History } from "../../../models/History";
import { ChatPanel } from "../../../components/chat-panel";
import { useHistory } from "../../../hooks/use-history";
import { useLimit } from "../../../hooks/use-limit";
import { toImageSrc } from "../../../lib/utils";
import { generateAnalysisReportPdf } from "../../../lib/pdf/generate-analysis-report";
import {
  hasPlanFeature,
  PLAN_FEATURE_REPORT_GENERATION,
} from "../../../lib/plan-features";
import { toast } from "react-toastify";

const CROP_OPTIONS = ["Todos", "Soja", "Milho", "Café", "Algodão", "Trigo"];
const SORT_OPTIONS = [
  { value: "date-desc", label: "Data (mais recente)" },
  { value: "date-asc", label: "Data (mais antiga)" },
  { value: "confidence-desc", label: "Confiança (maior)" },
  { value: "confidence-asc", label: "Confiança (menor)" },
];

export default function HistoryPage() {
  const router = useRouter();
  const { history: historyEntries, isLoading } = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState("date-desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [chatAnalysis, setChatAnalysis] = useState<History | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(
    null
  );
  const itemsPerPage = 5;
  const { limit } = useLimit();
  const canGenerateReport = hasPlanFeature(
    limit?.featureFlags,
    PLAN_FEATURE_REPORT_GENERATION
  );

  const handleGenerateReport = async (history: History) => {
    if (!canGenerateReport) {
      toast.error(
        "Relatórios em PDF disponíveis apenas nos planos pagos. Faça upgrade do seu plano."
      );
      return;
    }
    setGeneratingReportId(history.id);
    try {
      await generateAnalysisReportPdf(history);
    } catch (error) {
      toast.error("Não foi possível gerar o relatório em PDF.");
    } finally {
      setGeneratingReportId(null);
    }
  };

  const filteredHistories = historyEntries
    .filter((history) => {
      const searchText = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        (history.explanation || "").toLowerCase().includes(searchText) ||
        (history.crop || "").toLowerCase().includes(searchText);

      const matchesCrop = cropFilter === "Todos" || history.crop === cropFilter;
      const matchesDate =
        !dateFilter ||
        format(new Date(history.createdAt), "yyyy-MM-dd") ===
          format(dateFilter, "yyyy-MM-dd");

      return matchesSearch && matchesCrop && matchesDate;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "confidence-desc":
          return (b.sicknessConfidence ?? 0) - (a.sicknessConfidence ?? 0);
        case "confidence-asc":
          return (a.sicknessConfidence ?? 0) - (b.sicknessConfidence ?? 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);
  const paginatedHistories = filteredHistories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery("");
    setCropFilter("Todos");
    setDateFilter(undefined);
    setSortOption("date-desc");
  };

  const openHistoryDetails = (history: History) => {
    router.push(`/history/${history.id}`);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Histórico de Análises</h1>
        <p className="text-mediumGray">
          Consulte e gerencie todas as análises realizadas
        </p>
      </div>

      {/* Filtros e controles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediumGray"
                size={16}
              />
              <Input
                placeholder="Buscar por cultura ou diagnóstico..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mediumGray hover:text-darkGray"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Cultura" />
                </SelectTrigger>
                <SelectContent>
                  {CROP_OPTIONS.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                  {dateFilter && (
                    <div className="p-2 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateFilter(undefined)}
                      >
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
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpar
              </Button>

              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className={`rounded-none rounded-l-md ${
                    viewMode === "list"
                      ? "bg-primaryGreen hover:bg-lightGreen"
                      : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={`rounded-none rounded-r-md ${
                    viewMode === "grid"
                      ? "bg-primaryGreen hover:bg-lightGreen"
                      : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-4">
        {!isLoading && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedHistories.length} de{" "}
              {filteredHistories.length} análises
            </p>
          </div>
        )}

        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primaryGreen border-t-transparent rounded-full mb-4"></div>
              <p className="text-muted-foreground">Carregando histórico...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && historyEntries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma análise realizada ainda.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          historyEntries.length > 0 &&
          filteredHistories.length === 0 && (
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

        {/* Visualização em lista */}
        {!isLoading && viewMode === "list" && paginatedHistories.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {paginatedHistories.map((history) => (
                  <div
                    key={history.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative w-full md:w-32 h-32 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={toImageSrc(history.image)}
                          alt={history.crop || "Análise"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-medium text-lg">
                              {history.sicknessName
                                ? sicknessLabel(history.sicknessName)
                                : history.sicknessId
                                ? "Doença identificada"
                                : "Planta saudável"}
                            </h3>
                            {history.causes && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {history.causes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {history.sicknessConfidence != null && (
                              <Badge className="bg-primaryGreen">
                                {(history.sicknessConfidence * 100).toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            <span>
                              {format(
                                new Date(history.createdAt),
                                "dd 'de' MMMM 'de' yyyy, HH:mm",
                                { locale: ptBR }
                              )}
                            </span>
                          </div>
                          {history.crop && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Leaf className="mr-1 h-3 w-3" />
                              <span>
                                Cultura: {cropLabel(history.crop)}
                                {history.cropConfidence != null &&
                                  ` (${(history.cropConfidence * 100).toFixed(1)}%)`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primaryGreen border-primaryGreen/30"
                            onClick={() => setChatAnalysis(history)}
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primaryGreen"
                            onClick={() => openHistoryDetails(history)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Ver detalhes
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openHistoryDetails(history)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleGenerateReport(history)}
                                disabled={
                                  generatingReportId === history.id ||
                                  !canGenerateReport
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                {generatingReportId === history.id
                                  ? "Gerando relatório..."
                                  : "Gerar relatório"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
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

        {/* Visualização em grade */}
        {!isLoading && viewMode === "grid" && paginatedHistories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedHistories.map((history) => (
              <Card key={history.id} className="overflow-hidden">
                <div className="relative w-full h-48 bg-muted">
                  <Image
                    src={toImageSrc(history.image)}
                    alt={history.crop || "Análise"}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base line-clamp-2">
                    {history.sicknessName
                      ? sicknessLabel(history.sicknessName)
                      : history.sicknessId
                      ? "Doença identificada"
                      : "Planta saudável"}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span>Cultura: {cropLabel(history.crop) || "—"}</span>
                      {history.sicknessConfidence != null && (
                        <Badge className="bg-primaryGreen text-xs">
                          {(history.sicknessConfidence * 100).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(
                      new Date(history.createdAt),
                      "dd 'de' MMMM 'de' yyyy, HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primaryGreen border-primaryGreen/30"
                      onClick={() => setChatAnalysis(history)}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primaryGreen"
                      onClick={() => openHistoryDetails(history)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver detalhes
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openHistoryDetails(history)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleGenerateReport(history)}
                        disabled={
                          generatingReportId === history.id ||
                          !canGenerateReport
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {generatingReportId === history.id
                          ? "Gerando relatório..."
                          : "Gerar relatório"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
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

        {/* Paginação */}
        {!isLoading && filteredHistories.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
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
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <ChatPanel
        open={chatAnalysis !== null}
        analysis={chatAnalysis}
        onClose={() => setChatAnalysis(null)}
      />
    </div>
  );
}
