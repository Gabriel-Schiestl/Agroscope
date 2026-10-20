import * as crypto from 'crypto';
import generateRandomNumber from '../RandomNumberGenerator';

describe('generateRandomNumber', () => {
    it('gera sempre 6 dígitos, com zeros à esquerda', () => {
        for (let i = 0; i < 1000; i++) {
            expect(generateRandomNumber()).toMatch(/^\d{6}$/);
        }
    });

    it('usa o gerador criptograficamente seguro (crypto.randomInt), não Math.random', () => {
        const mathRandom = jest.spyOn(Math, 'random');

        generateRandomNumber();

        expect(mathRandom).not.toHaveBeenCalled();
        mathRandom.mockRestore();
    });

    it('cobre o intervalo 000000–999999', () => {
        const randomInt = jest.spyOn(crypto, 'randomInt') as jest.SpyInstance;

        randomInt.mockReturnValueOnce(0);
        expect(generateRandomNumber()).toBe('000000');
        randomInt.mockReturnValueOnce(999999);
        expect(generateRandomNumber()).toBe('999999');

        expect(randomInt).toHaveBeenCalledWith(0, 1000000);
        randomInt.mockRestore();
    });
});
