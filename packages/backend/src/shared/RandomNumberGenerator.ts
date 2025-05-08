export default function generateRandomNumber(): string {
    const randomNumber = Math.floor(Math.random() * 1000000);

    const stringNumber = randomNumber.toString().padStart(6, '0');

    return stringNumber;
}
