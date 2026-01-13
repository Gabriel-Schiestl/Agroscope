import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Página não encontrada</h1>
      <p className="text-lg text-mediumGray mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/analytics">
        <Button className="bg-primaryGreen hover:bg-lightGreen">
          Voltar para a página inicial
        </Button>
      </Link>
    </div>
  );
}
