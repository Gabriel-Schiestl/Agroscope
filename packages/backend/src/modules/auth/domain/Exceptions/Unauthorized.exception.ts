import { Exception } from 'src/shared/Exception';

export class UnauthorizedException extends Exception {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedException';
    }
}
