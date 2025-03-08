import { AuthenticationDataRepository } from './AuthenticationData.repository';

export const repositories = [
    {
        provide: 'AuthenticationRepository',
        useClass: AuthenticationDataRepository,
    },
];
