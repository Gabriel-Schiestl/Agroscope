"use client";

import { useState } from "react";
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

const CLIENTS = [
  {
    id: "1",
    name: "Fazenda São João",
    owner: "João Silva",
    location: "Ribeirão Preto, SP",
    area: 1250,
    crops: ["Soja", "Milho"],
    status: "active",
  },
  {
    id: "2",
    name: "Sítio Esperança",
    owner: "Maria Oliveira",
    location: "Uberaba, MG",
    area: 450,
    crops: ["Café", "Laranja"],
    status: "active",
  },
  {
    id: "3",
    name: "Fazenda Boa Vista",
    owner: "Pedro Santos",
    location: "Rondonópolis, MT",
    area: 3200,
    crops: ["Algodão", "Soja", "Milho"],
    status: "active",
  },
  {
    id: "4",
    name: "Rancho Dourado",
    owner: "Ana Ferreira",
    location: "Barretos, SP",
    area: 780,
    crops: ["Cana-de-açúcar"],
    status: "pending",
  },
  {
    id: "5",
    name: "Fazenda Paraíso",
    owner: "Carlos Mendes",
    location: "Rio Verde, GO",
    area: 2100,
    crops: ["Soja", "Milho", "Sorgo"],
    status: "active",
  },
];

export default function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredClients = CLIENTS.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

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
                <TableHead>Proprietário</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Localização
                    <MapPin className="ml-1" size={14} />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Área (ha)
                    <ArrowUpDown className="ml-1" size={14} />
                  </div>
                </TableHead>
                <TableHead>Culturas</TableHead>
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
                  <TableCell>{client.owner}</TableCell>
                  <TableCell>{client.location}</TableCell>
                  <TableCell>{client.area.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
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
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        client.status === "active"
                          ? "bg-primaryGreen/20 text-lightGreen"
                          : "bg-mediumGray/20 text-darkGray"
                      }
                    >
                      {client.status === "active" ? "Ativo" : "Pendente"}
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
              <div className="text-sm mb-1">{client.owner}</div>
              <div className="flex items-center text-sm text-mediumGray mb-2">
                <MapPin className="mr-1" size={14} />
                {client.location}
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-mediumGray">Área:</span>
                <span className="text-sm font-medium">
                  {client.area.toLocaleString()} ha
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
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
              <div className="flex justify-end">
                <Badge
                  className={
                    client.status === "active"
                      ? "bg-primaryGreen/20 text-lightGreen"
                      : "bg-mediumGray/20 text-darkGray"
                  }
                >
                  {client.status === "active" ? "Ativo" : "Pendente"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
