import { Exception } from '../Exception';

export class BusinessException extends Exception {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessException';
    }
}
