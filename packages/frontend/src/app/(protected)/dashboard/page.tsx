"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Map,
  Calendar,
  FileText,
  BarChart2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GetClientsAPI from "../../../../api/engineer/GetClients";
import { Client } from "@/models/Client";
import { useAuth } from "@/contexts/auth-context";
import GetAllReportsAPI from "../../../../api/engineer/GetAllReports";
import { getStatus, Report } from "@/models/Report";
import { EventStatus } from "@/models/CalendarEvent";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const clientsPromise = GetClientsAPI();
      const reportsPromise = GetAllReportsAPI();

      const [clientsResponse, reportsResponse] = await Promise.all([
        clientsPromise,
        reportsPromise,
      ]);

      if (clientsResponse) {
        const sortedClientsByLastEvents = clientsResponse.sort((a, b) => {
          const completedEventsA =
            a.calendarEvents?.filter(
              (event) => event.status === EventStatus.COMPLETED
            ) || [];

          const completedEventsB =
            b.calendarEvents?.filter(
              (visit) => visit.status === EventStatus.COMPLETED
            ) || [];

          const sortedEventsA = completedEventsA.sort(
            (x, y) =>
              new Date(y.date || 0).getTime() - new Date(x.date || 0).getTime()
          );

          const sortedEventsB = completedEventsB.sort(
            (x, y) =>
              new Date(y.date || 0).getTime() - new Date(x.date || 0).getTime()
          );

          const lastEventA =
            sortedEventsA.length > 0
              ? new Date(sortedEventsA[0].date || 0).getTime()
              : 0;

          const lastEventB =
            sortedEventsB.length > 0
              ? new Date(sortedEventsB[0].date || 0).getTime()
              : 0;

          return lastEventB - lastEventA;
        });

        setClients(sortedClientsByLastEvents);
      }

      if (reportsResponse) {
        const reportsSorted = reportsResponse.sort((a, b) => {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });
        setReports(reportsSorted);
      }
    };

    fetchData();
  }, []);

  const areaMonitored = useMemo(() => {
    return clients.reduce((total, client) => {
      return total + (client.totalArea || 0);
    }, 0);
  }, [clients]);

  const newTotalArea = useMemo(() => {
    const result = clients
      .filter(
        (c) => new Date(c.createdAt!).getMonth() === new Date().getMonth()
      )
      .reduce((total, client) => {
        return total + (client.totalArea || 0);
      }, 0);

    return result > 0 ? result : 0;
  }, [clients]);

  const pendingEvents = useMemo(() => {
    let events = 0;

    for (const client of clients) {
      if (!client.calendarEvents) continue;

      for (const event of client.calendarEvents) {
        if (event.status === EventStatus.PENDING) {
          events++;
        }
      }
    }

    return events;
  }, [clients]);

  const nextEventDate = useMemo(() => {
    const events = [];

    for (const client of clients) {
      if (!client.calendarEvents) continue;

      for (const visit of client.calendarEvents) {
        if (visit.status === EventStatus.PENDING) {
          events.push(visit.date);
        }
      }
    }

    const sortedEvents = events.sort((a, b) => {
      return new Date(a || 0).getTime() - new Date(b || 0).getTime();
    });

    if (sortedEvents.length > 0) {
      return new Date(sortedEvents[0] || 0).toLocaleDateString();
    }

    return "Sem visitas pendentes";
  }, [clients]);

  const lastReportsCount = useMemo(() => {
    const lastReports = reports.filter(
      (report) => report.createdAt?.getMonth() === new Date().getMonth()
    );

    return lastReports.length;
  }, [reports]);

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Bem-vindo, {auth?.name}</h1>
        <p className="text-mediumGray">Painel de controle do agrônomo</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Clientes</CardDescription>
            <CardTitle className="text-xl md:text-2xl">
              {clients.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">
              +
              {
                clients.filter(
                  (c) =>
                    new Date(c.createdAt!).getMonth() === new Date().getMonth()
                ).length
              }{" "}
              novos este mês
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Área Monitorada</CardDescription>
            <CardTitle className="text-xl md:text-2xl">
              {areaMonitored} ha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">
              +{newTotalArea} ha desde o último mês
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Eventos Pendentes</CardDescription>
            <CardTitle className="text-xl md:text-2xl">
              {pendingEvents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">
              Próximo: {nextEventDate}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Relatórios</CardDescription>
            <CardTitle className="text-xl md:text-2xl">
              {reports.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">
              {lastReportsCount} novos este mês
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Clientes Recentes</CardTitle>
              <CardDescription>Últimas propriedades visitadas</CardDescription>
            </div>
            <Link href="/clients">
              <Button variant="ghost" className="gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-lightGray transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">{clients[0]?.name}</h4>
                    <p className="text-sm text-mediumGray">
                      {clients[0]?.address.city}, {clients[0]?.address.state}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-mediumGray">
                  Visitado:{" "}
                  {new Date(
                    clients[0]?.calendarEvents?.[0]?.date || 0
                  ).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-lightGray transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">{clients[1]?.name}</h4>
                    <p className="text-sm text-mediumGray">
                      {clients[1]?.address.city}, {clients[1]?.address.state}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-mediumGray">
                  Visitado:{" "}
                  {new Date(
                    clients[1]?.calendarEvents?.[0]?.date || 0
                  ).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-lightGray transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">{clients[2]?.name}</h4>
                    <p className="text-sm text-mediumGray">
                      {clients[2]?.address.city}, {clients[2]?.address.state}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-mediumGray">
                  Visitado:{" "}
                  {new Date(
                    clients[2]?.calendarEvents?.[0]?.date || 0
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios recentes</CardTitle>
            <CardDescription>Últimos relatórios gerados</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">{reports[0]?.title}</h4>
                    <p className="text-sm text-mediumGray">
                      {getStatus(reports[0]?.status)}
                    </p>
                    <p className="text-xs text-primaryGreen mt-1">
                      {new Date(
                        reports[0]?.createdAt || 0
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        reports[0]?.createdAt || 0
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">{reports[1]?.title}</h4>
                    <p className="text-sm text-mediumGray">
                      {getStatus(reports[1]?.status)}
                    </p>
                    <p className="text-xs text-primaryGreen mt-1">
                      {new Date(
                        reports[1]?.createdAt || 1
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        reports[1]?.createdAt || 1
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-4 text-mediumGray">
                Nenhum relatório gerado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Acesso Rápido</CardTitle>
              <CardDescription>Atalhos para funções principais</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Link href="/clients">
                <div className="flex flex-col items-center justify-center p-2 md:p-4 rounded-md border border-mediumGray/20 hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-primaryGreen mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">
                    Clientes
                  </span>
                </div>
              </Link>
              <Link href="/maps">
                <div className="flex flex-col items-center justify-center p-2 md:p-4 rounded-md border border-mediumGray/20 hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Map className="h-6 w-6 md:h-8 md:w-8 text-primaryGreen mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">Mapas</span>
                </div>
              </Link>
              <Link href="/calendar">
                <div className="flex flex-col items-center justify-center p-2 md:p-4 rounded-md border border-mediumGray/20 hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primaryGreen mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">Agenda</span>
                </div>
              </Link>
              <Link href="/reports">
                <div className="flex flex-col items-center justify-center p-2 md:p-4 rounded-md border border-mediumGray/20 hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-primaryGreen mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">
                    Relatórios
                  </span>
                </div>
              </Link>
              <Link href="/analytics">
                <div className="flex flex-col items-center justify-center p-2 md:p-4 rounded-md border border-mediumGray/20 hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <BarChart2 className="h-6 w-6 md:h-8 md:w-8 text-primaryGreen mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">
                    Análises
                  </span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Notificações importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-secondaryGreen/10 border border-secondaryGreen/20">
                <h4 className="font-medium text-lightGreen">Alerta de Clima</h4>
                <p className="text-sm mt-1">
                  Previsão de chuvas intensas para a região de Ribeirão Preto
                  nos próximos 3 dias.
                </p>
              </div>
              <div className="p-3 rounded-md bg-secondaryGreen/10 border border-secondaryGreen/20">
                <h4 className="font-medium text-lightGreen">
                  Prazo de Relatório
                </h4>
                <p className="text-sm mt-1">
                  O relatório mensal deve ser entregue até 25/04/2024.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
