import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  FileText,
  Map,
  BarChart2,
  Users,
} from "lucide-react";
import ClientOverview from "@/components/client-overview";
import ClientMap from "@/components/client-map";

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

export default function ClientPage({ params }: { params: { id: string } }) {
  const client = CLIENTS.find((c) => c.id === params.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl">{client.name}</h1>
            <div className="flex items-center text-mediumGray">
              <MapPin className="mr-1" size={16} />
              {client.location}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="md:size-md">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Agendar Visita</span>
            <span className="md:hidden">Agendar</span>
          </Button>
          <Button className="bg-primaryGreen hover:bg-lightGreen" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Novo Relatório</span>
            <span className="md:hidden">Relatório</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Proprietário</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.owner}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Área Total</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.area.toLocaleString()} ha
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Última Visita</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.lastVisit}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próxima Visita</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.nextVisit}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 size={16} />
            <span className="hidden md:inline">Visão Geral</span>
            <span className="md:hidden">Visão</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map size={16} />
            <span>Mapa</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText size={16} />
            <span className="hidden md:inline">Relatórios</span>
            <span className="md:hidden">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users size={16} />
            <span>Equipe</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientOverview client={client} />
        </TabsContent>

        <TabsContent value="map">
          <ClientMap client={client} />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Visitas</CardTitle>
              <CardDescription>
                Histórico de relatórios técnicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-mediumGray">
                Nenhum relatório disponível para esta propriedade.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Equipe de Campo</CardTitle>
              <CardDescription>
                Membros da equipe designados para esta propriedade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-mediumGray">
                Nenhum membro da equipe designado para esta propriedade.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
