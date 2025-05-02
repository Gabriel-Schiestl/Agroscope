"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Client } from "../models/Client";
import { Report } from "../models/Report";

interface ClientOverviewProps {
  client: Client;
}

export default function ClientOverview({ client }: ClientOverviewProps) {
  // Função para formatar o endereço completo
  const getFullAddress = () => {
    const address = client.address;
    return `${address.street}, ${address.number}${
      address.complement ? `, ${address.complement}` : ""
    }, ${address.neighborhood}, ${address.city} - ${address.state}, ${
      address.country
    }, ${address.zipCode}`;
  };

  // Função para obter as coordenadas se disponíveis
  const getCoordinates = () => {
    if (client.address.latitude && client.address.longitude) {
      return `${client.address.latitude.toFixed(
        4
      )}, ${client.address.longitude.toFixed(4)}`;
    }
    return "Não definidas";
  };

  // Função segura para acessar propriedades do report
  const getReportTitle = (report: any): string => {
    return report && typeof report === "object" && "title" in report
      ? String(report.title)
      : "Visita de rotina";
  };

  const getReportContent = (report: any): string => {
    return report && typeof report === "object" && "content" in report
      ? String(report.content)
      : "Sem conteúdo disponível";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Propriedade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Documento
                </h3>
                <p>
                  {client.document} ({client.person === "PF" ? "CPF" : "CNPJ"})
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">Status</h3>
                <Badge
                  className={
                    client.active
                      ? "bg-primaryGreen/20 text-lightGreen mt-1"
                      : "bg-mediumGray/20 text-darkGray mt-1"
                  }
                >
                  {client.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Cultura Atual
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.actualCrop ? (
                    <Badge
                      variant="outline"
                      className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20"
                    >
                      {client.actualCrop}
                    </Badge>
                  ) : (
                    <span>Não definida</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Coordenadas
                </h3>
                <p>{getCoordinates()}</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="text-sm font-medium text-mediumGray">
                  Endereço Completo
                </h3>
                <p>{getFullAddress()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Área</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Área Total
                </h3>
                <p>{client.totalArea.toLocaleString()} hectares</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Área Plantada
                </h3>
                <p>{client.totalAreaPlanted.toLocaleString()} hectares</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Porcentagem Utilizada
                </h3>
                <p>
                  {client.totalArea > 0
                    ? `${(
                        (client.totalAreaPlanted / client.totalArea) *
                        100
                      ).toFixed(2)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análises de Solo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList className="mb-4">
                <TabsTrigger value="recent">Mais Recentes</TabsTrigger>
                <TabsTrigger value="historical">Histórico</TabsTrigger>
              </TabsList>
              <TabsContent value="recent">
                <div className="rounded-md border p-4">
                  <p className="text-center py-4 text-mediumGray">
                    Nenhuma análise de solo recente disponível.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="historical">
                <div className="rounded-md border p-4">
                  <p className="text-center py-4 text-mediumGray">
                    Nenhum histórico de análise disponível.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            {/* {client.visits && client.visits.length > 0 ? (
              <div className="space-y-4">
                {client.visits.slice(-3).map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                      {visit.scheduledDate
                        ? new Date(visit.scheduledDate).toLocaleDateString(
                            "pt-BR",
                            { day: "2-digit", month: "2-digit" }
                          )
                        : "--/--"}
                    </div>
                    <div>
                      <h4 className="font-medium">Visita Técnica</h4>
                      <p className="text-sm text-mediumGray">
                        {visit.reports &&
                        visit.reports.length > 0 &&
                        visit.reports[0]
                          ? getReportTitle(visit.reports[0])
                          : "Visita de rotina"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : ( */}
            <p className="text-center py-4 text-mediumGray">
              Nenhuma visita registrada para este cliente.
            </p>
            {/* )} */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            {/* {client.visits &&
            client.visits.some(
              (visit) => visit.reports && visit.reports.length > 0
            ) ? (
              <div className="space-y-3">
                {client.visits
                  .filter((visit) => visit.reports && visit.reports.length > 0)
                  .slice(-2)
                  .map((visit, index) => {
                    const report =
                      visit.reports && visit.reports.length > 0
                        ? visit.reports[0]
                        : null;
                    if (!report) return null;

                    const title = getReportTitle(report);
                    const content = getReportContent(report);

                    return (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-secondaryGreen/10 border border-secondaryGreen/20"
                      >
                        <h4 className="font-medium text-lightGreen">
                          {title ||
                            `Relatório de ${
                              visit.scheduledDate
                                ? new Date(
                                    visit.scheduledDate
                                  ).toLocaleDateString("pt-BR")
                                : "visita"
                            }`}
                        </h4>
                        <p className="text-sm mt-1">{content}</p>
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </div>
            ) : ( */}
            <p className="text-center py-4 text-mediumGray">
              Nenhuma recomendação disponível.
            </p>
            {/* )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
