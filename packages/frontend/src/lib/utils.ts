import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// O backend persiste a imagem da análise como base64 puro (sem prefixo
// data:). Já URLs (blob:, http, /placeholder.svg) devem passar direto.
export function toImageSrc(image?: string): string {
  if (!image) return "/placeholder.svg";
  if (/^(data:|blob:|https?:|\/)/.test(image)) return image;
  return `data:image/jpeg;base64,${image}`;
}
