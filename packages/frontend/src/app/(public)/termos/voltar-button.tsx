"use client";

import { useRouter } from "next/navigation";

export function VoltarButton() {
  const router = useRouter();

  const handleClick = () => {
    window.close();
    if (!window.closed) {
      router.push("/signup");
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
