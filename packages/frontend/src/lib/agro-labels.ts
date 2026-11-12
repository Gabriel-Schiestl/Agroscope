// Nomes conhecidos de antemão, usados para exibir o histórico antes de
// GET /crops responder. As culturas disponíveis para análise vêm do backend
// (useAnalysisCrops), que também registra aqui os nomes de culturas novas.
export const CROP_LABELS: Record<string, string> = {
  CORN: 'Milho',
  SOYBEAN: 'Soja',
  WHEAT: 'Trigo',
  TOMATO: 'Tomate',
  COFFEE: 'Café',
};

/** Cultura disponível para análise, como devolvida por GET /crops. */
export interface CropOption {
  code: string;
  label: string;
}

export function registerCropLabels(crops: CropOption[]): void {
  for (const { code, label } of crops) {
    CROP_LABELS[code.toUpperCase()] = label;
  }
}

const SICKNESS_LABELS_BY_CROP: Record<string, Record<string, string>> = {
  CORN: {
    BLIGHT: 'Helmintosporiose',
    COMMON_RUST: 'Ferrugem Comum',
  },
  WHEAT: {
    BLIGHT: 'Giberela',
    RUST_COMMON: 'Ferrugem da Folha',
  },
  SOYBEAN: {
    RUST: 'Ferrugem Asiática',
    TARGET_SPOT: 'Mancha Alvo',
    BACTERIAL_BLIGHT: 'Crestamento Bacteriano',
  },
  TOMATO: {
    BACTERIAL_SPOT: 'Pinta Bacteriana',
    LEAF_MOLD: 'Mofo das Folhas',
  },
  COFFEE: {
    RUST: 'Ferrugem do Cafeeiro',
    PHOMA: 'Mancha de Phoma',
  },
};

const SICKNESS_LABELS: Record<string, string> = {
  RUST_BLIGHT: 'Ferrugem Polissora',
  RUST_COMMON: 'Ferrugem Comum',
  COMMON_RUST: 'Ferrugem Comum',
  BROWN_RUST: 'Ferrugem Parda',
  YELLOW_RUST: 'Ferrugem Amarela',
  SOYBEAN_RUST: 'Ferrugem Asiática',
  BACTERIAL_BLIGHT: 'Crestamento Bacteriano',
  TARGET_SPOT: 'Mancha Alvo',
  BACTERIAL_SPOT: 'Pinta Bacteriana',
  LEAF_MOLD: 'Mofo das Folhas',
  BLIGHT: 'Queima Foliar',
  RUST: 'Ferrugem',
  PHOMA: 'Mancha de Phoma',
};

export function cropLabel(crop?: string): string {
  if (!crop) return 'Não identificada';
  return CROP_LABELS[crop.toUpperCase()] ?? crop;
}

export function sicknessLabel(name?: string, crop?: string): string {
  if (!name) return 'Não identificada';
  const key = name.toUpperCase();
  const byCrop = crop ? SICKNESS_LABELS_BY_CROP[crop.toUpperCase()]?.[key] : undefined;
  return byCrop ?? SICKNESS_LABELS[key] ?? name.replace(/_/g, ' ');
}

/**
 * Confidence quality is independent from diagnosis severity: a 94% confidence
 * disease reading should read as trustworthy (good), not alarming, just like
 * a 94% confidence healthy reading. Severity (healthy vs. disease) is a
 * separate signal, shown elsewhere (headline icon, image ring).
 */
export type ConfidenceTone = 'good' | 'medium' | 'low';

export function confidenceTone(value: number): ConfidenceTone {
  if (value >= 0.8) return 'good';
  if (value >= 0.5) return 'medium';
  return 'low';
}
