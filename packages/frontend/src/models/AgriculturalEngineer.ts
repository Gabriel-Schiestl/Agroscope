import { Client } from "./Client";

/**
 * Interface para o Engenheiro Agrícola
 */
export interface AgriculturalEngineer {
  id: string;
  userId: string;
  clients?: Client[];
}
