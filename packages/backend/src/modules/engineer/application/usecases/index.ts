import { CreateClientUseCase } from './CreateClient.usecase';
import { GetClientUseCase } from './GetClient.usecase';
import { GetClientsUseCase } from './GetClients.usecase';
import { GetClientsByCropUseCase } from './GetClientsByCrop.usecase';

export const engineerUseCases = [
    CreateClientUseCase,
    GetClientsUseCase,
    GetClientsByCropUseCase,
    GetClientUseCase,
];
