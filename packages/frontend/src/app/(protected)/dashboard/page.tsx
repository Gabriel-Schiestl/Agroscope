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
import { VisitStatus } from "@/models/Visit";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const response = await GetClientsAPI();
      if (response) {
        const sortedClientsByLastVisit = response.sort((a, b) => {
          const completedVisitsA =
            a.visits?.filter(
              (visit) => visit.status === VisitStatus.COMPLETED
            ) || [];

          const completedVisitsB =
            b.visits?.filter(
              (visit) => visit.status === VisitStatus.COMPLETED
            ) || [];

          const sortedVisitsA = completedVisitsA.sort(
            (x, y) =>
              new Date(y.scheduledDate || 0).getTime() -
              new Date(x.scheduledDate || 0).getTime()
          );

          const sortedVisitsB = completedVisitsB.sort(
            (x, y) =>
              new Date(y.scheduledDate || 0).getTime() -
              new Date(x.scheduledDate || 0).getTime()
          );

          const lastVisitA =
            sortedVisitsA.length > 0
              ? new Date(sortedVisitsA[0].scheduledDate || 0).getTime()
              : 0;

          const lastVisitB =
            sortedVisitsB.length > 0
              ? new Date(sortedVisitsB[0].scheduledDate || 0).getTime()
              : 0;

          return lastVisitB - lastVisitA;
        });

        setClients(sortedClientsByLastVisit);
      }
    };

    fetchData();
  }, []);

  const areaMonitored = useMemo(() => {
    return clients.reduce((total, client) => {
      return total + (client.totalArea || 0);
    }, 0);
  }, [clients]);

  const getNewTotalArea = () => {
    const result = clients
      .filter((c) => c.createdAt?.getMonth() === new Date().getMonth())
      .reduce((total, client) => {
        return total + client.totalArea;
      }, 0);

    return result > 0 ? result : 0;
  };

  const getPendingVisits = () => {
    let visits = 0;

    for (const client of clients) {
      if (!client.visits) continue;

      for (const visit of client.visits) {
        if (visit.status === VisitStatus.PENDING) {
          visits++;
        }
      }
    }

    return visits;
  };

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
                  (c) => c.createdAt?.getMonth() === new Date().getMonth()
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
              +{getNewTotalArea()} ha desde o último mês
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitas Pendentes</CardDescription>
            <CardTitle className="text-xl md:text-2xl">
              {getPendingVisits()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">Próxima: 22/04/2024</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Relatórios</CardDescription>
            <CardTitle className="text-xl md:text-2xl">28</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">3 novos esta semana</div>
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
                    clients[0]?.visits?.[0].scheduledDate || 0
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
                    clients[1]?.visits?.[0].scheduledDate || 0
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
                    clients[2]?.visits?.[0].scheduledDate || 0
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Atividades</CardTitle>
            <CardDescription>Agenda da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="font-medium">Visita Técnica</h4>
                  <p className="text-sm text-mediumGray">Fazenda São João</p>
                  <p className="text-xs text-primaryGreen mt-1">
                    22/04/2024 - 09:00
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-medium">Relatório Mensal</h4>
                  <p className="text-sm text-mediumGray">
                    Entrega de relatório
                  </p>
                  <p className="text-xs text-primaryGreen mt-1">
                    25/04/2024 - 18:00
                  </p>
                </div>
              </div>
            </div>
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
