import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { AgriculturalEngineer } from '../models/AgriculturalEngineer';
import { Visit } from '../models/Visit';
import { Client, Crop } from '../models/Client';
import { Report } from '../models/Report';

export type AgriculturalEngineerRepositoryExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

export interface AgriculturalEngineerRepository {
    save(
        agriculturalEngineer: AgriculturalEngineer,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, void>>;
    getById(
        id: string,
    ): Promise<
        Result<AgriculturalEngineerRepositoryExceptions, AgriculturalEngineer>
    >;
    delete(
        id: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, void>>;
    getByUserId(
        userId: string,
    ): Promise<
        Result<AgriculturalEngineerRepositoryExceptions, AgriculturalEngineer>
    >;
    getWithClients(
        engineerId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Client[]>>;
    getClientsByCrop(
        engineerId: string,
        crop: Crop,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Client[]>>;
}
