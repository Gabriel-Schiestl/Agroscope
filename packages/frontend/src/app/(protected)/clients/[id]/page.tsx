"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  FileText,
  Map,
  BarChart2,
  Users,
} from "lucide-react";
import ClientOverview from "../../../../components/client-overview";
import ClientMap from "../../../../components/client-map";
import { Client, Crop } from "../../../../models/Client";
import { Report, ReportStatus, getStatus } from "../../../../models/Report";
import GetClientAPI from "../../../../../api/engineer/GetClient";
import { EventStatus } from "../../../../models/CalendarEvent";

export default function ClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClient() {
      setIsLoading(true);
      try {
        const data = await GetClientAPI(params.id);
        if (data) {
          setClient(data);
        } else {
          // Se não encontrar o cliente, redireciona para a página 404
          notFound();
        }
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }

    fetchClient();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Carregando dados do cliente...</p>
      </div>
    );
  }

  if (!client) {
    notFound();
  }

  const lastEvent =
    client.calendarEvents && client.calendarEvents.length > 0
      ? client.calendarEvents
          .filter((event) => event.date)
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          })[0]
      : null;

  const lastEventDate = lastEvent?.date
    ? new Date(lastEvent.date).toLocaleDateString("pt-BR")
    : "Sem eventos";

  const nextEventScheduled =
    client.calendarEvents && client.calendarEvents.length > 0
      ? client.calendarEvents.find(
          (event) =>
            event.date &&
            new Date(event.date) > new Date() &&
            event.status !== EventStatus.CANCELLED &&
            event.status !== EventStatus.COMPLETED
        )
      : null;

  const nextEvent =
    nextEventScheduled && nextEventScheduled.date
      ? new Date(nextEventScheduled.date).toLocaleDateString("pt-BR")
      : "Não agendada";

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
              {client.address.city}, {client.address.state}
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
            <CardDescription>Documento</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.document}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Área Total</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.totalArea.toLocaleString()} ha
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Área Plantada</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.totalAreaPlanted.toLocaleString()} ha
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.active ? "Ativo" : "Inativo"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Último Evento</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {lastEventDate}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximo Evento</CardDescription>
            <CardTitle className="text-base md:text-lg">{nextEvent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tipo de Pessoa</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.person === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cultura Atual</CardDescription>
            <CardTitle className="text-base md:text-lg">
              {client.actualCrop
                ? client.actualCrop === Crop.SOYBEAN
                  ? "Soja"
                  : client.actualCrop === Crop.CORN
                  ? "Milho"
                  : client.actualCrop === Crop.WHEAT
                  ? "Trigo"
                  : client.actualCrop
                : "Não definida"}
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
              {client.reports && client.reports.length > 0 ? (
                <div className="space-y-4">
                  {client.reports.map((report) => (
                    <div
                      key={report.id || Math.random().toString()}
                      className="border rounded-md p-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">
                          {report.title || "Relatório sem título"}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            report.status === ReportStatus.SENT
                              ? "bg-green-100 text-green-800"
                              : report.status === ReportStatus.DRAFT
                              ? "bg-gray-200 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status
                            ? getStatus(report.status as ReportStatus)
                            : "Status desconhecido"}
                        </span>
                      </div>
                      <p className="text-sm text-mediumGray mt-1">
                        {report.content || "Sem conteúdo"}
                      </p>
                      {report.createdAt && (
                        <p className="text-xs text-mediumGray mt-1">
                          Data:{" "}
                          {new Date(report.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      )}
                      {report.attachments && report.attachments.length > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          {report.attachments.length} anexo(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-mediumGray">
                  Nenhum relatório disponível para esta propriedade.
                </p>
              )}
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
