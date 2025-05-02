import ClientList from "../../../components/client-list";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl">Meus Clientes</h1>
          <p className="text-mediumGray">
            Gerencie seus clientes e propriedades
          </p>
        </div>
        <Button className="bg-primaryGreen hover:bg-lightGreen">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <ClientList />
    </div>
  );
}
