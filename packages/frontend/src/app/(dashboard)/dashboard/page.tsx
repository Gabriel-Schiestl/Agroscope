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

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Bem-vindo, Dr. Carlos</h1>
        <p className="text-mediumGray">Painel de controle do agrônomo</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Clientes</CardDescription>
            <CardTitle className="text-xl md:text-2xl">12</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">+2 novos este mês</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Área Monitorada</CardDescription>
            <CardTitle className="text-xl md:text-2xl">8.450 ha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">
              +450 ha desde o último mês
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitas Pendentes</CardDescription>
            <CardTitle className="text-xl md:text-2xl">5</CardTitle>
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
                    <h4 className="font-medium">Fazenda São João</h4>
                    <p className="text-sm text-mediumGray">
                      Ribeirão Preto, SP
                    </p>
                  </div>
                </div>
                <div className="text-sm text-mediumGray">
                  Visitado: 15/03/2024
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-lightGray transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Sítio Esperança</h4>
                    <p className="text-sm text-mediumGray">Uberaba, MG</p>
                  </div>
                </div>
                <div className="text-sm text-mediumGray">
                  Visitado: 02/04/2024
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-lightGray transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Fazenda Boa Vista</h4>
                    <p className="text-sm text-mediumGray">Rondonópolis, MT</p>
                  </div>
                </div>
                <div className="text-sm text-mediumGray">
                  Visitado: 28/03/2024
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
