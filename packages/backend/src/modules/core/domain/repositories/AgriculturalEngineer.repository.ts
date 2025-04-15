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
    getVisits(
        engineerId: string,
        clientId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Visit[]>>;
    getReports(
        engineerId: string,
        clientId: string,
        visitId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Report[]>>;
    getLastVisits(
        engineerId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Visit[]>>;
    getClientsByCrop(
        engineerId: string,
        crop: Crop,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Client[]>>;
}
