import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AnalyticsGranularity } from "../models/Analytics"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPeriodLabel(
  period: string,
  granularity: AnalyticsGranularity
): string {
  const date = new Date(`${period}T00:00:00`);
  if (Number.isNaN(date.getTime())) return period;

  if (granularity === "month") {
    return date
      .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
      .replace(".", "");
  }
  if (granularity === "week") {
    return `Sem. ${date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })}`;
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// O backend persiste a imagem da análise como base64 puro (sem prefixo
// data:). Já URLs (blob:, http, /placeholder.svg) devem passar direto.
export function toImageSrc(image?: string): string {
  if (!image) return "/placeholder.svg";
  if (/^(data:|blob:|https?:|\/)/.test(image)) return image;
  return `data:image/jpeg;base64,${image}`;
}
