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

export const SICKNESS_LABELS: Record<string, string> = {
  Rust_Blight:     'Ferrugem Polissora',
  RUST_BLIGHT:     'Ferrugem Polissora',
  Rust_Common:     'Ferrugem Comum',
  RUST_COMMON:     'Ferrugem Comum',
  Brown_Rust:      'Ferrugem Parda',
  BROWN_RUST:      'Ferrugem Parda',
  Yellow_Rust:     'Ferrugem Amarela',
  YELLOW_RUST:     'Ferrugem Amarela',
  Soybean_Rust:    'Ferrugem Asiática',
  Bacterial_Blight: 'Crestamento Bacteriano',
  BACTERIAL_BLIGHT: 'Crestamento Bacteriano',
  SOYBEAN_RUST:    'Ferrugem Asiática',
  Target_Spot:     'Mancha Alvo',
  TARGET_SPOT:     'Mancha Alvo',
  Bacterial_Spot:  'Pinta Bacteriana',
  BACTERIAL_SPOT:  'Pinta Bacteriana',
  Leaf_Mold:       'Mofo das Folhas',
  LEAF_MOLD:       'Mofo das Folhas',
  Rust:            'Ferrugem',
  RUST:            'Ferrugem',
  Phoma:           'Mancha de Phoma',
  PHOMA:           'Mancha de Phoma',
};

export function cropLabel(crop?: string): string {
  if (!crop) return 'Não identificada';
  return CROP_LABELS[crop.toUpperCase()] ?? crop;
}

export function sicknessLabel(name?: string): string {
  if (!name) return 'Não identificada';
  return SICKNESS_LABELS[name] ?? name.replace(/_/g, ' ');
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
