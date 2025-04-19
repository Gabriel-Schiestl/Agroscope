import { usecases } from '../../application/usecases';
import { AESServiceImpl } from './AES.service';
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
    {
        provide: 'AESService',
        useClass: AESServiceImpl,
    },
];
