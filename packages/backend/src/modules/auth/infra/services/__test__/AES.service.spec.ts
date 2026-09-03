import { AESServiceImpl } from '../AES.service';

describe('AESServiceImpl', () => {
    const key = '0'.repeat(64); // 32-byte hex key
    let service: AESServiceImpl;

    beforeEach(() => {
        service = new AESServiceImpl(key);
    });

    it('should encrypt and decrypt back to the original text', async () => {
        const encryptResult = await service.encrypt('my-secret-token');
        expect(encryptResult.isSuccess()).toBe(true);
        if (encryptResult.isFailure()) return;

        expect(encryptResult.value).toContain(':');

        const decryptResult = await service.decrypt(encryptResult.value);
        expect(decryptResult.isSuccess()).toBe(true);
        expect(decryptResult.isSuccess() && decryptResult.value).toBe(
            'my-secret-token',
        );
    });

    it('should produce different ciphertexts for the same input due to random IV', async () => {
        const first = await service.encrypt('same-text');
        const second = await service.encrypt('same-text');

        expect(first.isSuccess() && first.value).not.toBe(
            second.isSuccess() && second.value,
        );
    });
});
