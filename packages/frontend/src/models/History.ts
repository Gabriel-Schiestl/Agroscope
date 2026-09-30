export type ClimateMismatch = 'temperature' | 'humidity' | 'season';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ClimateValidation {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  season?: Season;
  compatible: boolean;
  mismatches: ClimateMismatch[];
}

export interface History {
  id: string;
  createdAt: Date;
  sicknessId?: string;
  sicknessName?: string;
  sicknessConfidence?: number;
  crop: string;
  cropConfidence: number;
  handling: string;
  image: string;
  explanation?: string;
  causes?: string;
  precautions?: string;
  climateValidation?: ClimateValidation;
  userId?: string;
}
