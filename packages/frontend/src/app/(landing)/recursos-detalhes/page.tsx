import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RecursosDetalhesPage() {
  return (
    <div className="max-w-[1400px] mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Recursos do AgroScope</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Conheça as principais funcionalidades da nossa plataforma de gestão
        agronômica.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico de Plantas com IA</CardTitle>
            <CardDescription>
              Identificação rápida e precisa de doenças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Nossa tecnologia de inteligência artificial analisa imagens de
              plantas para identificar doenças, pragas e deficiências
              nutricionais com alta precisão.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Propriedades</CardTitle>
            <CardDescription>
              Controle completo das suas áreas agrícolas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Gerencie múltiplas propriedades, registre informações detalhadas
              sobre cada área e acompanhe o histórico de cultivo e tratamentos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mapeamento Geoespacial</CardTitle>
            <CardDescription>
              Visualização detalhada das suas áreas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Utilize mapas interativos para visualizar suas propriedades,
              definir áreas de cultivo e identificar regiões com problemas
              específicos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios e Análises</CardTitle>
            <CardDescription>
              Dados detalhados para tomada de decisão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Acesse relatórios detalhados sobre a saúde das suas plantas,
              histórico de tratamentos e previsões para otimizar sua produção.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
