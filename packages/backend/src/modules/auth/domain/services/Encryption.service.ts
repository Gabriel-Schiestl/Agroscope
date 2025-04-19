import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Result } from 'src/shared/Result';

export interface EncryptionService {
    encrypt(text: string): Promise<string>;
    compare(
        password: string,
        passwordRegistered: string,
    ): Promise<Result<BusinessException, void>>;
}
