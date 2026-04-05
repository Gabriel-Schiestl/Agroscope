"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
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
import { History } from "../../../models/History";

// Status é um conceito local de UI, não existe no backend
type Status = "confirmed" | "unconfirmed" | "incorrect";

type HistoryWithMeta = History & {
  status: Status;
  notes?: string;
  location?: string;
  area?: string;
};

// Mock data alinhado com HistoryDto do backend
const MOCK_HISTORY_DATA: HistoryWithMeta[] = [
  {
    id: "1",
    createdAt: new Date("2024-04-15T14:30:00"),
    crop: "Soja",
    cropConfidence: 95.2,
    sicknessId: "sid-ferrugem-asiatica",
    sicknessConfidence: 92.5,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação de fungicidas triazóis ou estrobilurinas. Monitoramento constante da lavoura, especialmente em períodos de alta umidade.",
    explanation:
      "Ferrugem Asiática (Phakopsora pachyrhizi) identificada na folhagem.",
    causes:
      "Lesões amareladas nas folhas, pústulas na face inferior das folhas e amarelecimento com queda prematura das folhas.",
    status: "confirmed",
    location: "Fazenda São João - Talhão 3",
    area: "45 ha",
    userId: "user-001",
  },
  {
    id: "2",
    createdAt: new Date("2024-04-10T09:15:00"),
    crop: "Milho",
    cropConfidence: 98.3,
    sicknessId: "sid-mancha-cercospora",
    sicknessConfidence: 88.7,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Utilização de fungicidas à base de estrobilurinas e triazóis. Rotação de culturas com espécies não hospedeiras.",
    explanation:
      "Mancha de Cercospora (Cercospora zeae-maydis) identificada nas folhas.",
    causes:
      "Lesões retangulares de coloração amarelada a marrom paralelas às nervuras. Em estágios avançados ocorre coalescimento das lesões.",
    status: "unconfirmed",
    location: "Fazenda São João - Talhão 5",
    area: "32 ha",
    userId: "user-001",
  },
  {
    id: "3",
    createdAt: new Date("2024-04-05T11:20:00"),
    crop: "Café",
    cropConfidence: 97.1,
    sicknessId: "sid-ferrugem-cafeeiro",
    sicknessConfidence: 95.2,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação preventiva de fungicidas cúpricos. Manejo da densidade de plantio para melhorar a ventilação.",
    explanation:
      "Ferrugem do Cafeeiro (Hemileia vastatrix) identificada na folhagem.",
    causes:
      "Manchas cloróticas na face superior, pústulas amarelo-alaranjadas na face inferior e desfolha prematura em casos severos.",
    status: "confirmed",
    location: "Sítio Esperança",
    area: "12 ha",
    userId: "user-001",
  },
  {
    id: "4",
    createdAt: new Date("2024-03-28T16:45:00"),
    crop: "Algodão",
    cropConfidence: 94.6,
    sicknessId: "sid-ramularia",
    sicknessConfidence: 91.3,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação de fungicidas específicos. Monitoramento de condições climáticas favoráveis à doença.",
    explanation: "Ramulária (Ramularia areola) identificada nas folhas.",
    causes:
      "Manchas brancas angulares a circulares com necrose central e crescimento branco pulverulento na face inferior da folha.",
    status: "incorrect",
    notes: "Diagnóstico incorreto. Identificado manualmente como Mancha de Alternária.",
    location: "Fazenda Boa Vista - Setor Norte",
    area: "78 ha",
    userId: "user-002",
  },
  {
    id: "5",
    createdAt: new Date("2024-03-22T10:30:00"),
    crop: "Soja",
    cropConfidence: 96.8,
    sicknessId: "sid-mofo-branco",
    sicknessConfidence: 87.9,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação de fungicidas específicos. Redução da densidade de plantio em áreas com histórico da doença.",
    explanation:
      "Mofo Branco (Sclerotinia sclerotiorum) identificado nos tecidos vegetais.",
    causes:
      "Lesões aquosas nos tecidos, crescimento branco cotonoso sobre os tecidos afetados e formação de escleródios pretos.",
    status: "confirmed",
    location: "Fazenda Paraíso - Talhão 2",
    area: "55 ha",
    userId: "user-001",
  },
  {
    id: "6",
    createdAt: new Date("2024-03-15T14:00:00"),
    crop: "Trigo",
    cropConfidence: 93.5,
    sicknessId: "sid-giberela",
    sicknessConfidence: 89.4,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação de fungicidas no florescimento. Uso de variedades resistentes.",
    explanation:
      "Giberela (Fusarium graminearum) identificada nas espiguetas.",
    causes:
      "Descoloração das espiguetas com coloração esbranquiçada a rosada e presença de micélio rosado em alta umidade.",
    status: "unconfirmed",
    location: "Fazenda Santa Clara",
    area: "40 ha",
    userId: "user-002",
  },
  {
    id: "7",
    createdAt: new Date("2024-03-10T09:45:00"),
    crop: "Milho",
    cropConfidence: 98.0,
    sicknessId: "sid-ferrugem-comum",
    sicknessConfidence: 90.1,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação de fungicidas à base de triazóis e estrobilurinas. Uso de híbridos resistentes.",
    explanation:
      "Ferrugem Comum (Puccinia sorghi) identificada em ambas as faces das folhas.",
    causes:
      "Pústulas de coloração marrom-avermelhada em ambas as faces da folha com distribuição generalizada em casos severos.",
    status: "confirmed",
    location: "Fazenda São João - Talhão 1",
    area: "28 ha",
    userId: "user-001",
  },
  {
    id: "8",
    createdAt: new Date("2024-03-05T11:30:00"),
    crop: "Café",
    cropConfidence: 95.7,
    sicknessId: "sid-cercosporiose",
    sicknessConfidence: 86.5,
    image: "/placeholder.svg?height=200&width=200",
    handling:
      "Aplicação de fungicidas cúpricos. Manejo da adubação para evitar deficiência nutricional.",
    explanation:
      "Cercosporiose (Cercospora coffeicola) identificada nas folhas.",
    causes:
      "Manchas circulares marrom-claras com centro cinza-claro e bordas avermelhadas, com queda prematura de folhas.",
    status: "unconfirmed",
    location: "Sítio Esperança",
    area: "8 ha",
    userId: "user-001",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState("date-desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedHistory, setSelectedHistory] = useState<HistoryWithMeta | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredHistories = MOCK_HISTORY_DATA.filter((history) => {
    const searchText = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      (history.explanation || "").toLowerCase().includes(searchText) ||
      history.crop.toLowerCase().includes(searchText) ||
      (history.location || "").toLowerCase().includes(searchText);

    const matchesCrop = cropFilter === "Todos" || history.crop === cropFilter;
    const matchesStatus =
      statusFilter === "all" || history.status === statusFilter;
    const matchesDate =
      !dateFilter ||
      format(new Date(history.createdAt), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd");

    return matchesSearch && matchesCrop && matchesStatus && matchesDate;
  }).sort((a, b) => {
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
    setStatusFilter("all");
    setDateFilter(undefined);
    setSortOption("date-desc");
  };

  const openHistoryDetails = (history: HistoryWithMeta) => {
    setSelectedHistory(history);
    setIsDetailsOpen(true);
  };

  const renderStatusBadge = (status: Status) => {
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
                placeholder="Buscar por cultura, diagnóstico ou localização..."
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
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {paginatedHistories.length} de {filteredHistories.length}{" "}
            análises
          </p>
        </div>

        {filteredHistories.length === 0 && (
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
        {viewMode === "list" && paginatedHistories.length > 0 && (
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
                          src={history.image || "/placeholder.svg"}
                          alt={history.crop}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-medium text-lg">
                              {history.explanation || history.crop}
                            </h3>
                            {history.causes && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {history.causes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {renderStatusBadge(history.status)}
                            {history.sicknessConfidence != null && (
                              <Badge className="bg-primaryGreen">
                                {history.sicknessConfidence.toFixed(1)}%
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
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Leaf className="mr-1 h-3 w-3" />
                            <span>
                              Cultura: {history.crop} (
                              {history.cropConfidence.toFixed(1)}%)
                            </span>
                          </div>
                          {history.location && (
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
                              <span>Local: {history.location}</span>
                            </div>
                          )}
                          {history.area && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Área: {history.area}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end mt-2">
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
        {viewMode === "grid" && paginatedHistories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedHistories.map((history) => (
              <Card key={history.id} className="overflow-hidden">
                <div className="relative w-full h-48 bg-muted">
                  <Image
                    src={history.image || "/placeholder.svg"}
                    alt={history.crop}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {renderStatusBadge(history.status)}
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base line-clamp-2">
                    {history.explanation || history.crop}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span>Cultura: {history.crop}</span>
                      {history.sicknessConfidence != null && (
                        <Badge className="bg-primaryGreen text-xs">
                          {history.sicknessConfidence.toFixed(1)}%
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
                  {history.location && (
                    <p className="text-xs text-muted-foreground truncate">
                      Local: {history.location}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
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
        {filteredHistories.length > 0 && (
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

      {/* Modal de detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedHistory && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Análise</DialogTitle>
                <DialogDescription>
                  Análise realizada em{" "}
                  {format(
                    new Date(selectedHistory.createdAt),
                    "dd 'de' MMMM 'de' yyyy, HH:mm",
                    { locale: ptBR }
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={selectedHistory.image || "/placeholder.svg"}
                    alt={selectedHistory.crop}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Diagnóstico
                    </h3>
                    <p className="font-medium">
                      {selectedHistory.explanation || "Não identificado"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStatusBadge(selectedHistory.status)}
                      {selectedHistory.sicknessConfidence != null && (
                        <Badge className="bg-primaryGreen">
                          Confiança:{" "}
                          {selectedHistory.sicknessConfidence.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Cultura
                    </h3>
                    <p>
                      {selectedHistory.crop} (Confiança:{" "}
                      {selectedHistory.cropConfidence.toFixed(1)}%)
                    </p>
                  </div>

                  {selectedHistory.location && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Localização
                      </h3>
                      <p>{selectedHistory.location}</p>
                    </div>
                  )}

                  {selectedHistory.area && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Área
                      </h3>
                      <p>{selectedHistory.area}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {selectedHistory.causes && (
                  <div>
                    <h3 className="font-medium">Causas / Sintomas</h3>
                    <p className="text-muted-foreground mt-1">
                      {selectedHistory.causes}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium">Recomendações de Manejo</h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedHistory.handling}
                  </p>
                </div>

                {selectedHistory.notes && (
                  <div>
                    <h3 className="font-medium">Observações</h3>
                    <p className="text-muted-foreground mt-1">
                      {selectedHistory.notes}
                    </p>
                  </div>
                )}

                {selectedHistory.status === "incorrect" && (
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

                {selectedHistory.status === "confirmed" && (
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
