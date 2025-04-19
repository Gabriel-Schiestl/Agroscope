import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../../domain/services/Encryption.service';
import { Res, Result } from 'src/shared/Result';
import { hash, compare } from 'bcryptjs';
import { BusinessException } from 'src/shared/exceptions/Business.exception';

@Injectable()
export class EncryptionServiceImpl implements EncryptionService {
    async encrypt(text: string): Promise<string> {
        const saltRounds = 10;
        const hashedText = await hash(text, saltRounds);

        return hashedText;
    }

    async compare(
        password: string,
        hashedPassword: string,
    ): Promise<Result<BusinessException, void>> {
        const valid = await compare(password, hashedPassword);
        if (!valid) {
            return Res.failure(new BusinessException('Invalid password'));
        }

        return Res.success();
    }
}
