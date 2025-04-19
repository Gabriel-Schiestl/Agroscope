import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Result } from 'src/shared/Result';

export interface AESService {
    encrypt(text: string): Promise<Result<BusinessException, string>>;
    decrypt(text: string): Promise<Result<BusinessException, string>>;
}
