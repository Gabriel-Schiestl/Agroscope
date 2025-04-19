import { Logger } from '@nestjs/common';
import { Result } from './Result';

export abstract class AbstractUseCase<P, E, R> {
    constructor(
        private readonly logger: Logger = new Logger(AbstractUseCase.name),
    ) {}

    /**
     * Método principal que será chamado pelo cliente.
     * Registra logs e delega a execução para o método onExecute implementado nas classes filhas.
     */
    async execute(data: P): Promise<Result<E, R>> {
        try {
            this.logger.debug(
                `[INÍCIO] Executando ${this.constructor.name} com dados: ${JSON.stringify(data)}`,
            );

            const startTime = Date.now();
            const result = await this.onExecute(data);
            const executionTime = Date.now() - startTime;

            if (result.isFailure()) {
                this.logger.error(
                    `[FALHA] ${this.constructor.name} falhou após ${executionTime}ms com erro: ${JSON.stringify(result.error)}`,
                );
            } else {
                this.logger.debug(
                    `[SUCESSO] ${this.constructor.name} concluído em ${executionTime}ms. Resultado: ${JSON.stringify(result.value)}`,
                );
            }

            return result;
        } catch (error) {
            this.logger.error(
                `[EXCEÇÃO] ${this.constructor.name} lançou exceção: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    /**
     * Método abstrato que deve ser implementado pelas classes filhas
     * contendo a lógica específica de cada caso de uso.
     */
    protected abstract onExecute(data: P): Promise<Result<E, R>>;
}
