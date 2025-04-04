export interface ProducerService {
    sendMessage<T>(pattern: string, message: T): void;
}
