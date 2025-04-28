"use client";

import { useState } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  CheckCircle,
  AlertCircle,
  Leaf,
  ArrowUpDown,
  X,
} from "lucide-react";

// Tipos para as análises
interface Analysis {
  id: string;
  date: string;
  crop: string;
  prediction: string;
  confidence: number;
  imageUrl: string;
  status: "confirmed" | "unconfirmed" | "incorrect";
  notes?: string;
  handling: string;
  location?: string;
  area?: string;
}

// Dados de exemplo para o histórico de análises
const MOCK_ANALYSES: Analysis[] = [
  {
    id: "1",
    date: "2024-04-15T14:30:00",
    crop: "Soja",
    prediction: "Ferrugem Asiática (Phakopsora pachyrhizi)",
    confidence: 92.5,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação de fungicidas triazóis ou estrobilurinas. Monitoramento constante da lavoura, especialmente em períodos de alta umidade.",
    location: "Fazenda São João - Talhão 3",
    area: "45 ha",
  },
  {
    id: "2",
    date: "2024-04-10T09:15:00",
    crop: "Milho",
    prediction: "Mancha de Cercospora (Cercospora zeae-maydis)",
    confidence: 88.7,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "unconfirmed",
    handling:
      "Utilização de fungicidas à base de estrobilurinas e triazóis. Rotação de culturas com espécies não hospedeiras.",
    location: "Fazenda São João - Talhão 5",
    area: "32 ha",
  },
  {
    id: "3",
    date: "2024-04-05T11:20:00",
    crop: "Café",
    prediction: "Ferrugem do Cafeeiro (Hemileia vastatrix)",
    confidence: 95.2,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação preventiva de fungicidas cúpricos. Manejo da densidade de plantio para melhorar a ventilação.",
    location: "Sítio Esperança",
    area: "12 ha",
  },
  {
    id: "4",
    date: "2024-03-28T16:45:00",
    crop: "Algodão",
    prediction: "Ramulária (Ramularia areola)",
    confidence: 91.3,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "incorrect",
    notes:
      "Diagnóstico incorreto. Identificado manualmente como Mancha de Alternária.",
    handling:
      "Aplicação de fungicidas específicos. Monitoramento de condições climáticas favoráveis à doença.",
    location: "Fazenda Boa Vista - Setor Norte",
    area: "78 ha",
  },
  {
    id: "5",
    date: "2024-03-22T10:30:00",
    crop: "Soja",
    prediction: "Mofo Branco (Sclerotinia sclerotiorum)",
    confidence: 87.9,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação de fungicidas específicos. Redução da densidade de plantio em áreas com histórico da doença.",
    location: "Fazenda Paraíso - Talhão 2",
    area: "55 ha",
  },
  {
    id: "6",
    date: "2024-03-15T14:00:00",
    crop: "Trigo",
    prediction: "Giberela (Fusarium graminearum)",
    confidence: 89.4,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "unconfirmed",
    handling:
      "Aplicação de fungicidas no florescimento. Uso de variedades resistentes.",
    location: "Fazenda Santa Clara",
    area: "40 ha",
  },
  {
    id: "7",
    date: "2024-03-10T09:45:00",
    crop: "Milho",
    prediction: "Ferrugem Comum (Puccinia sorghi)",
    confidence: 90.1,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação de fungicidas à base de triazóis e estrobilurinas. Uso de híbridos resistentes.",
    location: "Fazenda São João - Talhão 1",
    area: "28 ha",
  },
  {
    id: "8",
    date: "2024-03-05T11:30:00",
    crop: "Café",
    prediction: "Cercosporiose (Cercospora coffeicola)",
    confidence: 86.5,
    imageUrl: "/placeholder.svg?height=200&width=200",
    status: "unconfirmed",
    handling:
      "Aplicação de fungicidas cúpricos. Manejo da adubação para evitar deficiência nutricional.",
    location: "Sítio Esperança",
    area: "8 ha",
  },
];

// Opções para filtros
const CROP_OPTIONS = ["Todos", "Soja", "Milho", "Café", "Algodão", "Trigo"];
const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: "Confirmado" },
  { value: "unconfirmed", label: "Não confirmado" },
  { value: "incorrect", label: "Incorreto" },
];
const SORT_OPTIONS = [
  { value: "date-desc", label: "Data (mais recente)" },
  { value: "date-asc", label: "Data (mais antiga)" },
  { value: "confidence-desc", label: "Confiança (maior)" },
  { value: "confidence-asc", label: "Confiança (menor)" },
];

export default function HistoryPage() {
  // Estados para filtros e visualização
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState("date-desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar e ordenar análises
  const filteredAnalyses = MOCK_ANALYSES.filter((analysis) => {
    // Filtro de busca
    const matchesSearch =
      searchQuery === "" ||
      analysis.prediction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (analysis.location &&
        analysis.location.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtro de cultura
    const matchesCrop = cropFilter === "Todos" || analysis.crop === cropFilter;

    // Filtro de status
    const matchesStatus =
      statusFilter === "all" || analysis.status === statusFilter;

    // Filtro de data
    const matchesDate =
      !dateFilter ||
      format(parseISO(analysis.date), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd");

    return matchesSearch && matchesCrop && matchesStatus && matchesDate;
  }).sort((a, b) => {
    // Ordenação
    switch (sortOption) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "confidence-desc":
        return b.confidence - a.confidence;
      case "confidence-asc":
        return a.confidence - b.confidence;
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchQuery("");
    setCropFilter("Todos");
    setStatusFilter("all");
    setDateFilter(undefined);
    setSortOption("date-desc");
  };

  // Abrir detalhes de uma análise
  const openAnalysisDetails = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setIsDetailsOpen(true);
  };

  // Renderizar badge de status
  const renderStatusBadge = (status: Analysis["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Confirmado
          </Badge>
        );
      case "unconfirmed":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Não confirmado
          </Badge>
        );
      case "incorrect":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Incorreto
          </Badge>
        );
    }
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
                placeholder="Buscar por cultura, doença ou localização..."
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
        {/* Contagem de resultados */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {paginatedAnalyses.length} de {filteredAnalyses.length}{" "}
            análises
          </p>
        </div>

        {/* Lista vazia */}
        {filteredAnalyses.length === 0 && (
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
        {viewMode === "list" && paginatedAnalyses.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {paginatedAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative w-full md:w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={analysis.imageUrl || "/placeholder.svg"}
                          alt={analysis.prediction}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h3 className="font-medium text-lg">
                            {analysis.prediction}
                          </h3>
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(analysis.status)}
                            <Badge className="bg-primaryGreen">
                              Confiança: {analysis.confidence.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            <span>
                              {format(
                                parseISO(analysis.date),
                                "dd 'de' MMMM 'de' yyyy, HH:mm",
                                { locale: ptBR }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Leaf className="mr-1 h-3 w-3" />
                            <span>Cultura: {analysis.crop}</span>
                          </div>
                          {analysis.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <svg
                                className="mr-1 h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>Local: {analysis.location}</span>
                            </div>
                          )}
                          {analysis.area && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <svg
                                className="mr-1 h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6V5c0-1.1.9-2 2-2h2" />
                                <path d="M11 3h2c1.1 0 2 .9 2 2v1" />
                                <path d="M21 6V5c0-1.1-.9-2-2-2h-2" />
                                <path d="M3 18v1c0 1.1.9 2 2 2h2" />
                                <path d="M11 21h2c1.1 0 2-.9 2-2v-1" />
                                <path d="M21 18v1c0 1.1-.9 2-2 2h-2" />
                                <path d="M3 10v4" />
                                <path d="M21 10v4" />
                                <path d="M10 3v18" />
                                <path d="M14 3v18" />
                              </svg>
                              <span>Área: {analysis.area}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primaryGreen"
                            onClick={() => openAnalysisDetails(analysis)}
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
                                onClick={() => openAnalysisDetails(analysis)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Gerar relatório
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
        {viewMode === "grid" && paginatedAnalyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedAnalyses.map((analysis) => (
              <Card key={analysis.id} className="overflow-hidden">
                <div className="relative w-full h-48">
                  <Image
                    src={analysis.imageUrl || "/placeholder.svg"}
                    alt={analysis.prediction}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {renderStatusBadge(analysis.status)}
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">
                    {analysis.prediction}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span>Cultura: {analysis.crop}</span>
                      <Badge className="bg-primaryGreen text-xs">
                        {analysis.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(
                      parseISO(analysis.date),
                      "dd 'de' MMMM 'de' yyyy, HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                  {analysis.location && (
                    <p className="text-xs text-muted-foreground truncate">
                      Local: {analysis.location}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primaryGreen"
                    onClick={() => openAnalysisDetails(analysis)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Ver detalhes
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openAnalysisDetails(analysis)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Gerar relatório
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
        {filteredAnalyses.length > 0 && (
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

                // Lógica para mostrar as páginas corretas quando há muitas páginas
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

      {/* Modal de detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedAnalysis && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Análise</DialogTitle>
                <DialogDescription>
                  Análise realizada em{" "}
                  {format(
                    parseISO(selectedAnalysis.date),
                    "dd 'de' MMMM 'de' yyyy, HH:mm",
                    { locale: ptBR }
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <Image
                    src={selectedAnalysis.imageUrl || "/placeholder.svg"}
                    alt={selectedAnalysis.prediction}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Diagnóstico
                    </h3>
                    <p className="font-medium text-lg">
                      {selectedAnalysis.prediction}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStatusBadge(selectedAnalysis.status)}
                      <Badge className="bg-primaryGreen">
                        Confiança: {selectedAnalysis.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Cultura
                    </h3>
                    <p>{selectedAnalysis.crop}</p>
                  </div>

                  {selectedAnalysis.location && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Localização
                      </h3>
                      <p>{selectedAnalysis.location}</p>
                    </div>
                  )}

                  {selectedAnalysis.area && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Área
                      </h3>
                      <p>{selectedAnalysis.area}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Recomendações de Manejo</h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedAnalysis.handling}
                  </p>
                </div>

                {selectedAnalysis.notes && (
                  <div>
                    <h3 className="font-medium">Observações</h3>
                    <p className="text-muted-foreground mt-1">
                      {selectedAnalysis.notes}
                    </p>
                  </div>
                )}

                {selectedAnalysis.status === "incorrect" && (
                  <Alert className="bg-red-100 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-800" />
                    <AlertTitle className="text-red-800">
                      Diagnóstico incorreto
                    </AlertTitle>
                    <AlertDescription className="text-red-800">
                      Esta análise foi marcada como incorreta. Verifique as
                      observações para mais detalhes.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedAnalysis.status === "confirmed" && (
                  <Alert className="bg-green-100 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-800" />
                    <AlertTitle className="text-green-800">
                      Diagnóstico confirmado
                    </AlertTitle>
                    <AlertDescription className="text-green-800">
                      Esta análise foi confirmada por um especialista.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
                <Button className="bg-primaryGreen hover:bg-lightGreen">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Diagnóstico
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
