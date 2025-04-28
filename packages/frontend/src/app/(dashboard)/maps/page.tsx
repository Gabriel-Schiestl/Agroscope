"use client";

import { useState, useEffect } from "react";
import api from "../../../../shared/http/http.config";
import { Client, Address, Crop } from "@/models/Client";
import { Visit, VisitStatus } from "@/models/Visit";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Layers,
  Search,
  MapPin,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic<any>(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic<any>(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic<any>(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic<any>(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polygon = dynamic<any>(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);

// Mock data for clients/properties
const CLIENTS = [
  {
    id: "1",
    name: "Fazenda São João",
    owner: "João Silva",
    location: "Ribeirão Preto, SP",
    coordinates: { lat: -21.1767, lng: -47.8208 },
    area: 1250,
    crops: ["Soja", "Milho"],
    status: "active",
    lastVisit: "15/03/2024",
    nextVisit: "22/04/2024",
    soilType: "Latossolo Vermelho",
    notes:
      "Propriedade com alta produtividade. Necessário monitoramento de pragas na área sul.",
  },
  {
    id: "2",
    name: "Sítio Esperança",
    owner: "Maria Oliveira",
    location: "Uberaba, MG",
    coordinates: { lat: -19.7472, lng: -47.9381 },
    area: 450,
    crops: ["Café", "Laranja"],
    status: "active",
    lastVisit: "02/04/2024",
    nextVisit: "10/05/2024",
    soilType: "Argissolo Vermelho-Amarelo",
    notes:
      "Problemas com irrigação na área de café. Recomendado análise de solo na próxima visita.",
  },
  {
    id: "3",
    name: "Fazenda Boa Vista",
    owner: "Pedro Santos",
    location: "Rondonópolis, MT",
    coordinates: { lat: -16.4673, lng: -54.6367 },
    area: 3200,
    crops: ["Algodão", "Soja", "Milho"],
    status: "active",
    lastVisit: "28/03/2024",
    nextVisit: "05/05/2024",
    soilType: "Latossolo Vermelho-Amarelo",
    notes:
      "Grande propriedade com áreas de preservação. Monitorar níveis de fertilidade no setor norte.",
  },
  {
    id: "4",
    name: "Rancho Dourado",
    owner: "Ana Ferreira",
    location: "Barretos, SP",
    coordinates: { lat: -20.5575, lng: -48.5696 },
    area: 780,
    crops: ["Cana-de-açúcar"],
    status: "pending",
    lastVisit: "10/02/2024",
    nextVisit: "18/04/2024",
    soilType: "Nitossolo Vermelho",
    notes:
      "Primeira visita técnica agendada. Proprietário interessado em expandir área de cultivo.",
  },
  {
    id: "5",
    name: "Fazenda Paraíso",
    owner: "Carlos Mendes",
    location: "Rio Verde, GO",
    coordinates: { lat: -17.7921, lng: -50.9192 },
    area: 2100,
    crops: ["Soja", "Milho", "Sorgo"],
    status: "active",
    lastVisit: "05/04/2024",
    nextVisit: "12/05/2024",
    soilType: "Latossolo Vermelho",
    notes:
      "Rotação de culturas bem estabelecida. Verificar sistema de drenagem na próxima visita.",
  },
];

// Ajuste na função getFarmBoundaries para usar coordenadas do client
const getFarmBoundaries = (client: Client) => {
  const coordinates = getClientCoordinates(client);
  // Create a simple polygon around the center point
  const offset = 0.02; // Roughly 2km
  return [
    [coordinates.lat - offset, coordinates.lng - offset * 1.5],
    [coordinates.lat - offset * 0.5, coordinates.lng - offset * 0.8],
    [coordinates.lat + offset * 0.8, coordinates.lng - offset],
    [coordinates.lat + offset, coordinates.lng + offset * 0.5],
    [coordinates.lat - offset * 0.2, coordinates.lng + offset * 1.2],
    [coordinates.lat - offset, coordinates.lng - offset * 0.5],
  ];
};

// Ajuste na função getFarmAreas para usar coordenadas do client
const getFarmAreas = (client: Client) => {
  const coordinates = getClientCoordinates(client);
  const offset = 0.02;
  return [
    {
      name: "Área de Soja",
      color: "#4CAF50",
      polygon: [
        [coordinates.lat - offset * 0.8, coordinates.lng - offset],
        [coordinates.lat - offset * 0.2, coordinates.lng - offset * 0.6],
        [coordinates.lat + offset * 0.4, coordinates.lng - offset * 0.8],
        [coordinates.lat + offset * 0.6, coordinates.lng - offset * 0.2],
        [coordinates.lat + offset * 0.2, coordinates.lng + offset * 0.4],
        [coordinates.lat - offset * 0.4, coordinates.lng + offset * 0.2],
      ],
    },
    {
      name: "Área de Milho",
      color: "#66BB6A",
      polygon: [
        [coordinates.lat - offset * 0.5, coordinates.lng + offset * 0.2],
        [coordinates.lat - offset * 0.8, coordinates.lng + offset * 0.6],
        [coordinates.lat - offset * 0.2, coordinates.lng + offset * 0.8],
        [coordinates.lat + offset * 0.2, coordinates.lng + offset * 0.4],
      ],
    },
    {
      name: "Reserva Legal",
      color: "#2E7D32",
      polygon: [
        [coordinates.lat + offset * 0.4, coordinates.lng - offset * 0.2],
        [coordinates.lat + offset * 0.8, coordinates.lng - offset * 0.4],
        [coordinates.lat + offset * 0.6, coordinates.lng + offset * 0.2],
        [coordinates.lat + offset * 0.2, coordinates.lng + offset * 0.4],
      ],
    },
  ];
};

// Available map layers
const MAP_LAYERS = [
  {
    id: "street",
    name: "Ruas",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  {
    id: "satellite",
    name: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  {
    id: "terrain",
    name: "Terreno",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  },
];

// Available crop types for filtering
const CROP_TYPES = Object.values(Crop);

// Função auxiliar para obter coordenadas do cliente
const getClientCoordinates = (client: Client) => {
  if (client.address?.latitude && client.address?.longitude) {
    return {
      lat: client.address.latitude,
      lng: client.address.longitude,
    };
  }

  // Se não tiver coordenadas, retorna uma posição padrão no Brasil
  return { lat: -19.9167, lng: -43.9345 };
};

// Função auxiliar para obter localização formatada
const getFormattedLocation = (address: Address) => {
  if (!address) return "Localização não disponível";
  return `${address.city || ""}, ${address.state || ""}`;
};

// Função para obter a data da última visita
const getLastVisitDate = (visits?: Visit[]) => {
  if (!visits || visits.length === 0) return "Nenhuma visita";

  const completedVisits = visits
    .filter((visit) => visit.status === VisitStatus.COMPLETED)
    .sort(
      (a, b) =>
        new Date(b.scheduledDate || 0).getTime() -
        new Date(a.scheduledDate || 0).getTime()
    );

  if (completedVisits.length === 0) return "Nenhuma visita concluída";
  return new Date(completedVisits[0].scheduledDate || 0).toLocaleDateString();
};

// Função para obter a data da próxima visita
const getNextVisitDate = (visits?: Visit[]) => {
  if (!visits || visits.length === 0) return "Nenhuma visita agendada";

  const pendingVisits = visits
    .filter((visit) => visit.status === VisitStatus.PENDING)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate || 0).getTime() -
        new Date(b.scheduledDate || 0).getTime()
    );

  if (pendingVisits.length === 0) return "Nenhuma visita pendente";
  return new Date(pendingVisits[0].scheduledDate || 0).toLocaleDateString();
};

export default function MapsPage() {
  const [isClient, setIsClient] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMapLayer, setActiveMapLayer] = useState("street");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [activeCropFilters, setActiveCropFilters] = useState<string[]>([]);
  const [areaRange, setAreaRange] = useState([0, 5000]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  useEffect(() => {
    setIsClient(true);

    // Buscar clientes
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clients");
        setClients(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
        setError("Falha ao carregar os clientes. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // No início do retorno do componente, antes de renderizar o conteúdo principal
  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] bg-lightGray flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryGreen mb-4"></div>
          <p className="text-mediumGray">Carregando propriedades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-8rem)] bg-lightGray flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primaryGreen hover:bg-lightGreen"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Filter clients based on search query and crop filters
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.address?.city &&
        client.address.city
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (client.address?.state &&
        client.address.state.toLowerCase().includes(searchQuery.toLowerCase()));

    // Verifica se existe actualCrop e se está nos filtros
    const matchesCrops =
      activeCropFilters.length === 0 ||
      (client.actualCrop && activeCropFilters.includes(client.actualCrop));

    const matchesArea =
      client.totalArea >= areaRange[0] && client.totalArea <= areaRange[1];

    return matchesSearch && matchesCrops && matchesArea;
  });

  // Toggle crop filter
  const toggleCropFilter = (crop: string) => {
    if (activeCropFilters.includes(crop)) {
      setActiveCropFilters(activeCropFilters.filter((c) => c !== crop));
    } else {
      setActiveCropFilters([...activeCropFilters, crop]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCropFilters([]);
    setAreaRange([0, 5000]);
    setSearchQuery("");
  };

  // Navigate to client details page
  const navigateToClientDetails = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  if (!isClient) {
    return (
      <div className="h-[calc(100vh-8rem)] bg-lightGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryGreen"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl">Mapa de Propriedades</h1>
          <p className="text-mediumGray">
            Visualize e gerencie suas propriedades no mapa
          </p>
        </div>
        <div className="flex gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
                {(activeCropFilters.length > 0 ||
                  areaRange[0] > 0 ||
                  areaRange[1] < 5000) && (
                  <Badge className="ml-2 bg-primaryGreen text-white">
                    {activeCropFilters.length +
                      (areaRange[0] > 0 || areaRange[1] < 5000 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filtrar Propriedades</DrawerTitle>
                <DrawerDescription>
                  Ajuste os filtros para encontrar propriedades específicas
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Culturas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CROP_TYPES.map((crop) => (
                      <div key={crop} className="flex items-center space-x-2">
                        <Checkbox
                          id={`crop-${crop}`}
                          checked={activeCropFilters.includes(crop)}
                          onCheckedChange={() => toggleCropFilter(crop)}
                        />
                        <Label htmlFor={`crop-${crop}`}>{crop}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Área (hectares)
                    </h3>
                    <Slider
                      defaultValue={areaRange}
                      min={0}
                      max={5000}
                      step={100}
                      value={areaRange}
                      onValueChange={setAreaRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{areaRange[0]} ha</span>
                      <span>{areaRange[1]} ha</span>
                    </div>
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
                <DrawerClose asChild>
                  <Button className="bg-primaryGreen hover:bg-lightGreen">
                    Aplicar Filtros
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediumGray"
              size={16}
            />
            <Input
              placeholder="Buscar propriedade..."
              className="pl-10"
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
        </div>
      </div>

      <div
        className={`grid ${
          mapExpanded ? "" : "grid-cols-1 md:grid-cols-4"
        } gap-6`}
      >
        {/* Properties list - hidden when map is expanded */}
        <div
          className={`${
            mapExpanded ? "hidden" : "block"
          } space-y-6 md:col-span-1`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Propriedades</CardTitle>
              <CardDescription>
                {filteredClients.length}{" "}
                {filteredClients.length === 1 ? "propriedade" : "propriedades"}{" "}
                encontradas
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-20rem)] overflow-y-auto">
              <div className="space-y-2">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma propriedade encontrada com os filtros atuais.</p>
                    <Button
                      variant="link"
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedClient?.id === client.id
                          ? "border-primaryGreen bg-primaryGreen/5"
                          : "border-border hover:border-primaryGreen/50 hover:bg-muted"
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{client.name}</h3>
                        <Badge
                          className={
                            client.active
                              ? "bg-primaryGreen/20 text-lightGreen"
                              : "bg-mediumGray/20 text-darkGray"
                          }
                        >
                          {client.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-mediumGray mt-1">
                        <MapPin className="mr-1" size={14} />
                        {getFormattedLocation(client.address)}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm">{client.totalArea} ha</div>
                        {client.actualCrop && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            <Badge
                              variant="outline"
                              className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20 text-xs"
                            >
                              {client.actualCrop}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map container */}
        <div className={`${mapExpanded ? "col-span-4" : "md:col-span-3"}`}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Visualização do Mapa</CardTitle>
                <CardDescription>
                  {filteredClients.length}{" "}
                  {filteredClients.length === 1
                    ? "propriedade"
                    : "propriedades"}{" "}
                  exibidas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Layers className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {MAP_LAYERS.map((layer) => (
                      <DropdownMenuItem
                        key={layer.id}
                        onClick={() => setActiveMapLayer(layer.id)}
                        className={
                          activeMapLayer === layer.id ? "bg-muted" : ""
                        }
                      >
                        {layer.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMapExpanded(!mapExpanded)}
                >
                  {mapExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className={`${
                  mapExpanded ? "h-[calc(100vh-12rem)]" : "h-[500px]"
                }`}
              >
                <MapContainer
                  center={[-19.9167, -43.9345]} // Center on Brazil
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                >
                  {/* Map Layers */}
                  {activeMapLayer === "street" && (
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  )}
                  {activeMapLayer === "satellite" && (
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  )}
                  {activeMapLayer === "terrain" && (
                    <TileLayer
                      attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
                      url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    />
                  )}
                  {/* Property Markers */}
                  {filteredClients.map((client) => (
                    <Marker
                      key={client.id}
                      position={[
                        getClientCoordinates(client).lat,
                        getClientCoordinates(client).lng,
                      ]}
                      eventHandlers={{
                        click: () => handleClientSelect(client),
                      }}
                    >
                      <Popup>
                        <div className="p-1">
                          <h3 className="font-medium text-base">
                            {client.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getFormattedLocation(client.address)}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Área:</span>{" "}
                            {client.totalArea.toLocaleString()} ha
                          </p>
                          {client.actualCrop && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge
                                variant="outline"
                                className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20 text-xs"
                              >
                                {client.actualCrop}
                              </Badge>
                            </div>
                          )}
                          <Button
                            size="sm"
                            className="w-full mt-3 bg-primaryGreen hover:bg-lightGreen"
                            onClick={() => navigateToClientDetails(client.id)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {/* Farm boundaries for selected client */}
                  {selectedClient && (
                    <>
                      <Polygon
                        positions={getFarmBoundaries(selectedClient) as any}
                        pathOptions={{
                          color: "#4CAF50",
                          weight: 3,
                          fillOpacity: 0.1,
                        }}
                      />

                      {/* Farm areas */}
                      {getFarmAreas(selectedClient).map((area, index) => (
                        <Polygon
                          key={index}
                          positions={area.polygon as any}
                          pathOptions={{
                            color: area.color,
                            weight: 2,
                            fillColor: area.color,
                            fillOpacity: 0.3,
                          }}
                        >
                          <Popup>{area.name}</Popup>
                        </Polygon>
                      ))}
                    </>
                  )}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property details drawer */}
      <Drawer open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedClient?.name}</DrawerTitle>
            <DrawerDescription>
              {selectedClient?.address &&
                getFormattedLocation(selectedClient.address)}
            </DrawerDescription>
          </DrawerHeader>
          {selectedClient && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Documento
                  </h3>
                  <p>{selectedClient.document}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Área Total
                  </h3>
                  <p>{selectedClient.totalArea.toLocaleString()} ha</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Última Visita
                  </h3>
                  <p>{getLastVisitDate(selectedClient.visits)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Próxima Visita
                  </h3>
                  <p>{getNextVisitDate(selectedClient.visits)}</p>
                </div>
              </div>

              {selectedClient.actualCrop && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-mediumGray mb-1">
                    Cultura Atual
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant="outline"
                      className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20"
                    >
                      {selectedClient.actualCrop}
                    </Badge>
                  </div>
                </div>
              )}

              <Tabs defaultValue="areas" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="areas">Áreas de Cultivo</TabsTrigger>
                  <TabsTrigger value="activities">Atividades</TabsTrigger>
                </TabsList>
                <TabsContent value="areas" className="pt-4">
                  <div className="space-y-2">
                    {getFarmAreas(selectedClient).map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-sm mr-2"
                            style={{ backgroundColor: area.color }}
                          ></div>
                          <span>{area.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 500) + 100} ha
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="activities" className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                      <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                        22/04
                      </div>
                      <div>
                        <h4 className="font-medium">Visita Técnica</h4>
                        <p className="text-sm text-mediumGray">
                          Monitoramento de pragas e análise de solo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                      <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                        10/05
                      </div>
                      <div>
                        <h4 className="font-medium">Aplicação de Defensivos</h4>
                        <p className="text-sm text-mediumGray">
                          Controle preventivo na área sul
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DrawerFooter>
            <Button
              className="bg-primaryGreen hover:bg-lightGreen"
              onClick={() => {
                if (selectedClient) {
                  navigateToClientDetails(selectedClient.id);
                }
              }}
            >
              Ver Detalhes Completos
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
