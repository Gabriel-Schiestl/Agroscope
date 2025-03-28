import { AuthenticationServiceImpl } from './Authentication.service';
import { EncryptionServiceImpl } from './Encryption.service';

export const services = [
    {
        provide: 'AuthenticationService',
        useClass: AuthenticationServiceImpl,
    },
    {
        provide: 'EncryptionService',
        useClass: EncryptionServiceImpl,
    },
];
