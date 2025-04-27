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
  Leaf,
  Check,
} from "lucide-react";

export default function LandingDashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto py-12 px-4 pb-16 md:pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard AgroScope</h1>
        <p className="text-lg text-muted-foreground">
          Visualize dados e estatísticas sobre o uso da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Análises</CardDescription>
            <CardTitle className="text-2xl">1,248</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">+12% este mês</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Usuários Ativos</CardDescription>
            <CardTitle className="text-2xl">328</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">
              +8% desde o último mês
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Doenças Identificadas</CardDescription>
            <CardTitle className="text-2xl">52</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">3 novas este mês</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Precisão Média</CardDescription>
            <CardTitle className="text-2xl">94.7%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primaryGreen">+1.2% de melhoria</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Análises Recentes</CardTitle>
              <CardDescription>
                Últimas plantas analisadas pela plataforma
              </CardDescription>
            </div>
            <Button variant="ghost" className="gap-1">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Soja - Ferrugem Asiática</h4>
                    <p className="text-sm text-muted-foreground">
                      Fazenda São João, Ribeirão Preto
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Hoje, 14:32</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Café - Bicho Mineiro</h4>
                    <p className="text-sm text-muted-foreground">
                      Sítio Esperança, Uberaba
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Ontem, 09:15
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Milho - Lagarta do Cartucho</h4>
                    <p className="text-sm text-muted-foreground">
                      Fazenda Boa Vista, Rondonópolis
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  2 dias atrás
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Culturas</CardTitle>
            <CardDescription>Principais culturas analisadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Soja</span>
                  <span className="text-sm text-muted-foreground">42%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primaryGreen h-2 rounded-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Milho</span>
                  <span className="text-sm text-muted-foreground">28%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primaryGreen h-2 rounded-full"
                    style={{ width: "28%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Café</span>
                  <span className="text-sm text-muted-foreground">15%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primaryGreen h-2 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Algodão</span>
                  <span className="text-sm text-muted-foreground">8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primaryGreen h-2 rounded-full"
                    style={{ width: "8%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Outros</span>
                  <span className="text-sm text-muted-foreground">7%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primaryGreen h-2 rounded-full"
                    style={{ width: "7%" }}
                  ></div>
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
            <div className="grid grid-cols-3 gap-4">
              <Link href="/login">
                <div className="flex flex-col items-center justify-center p-4 rounded-md border border-border hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Leaf className="h-8 w-8 text-primaryGreen mb-2" />
                  <span className="text-sm font-medium">Nova Análise</span>
                </div>
              </Link>
              <Link href="/login">
                <div className="flex flex-col items-center justify-center p-4 rounded-md border border-border hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Map className="h-8 w-8 text-primaryGreen mb-2" />
                  <span className="text-sm font-medium">Mapas</span>
                </div>
              </Link>
              <Link href="/login">
                <div className="flex flex-col items-center justify-center p-4 rounded-md border border-border hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Calendar className="h-8 w-8 text-primaryGreen mb-2" />
                  <span className="text-sm font-medium">Agenda</span>
                </div>
              </Link>
              <Link href="/login">
                <div className="flex flex-col items-center justify-center p-4 rounded-md border border-border hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <FileText className="h-8 w-8 text-primaryGreen mb-2" />
                  <span className="text-sm font-medium">Relatórios</span>
                </div>
              </Link>
              <Link href="/login">
                <div className="flex flex-col items-center justify-center p-4 rounded-md border border-border hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <BarChart2 className="h-8 w-8 text-primaryGreen mb-2" />
                  <span className="text-sm font-medium">Análises</span>
                </div>
              </Link>
              <Link href="/login">
                <div className="flex flex-col items-center justify-center p-4 rounded-md border border-border hover:border-primaryGreen hover:bg-primaryGreen/5 transition-colors">
                  <Users className="h-8 w-8 text-primaryGreen mb-2" />
                  <span className="text-sm font-medium">Equipe</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas e Recomendações</CardTitle>
            <CardDescription>
              Informações úteis para o manejo de culturas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-primaryGreen/10 border border-primaryGreen/20">
                <h4 className="font-medium text-primaryGreen flex items-center">
                  <Check size={16} className="mr-1" /> Monitoramento de Pragas
                </h4>
                <p className="text-sm mt-1">
                  Realize inspeções regulares nas plantações para identificar
                  precocemente sinais de pragas e doenças.
                </p>
              </div>
              <div className="p-3 rounded-md bg-primaryGreen/10 border border-primaryGreen/20">
                <h4 className="font-medium text-primaryGreen flex items-center">
                  <Check size={16} className="mr-1" /> Rotação de Culturas
                </h4>
                <p className="text-sm mt-1">
                  Alterne diferentes culturas na mesma área para reduzir a
                  incidência de pragas e melhorar a saúde do solo.
                </p>
              </div>
              <div className="p-3 rounded-md bg-primaryGreen/10 border border-primaryGreen/20">
                <h4 className="font-medium text-primaryGreen flex items-center">
                  <Check size={16} className="mr-1" /> Manejo Integrado
                </h4>
                <p className="text-sm mt-1">
                  Combine diferentes métodos de controle para um manejo mais
                  eficiente e sustentável das culturas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Para acessar todas as funcionalidades e recursos do AgroScope, crie
          uma conta ou faça login.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button className="bg-primaryGreen hover:bg-lightGreen">
              Criar Conta Grátis
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Entrar na Plataforma</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
