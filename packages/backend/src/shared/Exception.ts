export class Exception extends Error {
    constructor(public message: string) {
        super(message);
    }
}
