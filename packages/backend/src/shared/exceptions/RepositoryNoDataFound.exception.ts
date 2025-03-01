import { Exception } from '../Exception';

export class RepositoryNoDataFound extends Exception {
    constructor(message: string) {
        super(message);
        this.name = 'RepositoryNoDataFound';
    }
}
