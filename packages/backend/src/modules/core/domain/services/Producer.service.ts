import { Observable } from 'rxjs';

export interface ProducerService {
    sendMessage(pattern: string, message: string): void;
}
