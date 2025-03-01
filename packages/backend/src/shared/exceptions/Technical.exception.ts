import { Exception } from '../Exception';

export class TechnicalException extends Exception {
    constructor(message: string) {
        super(message);
        this.name = 'TechnicalException';
    }
}
