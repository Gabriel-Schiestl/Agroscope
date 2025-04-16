import { Inject, Injectable } from '@nestjs/common';
import { AESService } from '../../domain/services/AES.service';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import * as crypto from 'crypto';

@Injectable()
export class AESServiceImpl implements AESService {
    constructor(@Inject('AES_KEY') private readonly AES_key: string) {
        this.key = Buffer.from(AES_key, 'hex');
    }
    private algorithm = 'aes-256-cbc';
    private key: Buffer;

    async encrypt(text: string): Promise<Result<BusinessException, string>> {
        const iv = this.generateIV();

        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const ivBase64 = iv.toString('base64');

        return Res.success(`${ivBase64}:${encrypted}`);
    }

    async decrypt(data: string): Promise<Result<BusinessException, string>> {
        const [ivBase64, encrypted] = data.split(':');

        const iv = Buffer.from(ivBase64, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);

        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return Res.success(decrypted);
    }

    private generateIV(): Buffer {
        return crypto.randomBytes(16);
    }
}
