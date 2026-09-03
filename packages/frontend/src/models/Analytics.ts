export type AnalyticsGranularity = "day" | "week" | "month";

export interface DiseaseCount {
  sicknessId: string;
  sicknessName: string;
  count: number;
  percentage: number;
}

export interface CropCount {
  crop: string;
  count: number;
  percentage: number;
}

export interface PeriodCount {
  period: string;
  count: number;
}

export interface DiseasePeriodSeries {
  sicknessId: string;
  sicknessName: string;
  points: PeriodCount[];
}

export interface DiseasePeak {
  sicknessId: string;
  sicknessName: string;
  period: string;
  count: number;
}

export interface HistoryAnalytics {
  totalAnalyses: number;
  healthyCount: number;
  diseasedCount: number;
  averageCropConfidence: number | null;
  averageSicknessConfidence: number | null;
  distinctCropsCount: number;
  distinctDiseasesCount: number;
  granularity: AnalyticsGranularity;
  byDisease: DiseaseCount[];
  byCrop: CropCount[];
  byPeriod: PeriodCount[];
  peakPeriod: PeriodCount | null;
  diseaseIncidenceByPeriod: DiseasePeriodSeries[];
  diseasePeakPeriods: DiseasePeak[];
}
