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
import { Sickness } from "../../../models/Sickness";

// Status personalizado para o histórico (não definido no modelo)
type Status = "confirmed" | "unconfirmed" | "incorrect";

// Dados de exemplo para o histórico de análises baseado no modelo History
const MOCK_HISTORY_DATA: (History & {
  status: Status;
  notes?: string;
  location?: string;
  area?: string;
})[] = [
  {
    id: "1",
    createdAt: new Date("2024-04-15T14:30:00"),
    crop: "Soja",
    cropConfidence: 95.2,
    sickness: {
      name: "Ferrugem Asiática",
      description: "Phakopsora pachyrhizi",
      symptoms: [
        "Lesões amareladas nas folhas",
        "Pústulas na face inferior das folhas",
        "Amarelecimento e queda prematura das folhas",
      ],
    },
    sicknessConfidence: 92.5,
    image: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação de fungicidas triazóis ou estrobilurinas. Monitoramento constante da lavoura, especialmente em períodos de alta umidade.",
    location: "Fazenda São João - Talhão 3",
    area: "45 ha",
    clientId: "client-001",
    userId: "user-001",
  },
  {
    id: "2",
    createdAt: new Date("2024-04-10T09:15:00"),
    crop: "Milho",
    cropConfidence: 98.3,
    sickness: {
      name: "Mancha de Cercospora",
      description: "Cercospora zeae-maydis",
      symptoms: [
        "Lesões retangulares de coloração amarelada a marrom",
        "Lesões paralelas às nervuras da folha",
        "Em estágios avançados, coalescimento das lesões",
      ],
    },
    sicknessConfidence: 88.7,
    image: "/placeholder.svg?height=200&width=200",
    status: "unconfirmed",
    handling:
      "Utilização de fungicidas à base de estrobilurinas e triazóis. Rotação de culturas com espécies não hospedeiras.",
    location: "Fazenda São João - Talhão 5",
    area: "32 ha",
    clientId: "client-001",
    userId: "user-001",
  },
  {
    id: "3",
    createdAt: new Date("2024-04-05T11:20:00"),
    crop: "Café",
    cropConfidence: 97.1,
    sickness: {
      name: "Ferrugem do Cafeeiro",
      description: "Hemileia vastatrix",
      symptoms: [
        "Manchas cloróticas na face superior das folhas",
        "Pústulas amarelo-alaranjadas na face inferior das folhas",
        "Desfolha prematura em casos severos",
      ],
    },
    sicknessConfidence: 95.2,
    image: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação preventiva de fungicidas cúpricos. Manejo da densidade de plantio para melhorar a ventilação.",
    location: "Sítio Esperança",
    area: "12 ha",
    clientId: "client-002",
    userId: "user-001",
  },
  {
    id: "4",
    createdAt: new Date("2024-03-28T16:45:00"),
    crop: "Algodão",
    cropConfidence: 94.6,
    sickness: {
      name: "Ramulária",
      description: "Ramularia areola",
      symptoms: [
        "Manchas brancas, angulares a circulares",
        "Necrose no centro das manchas",
        "Crescimento branco pulverulento na face inferior da folha",
      ],
    },
    sicknessConfidence: 91.3,
    image: "/placeholder.svg?height=200&width=200",
    status: "incorrect",
    notes:
      "Diagnóstico incorreto. Identificado manualmente como Mancha de Alternária.",
    handling:
      "Aplicação de fungicidas específicos. Monitoramento de condições climáticas favoráveis à doença.",
    location: "Fazenda Boa Vista - Setor Norte",
    area: "78 ha",
    clientId: "client-003",
    userId: "user-002",
  },
  {
    id: "5",
    createdAt: new Date("2024-03-22T10:30:00"),
    crop: "Soja",
    cropConfidence: 96.8,
    sickness: {
      name: "Mofo Branco",
      description: "Sclerotinia sclerotiorum",
      symptoms: [
        "Lesões aquosas nos tecidos vegetais",
        "Crescimento branco e cotonoso sobre os tecidos afetados",
        "Formação de escleródios (estruturas de resistência pretas)",
      ],
    },
    sicknessConfidence: 87.9,
    image: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação de fungicidas específicos. Redução da densidade de plantio em áreas com histórico da doença.",
    location: "Fazenda Paraíso - Talhão 2",
    area: "55 ha",
    clientId: "client-004",
    userId: "user-001",
  },
  {
    id: "6",
    createdAt: new Date("2024-03-15T14:00:00"),
    crop: "Trigo",
    cropConfidence: 93.5,
    sickness: {
      name: "Giberela",
      description: "Fusarium graminearum",
      symptoms: [
        "Descoloração das espiguetas",
        "Espiguetas de coloração esbranquiçada a rosada",
        "Presença de micélio rosado em condições de alta umidade",
      ],
    },
    sicknessConfidence: 89.4,
    image: "/placeholder.svg?height=200&width=200",
    status: "unconfirmed",
    handling:
      "Aplicação de fungicidas no florescimento. Uso de variedades resistentes.",
    location: "Fazenda Santa Clara",
    area: "40 ha",
    clientId: "client-001",
    userId: "user-002",
  },
  {
    id: "7",
    createdAt: new Date("2024-03-10T09:45:00"),
    crop: "Milho",
    cropConfidence: 98.0,
    sickness: {
      name: "Ferrugem Comum",
      description: "Puccinia sorghi",
      symptoms: [
        "Pústulas de coloração marrom-avermelhada",
        "Pústulas em ambas as faces da folha",
        "Distribuição por toda a planta em casos severos",
      ],
    },
    sicknessConfidence: 90.1,
    image: "/placeholder.svg?height=200&width=200",
    status: "confirmed",
    handling:
      "Aplicação de fungicidas à base de triazóis e estrobilurinas. Uso de híbridos resistentes.",
    location: "Fazenda São João - Talhão 1",
    area: "28 ha",
    clientId: "client-001",
    userId: "user-001",
  },
  {
    id: "8",
    createdAt: new Date("2024-03-05T11:30:00"),
    crop: "Café",
    cropConfidence: 95.7,
    sickness: {
      name: "Cercosporiose",
      description: "Cercospora coffeicola",
      symptoms: [
        "Manchas circulares de coloração marrom-clara a castanha",
        "Centro cinza-claro com bordas avermelhadas",
        "Queda prematura de folhas",
      ],
    },
    sicknessConfidence: 86.5,
    image: "/placeholder.svg?height=200&width=200",
    status: "unconfirmed",
    handling:
      "Aplicação de fungicidas cúpricos. Manejo da adubação para evitar deficiência nutricional.",
    location: "Sítio Esperança",
    area: "8 ha",
    clientId: "client-002",
    userId: "user-001",
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
  const [selectedHistory, setSelectedHistory] = useState<
    (typeof MOCK_HISTORY_DATA)[0] | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar e ordenar análises
  const filteredHistories = MOCK_HISTORY_DATA.filter((history) => {
    // Filtro de busca
    const matchesSearch =
      searchQuery === "" ||
      history.sickness.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (history.location &&
        history.location.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtro de cultura
    const matchesCrop = cropFilter === "Todos" || history.crop === cropFilter;

    // Filtro de status
    const matchesStatus =
      statusFilter === "all" || history.status === statusFilter;

    // Filtro de data
    const matchesDate =
      !dateFilter ||
      format(history.createdAt, "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd");

    return matchesSearch && matchesCrop && matchesStatus && matchesDate;
  }).sort((a, b) => {
    // Ordenação
    switch (sortOption) {
      case "date-desc":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "date-asc":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "confidence-desc":
        return b.sicknessConfidence - a.sicknessConfidence;
      case "confidence-asc":
        return a.sicknessConfidence - b.sicknessConfidence;
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);
  const paginatedHistories = filteredHistories.slice(
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
  const openHistoryDetails = (history: (typeof MOCK_HISTORY_DATA)[0]) => {
    setSelectedHistory(history);
    setIsDetailsOpen(true);
  };

  // Renderizar badge de status
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
            Mostrando {paginatedHistories.length} de {filteredHistories.length}{" "}
            análises
          </p>
        </div>

        {/* Lista vazia */}
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
                      <div className="relative w-full md:w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={history.image || "/placeholder.svg"}
                          alt={history.sickness.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h3 className="font-medium text-lg">
                            {history.sickness.name}
                            {history.sickness.description && (
                              <span className="text-sm font-normal text-muted-foreground ml-1">
                                ({history.sickness.description})
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(history.status)}
                            <Badge className="bg-primaryGreen">
                              Confiança: {history.sicknessConfidence.toFixed(1)}
                              %
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            <span>
                              {format(
                                history.createdAt,
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
                                <path d="M21 18v1c0 1.1-.9-2-2-2h-2" />
                                <path d="M3 10v4" />
                                <path d="M21 10v4" />
                                <path d="M10 3v18" />
                                <path d="M14 3v18" />
                              </svg>
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
                <div className="relative w-full h-48">
                  <Image
                    src={history.image || "/placeholder.svg"}
                    alt={history.sickness.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {renderStatusBadge(history.status)}
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">
                    {history.sickness.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span>Cultura: {history.crop}</span>
                      <Badge className="bg-primaryGreen text-xs">
                        {history.sicknessConfidence.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(
                      history.createdAt,
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
          {selectedHistory && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Análise</DialogTitle>
                <DialogDescription>
                  Análise realizada em{" "}
                  {format(
                    selectedHistory.createdAt,
                    "dd 'de' MMMM 'de' yyyy, HH:mm",
                    { locale: ptBR }
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <Image
                    src={selectedHistory.image || "/placeholder.svg"}
                    alt={selectedHistory.sickness.name}
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
                      {selectedHistory.sickness.name}
                      {selectedHistory.sickness.description && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          ({selectedHistory.sickness.description})
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStatusBadge(selectedHistory.status)}
                      <Badge className="bg-primaryGreen">
                        Confiança:{" "}
                        {selectedHistory.sicknessConfidence.toFixed(1)}%
                      </Badge>
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
                <div>
                  <h3 className="font-medium">Sintomas</h3>
                  <ul className="list-disc pl-5 mt-2">
                    {selectedHistory.sickness.symptoms.map((symptom, index) => (
                      <li key={index} className="text-muted-foreground">
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

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
