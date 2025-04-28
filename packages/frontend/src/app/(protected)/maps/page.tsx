"use client";

import { useState, useEffect } from "react";
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
import MapIconFixComponent from "@/components/ui/map-icons";

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

// Mock polygon data for farm boundaries
const getFarmBoundaries = (center: { lat: number; lng: number }) => {
  // Create a simple polygon around the center point
  const offset = 0.02; // Roughly 2km
  return [
    [center.lat - offset, center.lng - offset * 1.5],
    [center.lat - offset * 0.5, center.lng - offset * 0.8],
    [center.lat + offset * 0.8, center.lng - offset],
    [center.lat + offset, center.lng + offset * 0.5],
    [center.lat - offset * 0.2, center.lng + offset * 1.2],
    [center.lat - offset, center.lng - offset * 0.5],
  ];
};

// Mock data for different areas within the farm
const getFarmAreas = (center: { lat: number; lng: number }) => {
  const offset = 0.02;
  return [
    {
      name: "Área de Soja",
      color: "#4CAF50",
      polygon: [
        [center.lat - offset * 0.8, center.lng - offset],
        [center.lat - offset * 0.2, center.lng - offset * 0.6],
        [center.lat + offset * 0.4, center.lng - offset * 0.8],
        [center.lat + offset * 0.6, center.lng - offset * 0.2],
        [center.lat + offset * 0.2, center.lng + offset * 0.4],
        [center.lat - offset * 0.4, center.lng + offset * 0.2],
      ],
    },
    {
      name: "Área de Milho",
      color: "#66BB6A",
      polygon: [
        [center.lat - offset * 0.5, center.lng + offset * 0.2],
        [center.lat - offset * 0.8, center.lng + offset * 0.6],
        [center.lat - offset * 0.2, center.lng + offset * 0.8],
        [center.lat + offset * 0.2, center.lng + offset * 0.4],
      ],
    },
    {
      name: "Reserva Legal",
      color: "#2E7D32",
      polygon: [
        [center.lat + offset * 0.4, center.lng - offset * 0.2],
        [center.lat + offset * 0.8, center.lng - offset * 0.4],
        [center.lat + offset * 0.6, center.lng + offset * 0.2],
        [center.lat + offset * 0.2, center.lng + offset * 0.4],
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
const CROP_TYPES = [
  "Soja",
  "Milho",
  "Café",
  "Laranja",
  "Algodão",
  "Cana-de-açúcar",
  "Sorgo",
];

export default function MapsPage() {
  const [isClient, setIsClient] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMapLayer, setActiveMapLayer] = useState("street");
  const [selectedClient, setSelectedClient] = useState<
    (typeof CLIENTS)[0] | null
  >(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [activeCropFilters, setActiveCropFilters] = useState<string[]>([]);
  const [areaRange, setAreaRange] = useState([0, 5000]);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter clients based on search query and crop filters
  const filteredClients = CLIENTS.filter((client) => {
    const matchesSearch =
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrops =
      activeCropFilters.length === 0 ||
      client.crops.some((crop) => activeCropFilters.includes(crop));

    const matchesArea =
      client.area >= areaRange[0] && client.area <= areaRange[1];

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

  // Handle client selection
  const handleClientSelect = (client: (typeof CLIENTS)[0]) => {
    setSelectedClient(client);
    setShowClientDetails(true);
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
                            client.status === "active"
                              ? "bg-primaryGreen/20 text-lightGreen"
                              : "bg-mediumGray/20 text-darkGray"
                          }
                        >
                          {client.status === "active" ? "Ativo" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-mediumGray mt-1">
                        <MapPin className="mr-1" size={14} />
                        {client.location}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm">{client.area} ha</div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {client.crops.slice(0, 2).map((crop) => (
                            <Badge
                              key={crop}
                              variant="outline"
                              className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20 text-xs"
                            >
                              {crop}
                            </Badge>
                          ))}
                          {client.crops.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{client.crops.length - 2}
                            </Badge>
                          )}
                        </div>
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
                  {/* Fix for Leaflet marker icons */}
                  <MapIconFixComponent />

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
                        client.coordinates.lat,
                        client.coordinates.lng,
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
                            {client.location}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Área:</span>{" "}
                            {client.area} ha
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {client.crops.map((crop) => (
                              <Badge
                                key={crop}
                                variant="outline"
                                className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20 text-xs"
                              >
                                {crop}
                              </Badge>
                            ))}
                          </div>
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
                        positions={
                          getFarmBoundaries(selectedClient.coordinates) as any
                        }
                        pathOptions={{
                          color: "#4CAF50",
                          weight: 3,
                          fillOpacity: 0.1,
                        }}
                      />

                      {/* Farm areas */}
                      {getFarmAreas(selectedClient.coordinates).map(
                        (area, index) => (
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
                        )
                      )}
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
            <DrawerDescription>{selectedClient?.location}</DrawerDescription>
          </DrawerHeader>
          {selectedClient && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Proprietário
                  </h3>
                  <p>{selectedClient.owner}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Área Total
                  </h3>
                  <p>{selectedClient.area.toLocaleString()} ha</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Última Visita
                  </h3>
                  <p>{selectedClient.lastVisit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-mediumGray">
                    Próxima Visita
                  </h3>
                  <p>{selectedClient.nextVisit}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-mediumGray mb-1">
                  Culturas
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedClient.crops.map((crop) => (
                    <Badge
                      key={crop}
                      variant="outline"
                      className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20"
                    >
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-mediumGray mb-1">
                  Tipo de Solo
                </h3>
                <p>{selectedClient.soilType}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-mediumGray mb-1">
                  Notas
                </h3>
                <p className="text-sm">{selectedClient.notes}</p>
              </div>

              <Tabs defaultValue="areas" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="areas">Áreas de Cultivo</TabsTrigger>
                  <TabsTrigger value="activities">Atividades</TabsTrigger>
                </TabsList>
                <TabsContent value="areas" className="pt-4">
                  <div className="space-y-2">
                    {getFarmAreas(selectedClient.coordinates).map(
                      (area, index) => (
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
                      )
                    )}
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
