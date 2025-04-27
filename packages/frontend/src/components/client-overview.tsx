import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClientProps {
  client: {
    id: string;
    name: string;
    owner: string;
    location: string;
    coordinates: { lat: number; lng: number };
    area: number;
    crops: string[];
    status: string;
    lastVisit: string;
    nextVisit: string;
    soilType: string;
    notes: string;
  };
}

export default function ClientOverview({ client }: ClientProps) {
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
                  Tipo de Solo
                </h3>
                <p>{client.soilType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">Status</h3>
                <Badge
                  className={
                    client.status === "active"
                      ? "bg-primaryGreen/20 text-lightGreen mt-1"
                      : "bg-mediumGray/20 text-darkGray mt-1"
                  }
                >
                  {client.status === "active" ? "Ativo" : "Pendente"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Culturas
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.crops.map((crop) => (
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
              <div>
                <h3 className="text-sm font-medium text-mediumGray">
                  Coordenadas
                </h3>
                <p>
                  {client.coordinates.lat.toFixed(4)},{" "}
                  {client.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{client.notes}</p>
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
            <CardTitle>Próximas Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
              <div className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20">
                <div className="w-10 h-10 rounded-full bg-primaryGreen/20 flex items-center justify-center text-primaryGreen">
                  15/05
                </div>
                <div>
                  <h4 className="font-medium">Coleta de Amostras</h4>
                  <p className="text-sm text-mediumGray">
                    Análise foliar para culturas de soja
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-secondaryGreen/10 border border-secondaryGreen/20">
                <h4 className="font-medium text-lightGreen">
                  Correção de Solo
                </h4>
                <p className="text-sm mt-1">
                  Aplicação de calcário dolomítico na área norte da propriedade.
                </p>
              </div>
              <div className="p-3 rounded-md bg-secondaryGreen/10 border border-secondaryGreen/20">
                <h4 className="font-medium text-lightGreen">
                  Manejo de Irrigação
                </h4>
                <p className="text-sm mt-1">
                  Ajuste no sistema de irrigação para otimizar o uso de água.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
