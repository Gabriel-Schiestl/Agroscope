import { AuthenticationServiceImpl } from './Authentication.service';

export const services = [
    {
        provide: 'AuthenticationService',
        useClass: AuthenticationServiceImpl,
    },
];
