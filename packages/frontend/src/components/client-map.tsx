"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Layers, Maximize2, Minimize2 } from "lucide-react";
import { Client } from "../models/Client";
import initLeaflet from "../lib/leaflet-wrapper";

interface ClientMapProps {
  client: Client;
}

// Função para gerar limites simulados da fazenda quando não temos coordenadas reais
const getFarmBoundaries = (center: { lat: number; lng: number }) => {
  const offset = 0.02;
  return [
    [center.lat - offset, center.lng - offset * 1.5],
    [center.lat - offset * 0.5, center.lng - offset * 0.8],
    [center.lat + offset * 0.8, center.lng - offset],
    [center.lat + offset, center.lng + offset * 0.5],
    [center.lat - offset * 0.2, center.lng + offset * 1.2],
    [center.lat - offset, center.lng - offset * 0.5],
  ];
};

// Função para gerar áreas simuladas da fazenda quando não temos dados reais
const getFarmAreas = (center: { lat: number; lng: number }) => {
  const offset = 0.02;
  return [
    {
      name: "Área Principal",
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
      name: "Área Secundária",
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

export default function ClientMap({ client }: ClientMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    setLeaflet(initLeaflet());
  }, []);

  if (!isClient) {
    return (
      <div className="h-[500px] bg-lightGray flex items-center justify-center">
        Carregando mapa...
      </div>
    );
  }

  const coordinates = {
    lat: client.address.latitude || -19.9191,
    lng: client.address.longitude || -43.9386,
  };

  const farmBoundaries = getFarmBoundaries(coordinates);
  const farmAreas = getFarmAreas(coordinates);

  const cultureName = client.actualCrop
    ? client.actualCrop === "SOJA"
      ? "Soja"
      : client.actualCrop === "MILHO"
      ? "Milho"
      : client.actualCrop === "TRIGO"
      ? "Trigo"
      : client.actualCrop
    : "Não definida";

  const { MapContainer, TileLayer, Marker, Popup, Polygon } = leaflet || {};
  const renderMap =
    leaflet && MapContainer && TileLayer && Marker && Popup && Polygon;

  return (
    <div
      className={`grid ${
        mapExpanded ? "" : "grid-cols-1 md:grid-cols-3"
      } gap-6`}
    >
      <div className={`${mapExpanded ? "hidden" : "block"} space-y-6`}>
        <Card>
          <CardHeader>
            <CardTitle>Camadas do Mapa</CardTitle>
            <CardDescription>
              Selecione as camadas para visualização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-primaryGreen"></div>
                  <span>Limites da Propriedade</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-primaryGreen"
                />
              </div>
              {farmAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: area.color }}
                    ></div>
                    <span>{area.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-primaryGreen"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-mediumGray"></div>
                  <span>Imagens de Satélite</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-primaryGreen"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-mediumGray"></div>
                  <span>Topografia</span>
                </div>
                <input type="checkbox" className="accent-primaryGreen" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Área</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-mediumGray">Nome:</span>
                <span className="font-medium">{client.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-mediumGray">Área Total:</span>
                <span className="font-medium">
                  {client.totalArea.toLocaleString()} ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-mediumGray">Área Plantada:</span>
                <span className="font-medium">
                  {client.totalAreaPlanted.toLocaleString()} ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-mediumGray">Cultura Atual:</span>
                <span className="font-medium">{cultureName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-mediumGray">Endereço:</span>
                <span className="font-medium">
                  {client.address.city}, {client.address.state}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Área</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="soil">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="soil">Solo</TabsTrigger>
                <TabsTrigger value="ndvi">NDVI</TabsTrigger>
                <TabsTrigger value="moisture">Umidade</TabsTrigger>
              </TabsList>
              <TabsContent value="soil" className="pt-4">
                <p className="text-sm">
                  Análise de solo mostra níveis adequados de nutrientes na maior
                  parte da propriedade.
                </p>
              </TabsContent>
              <TabsContent value="ndvi" className="pt-4">
                <p className="text-sm">
                  Índice de vegetação indica bom desenvolvimento das culturas,
                  com algumas áreas de atenção.
                </p>
              </TabsContent>
              <TabsContent value="moisture" className="pt-4">
                <p className="text-sm">
                  Níveis de umidade do solo estão dentro dos parâmetros ideais
                  para as culturas atuais.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className={`${mapExpanded ? "col-span-3" : "md:col-span-2"}`}>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Mapa da Propriedade</CardTitle>
              <CardDescription>Visualização geoespacial</CardDescription>
            </div>
            <div className="flex gap-2">
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
              <Button variant="outline" size="icon">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className={`${
                mapExpanded ? "h-[70vh]" : "h-[400px] md:h-[500px]"
              }`}
            >
              {renderMap ? (
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                      <strong>{client.name}</strong>
                      <br />
                      {client.address.city}, {client.address.state}
                    </Popup>
                  </Marker>

                  <Polygon
                    positions={farmBoundaries as any}
                    pathOptions={{
                      color: "#4CAF50",
                      weight: 3,
                      fillOpacity: 0.1,
                    }}
                  />

                  {farmAreas.map((area, index) => (
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
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryGreen"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
