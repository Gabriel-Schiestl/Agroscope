import { Sickness } from "./Sickness";

export interface History {
  id: string;
  createdAt: Date;
  sickness: Sickness;
  sicknessConfidence: number;
  crop: string;
  cropConfidence: number;
  handling: string;
  image: string;
  clientId?: string;
  userId?: string;
}
