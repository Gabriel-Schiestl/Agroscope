"use client";

import { useRouter } from "next/navigation";

export function VoltarButton() {
  const router = useRouter();

  const handleClick = () => {
    window.close();
    // Aberto em outra aba (a partir do cadastro), a aba é fechada; aberto pelo
    // menu ou rodapé, volta para a página anterior (ou para o início).
    if (!window.closed) {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-primaryGreen hover:underline text-sm"
    >
      Voltar
    </button>
  );
}
