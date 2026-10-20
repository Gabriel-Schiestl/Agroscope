import { randomInt } from 'crypto';

export default function generateRandomNumber(): string {
    const randomNumber = randomInt(0, 1000000);

    const stringNumber = randomNumber.toString().padStart(6, '0');

    return stringNumber;
}
