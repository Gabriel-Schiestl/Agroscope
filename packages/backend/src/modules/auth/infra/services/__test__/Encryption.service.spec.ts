import { EncryptionServiceImpl } from '../Encryption.service';
import { BusinessException } from 'src/shared/exceptions/Business.exception';

describe('EncryptionServiceImpl', () => {
    let service: EncryptionServiceImpl;

    beforeEach(() => {
        service = new EncryptionServiceImpl();
    });

    it('should hash a plain text password', async () => {
        const hashed = await service.encrypt('MyPass@123');
        expect(hashed).not.toBe('MyPass@123');
        expect(typeof hashed).toBe('string');
    });

    it('should succeed comparing a password against its own hash', async () => {
        const hashed = await service.encrypt('MyPass@123');
        const result = await service.compare('MyPass@123', hashed);
        expect(result.isSuccess()).toBe(true);
    });

    it('should fail comparing a wrong password against a hash', async () => {
        const hashed = await service.encrypt('MyPass@123');
        const result = await service.compare('WrongPass', hashed);
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });
});
