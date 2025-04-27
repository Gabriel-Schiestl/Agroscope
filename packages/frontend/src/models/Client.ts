import { Visit } from "./Visit";

/**
 * Enums e tipos para o modelo Client
 */
export enum PersonType {
  CPF = "PF",
  CNPJ = "PJ",
}

export enum Crop {
  SOYBEAN = "SOJA",
  CORN = "MILHO",
  WHEAT = "TRIGO",
}

/**
 * Interface para endereço
 */
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Interface para o cliente
 */
export interface Client {
  id: string;
  name: string;
  telephone: string;
  person: PersonType;
  document: string;
  address: Address;
  totalArea: number;
  totalAreaPlanted: number;
  active: boolean;
  actualCrop?: Crop;
  visits?: Visit[];
  createdAt?: Date;
}
