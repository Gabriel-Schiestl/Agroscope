import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Inject, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from '../application/dto/SendMessage.dto';
import { SendMessageUseCase } from '../application/usecases/SendMessage.usecase';
import { AESService } from 'src/modules/auth/domain/services/AES.service';
import { AuthenticationService } from 'src/modules/auth/domain/services/Authentication.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        @Inject('AESService')
        private readonly aesService: AESService,
        @Inject('AuthenticationService')
        private readonly authenticationService: AuthenticationService,
    ) {}

    async handleConnection(client: Socket) {
        const userId = await this.authenticateSocket(client);
        if (!userId) {
            client.disconnect(true);
            return;
        }

        client.data.userId = userId;
        this.logger.log(`Cliente conectado: ${client.id} (userId: ${userId})`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const userId = client.data.userId as string;

        if (!userId) {
            throw new WsException('Não autenticado');
        }

        const result = await this.sendMessageUseCase.execute({
            content: dto.content,
            userId,
            sessionId: dto.sessionId,
        });

        if (result.isFailure()) {
            throw new WsException(result.error.message);
        }

        return result.value;
    }

    private async authenticateSocket(client: Socket): Promise<string | null> {
        try {
            const token =
                client.handshake.auth?.token ||
                this.extractCookieToken(client.handshake.headers.cookie);

            if (!token) return null;

            const decryptedResult = await this.aesService.decrypt(token);
            if (decryptedResult.isFailure()) return null;

            const payloadResult = await this.authenticationService.verify(
                decryptedResult.value,
            );
            if (payloadResult.isFailure()) return null;

            return payloadResult.value.sub;
        } catch {
            return null;
        }
    }

    private extractCookieToken(cookieHeader?: string): string | null {
        if (!cookieHeader) return null;

        const match = cookieHeader.match(
            /agroscope-authentication=([^;]+)/,
        );
        return match ? decodeURIComponent(match[1]) : null;
    }
}
