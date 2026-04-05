export type RainfallDependency = 'low' | 'medium' | 'high';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ClimateConditions {
  temperatureMin?: number;
  temperatureMax?: number;
  temperatureOptimal?: number;
  humidityMin?: number;
  humidityMax?: number;
  rainfallDependency?: RainfallDependency;
  favorableSeasons?: Season[];
}

export interface Sickness {
  id: string;
  name: string;
  description?: string;
  symptoms: string[];
  climateConditions?: ClimateConditions;
}
