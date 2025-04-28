"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Client, Crop } from "@/models/Client";
import GetClientsAPI from "@/../../api/engineer/GetClients";

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      try {
        const data = await GetClientsAPI();
        if (data) {
          setClients(data);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.address?.city &&
        client.address.city
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (client.address?.state &&
        client.address.state.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const getLocationString = (client: Client) => {
    if (!client.address) return "Localização não definida";
    return `${client.address.city || ""}, ${client.address.state || ""}`;
  };

  const getCropBadges = (client: Client) => {
    const crops = [];
    if (client.actualCrop) {
      crops.push(client.actualCrop);
    }
    return crops;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p>Carregando clientes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Total de {filteredClients.length} clientes
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediumGray"
              size={16}
            />
            <Input
              placeholder="Buscar cliente..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Propriedade</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Localização
                    <MapPin className="ml-1" size={14} />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Área Total (ha)
                    <ArrowUpDown className="ml-1" size={14} />
                  </div>
                </TableHead>
                <TableHead>Área Plantada (ha)</TableHead>
                <TableHead>Cultura Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-lightGray/50"
                  onClick={() => handleClientClick(client.id)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.document}</TableCell>
                  <TableCell>{getLocationString(client)}</TableCell>
                  <TableCell>{client.totalArea.toLocaleString()}</TableCell>
                  <TableCell>
                    {client.totalAreaPlanted.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.actualCrop && (
                        <Badge
                          variant="outline"
                          className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20"
                        >
                          {client.actualCrop}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        client.active
                          ? "bg-primaryGreen/20 text-lightGreen"
                          : "bg-mediumGray/20 text-darkGray"
                      }
                    >
                      {client.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clients/${client.id}`);
                          }}
                        >
                          Gerenciar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clients/${client.id}/map`);
                          }}
                        >
                          Ver no mapa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-lightGray/50"
              onClick={() => handleClientClick(client.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{client.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/clients/${client.id}`);
                      }}
                    >
                      Gerenciar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/clients/${client.id}/map`);
                      }}
                    >
                      Ver no mapa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-sm mb-1">Doc: {client.document}</div>
              <div className="flex items-center text-sm text-mediumGray mb-2">
                <MapPin className="mr-1" size={14} />
                {getLocationString(client)}
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-mediumGray">Área Total:</span>
                <span className="text-sm font-medium">
                  {client.totalArea.toLocaleString()} ha
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-mediumGray">Área Plantada:</span>
                <span className="text-sm font-medium">
                  {client.totalAreaPlanted.toLocaleString()} ha
                </span>
              </div>
              {client.actualCrop && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge
                    variant="outline"
                    className="bg-secondaryGreen/10 text-lightGreen border-secondaryGreen/20"
                  >
                    {client.actualCrop}
                  </Badge>
                </div>
              )}
              <div className="flex justify-end">
                <Badge
                  className={
                    client.active
                      ? "bg-primaryGreen/20 text-lightGreen"
                      : "bg-mediumGray/20 text-darkGray"
                  }
                >
                  {client.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
