import { WsException } from '@nestjs/websockets';
import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { AESService } from 'src/modules/auth/domain/services/AES.service';
import { AuthenticationService } from 'src/modules/auth/domain/services/Authentication.service';
import { SendMessageUseCase } from '../../application/usecases/SendMessage.usecase';
import { ChatGateway } from '../Chat.gateway';

describe('ChatGateway', () => {
    let sendMessageUseCase: jest.Mocked<SendMessageUseCase>;
    let aesService: jest.Mocked<AESService>;
    let authenticationService: jest.Mocked<AuthenticationService>;
    let gateway: ChatGateway;

    const buildClient = (overrides: any = {}) => ({
        id: 'socket-1',
        data: {},
        disconnect: jest.fn(),
        handshake: { auth: {}, headers: {} },
        ...overrides,
    });

    beforeEach(() => {
        sendMessageUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<SendMessageUseCase>;
        aesService = {
            encrypt: jest.fn(),
            decrypt: jest.fn().mockResolvedValue(Res.success('decrypted-jwt')),
        };
        authenticationService = {
            sign: jest.fn(),
            verify: jest
                .fn()
                .mockResolvedValue(
                    Res.success({ name: 'Gabriel', email: 'g@e.com', sub: 'user-1' }),
                ),
        };
        gateway = new ChatGateway(
            sendMessageUseCase,
            aesService,
            authenticationService,
        );
    });

    describe('handleConnection', () => {
        it('should authenticate using the handshake auth token and attach userId', async () => {
            const client = buildClient({
                handshake: { auth: { token: 'auth-token' }, headers: {} },
            });

            await gateway.handleConnection(client as any);

            expect(aesService.decrypt).toHaveBeenCalledWith('auth-token');
            expect(client.data.userId).toBe('user-1');
            expect(client.disconnect).not.toHaveBeenCalled();
        });

        it('should authenticate using the cookie token when no auth token is present', async () => {
            const client = buildClient({
                handshake: {
                    auth: {},
                    headers: {
                        cookie:
                            'other=1; agroscope-authentication=cookie-token; more=2',
                    },
                },
            });

            await gateway.handleConnection(client as any);

            expect(aesService.decrypt).toHaveBeenCalledWith('cookie-token');
            expect(client.data.userId).toBe('user-1');
        });

        it('should disconnect when there is no token', async () => {
            const client = buildClient();

            await gateway.handleConnection(client as any);

            expect(client.disconnect).toHaveBeenCalledWith(true);
        });

        it('should disconnect when decryption fails', async () => {
            aesService.decrypt.mockResolvedValue(
                Res.failure(new BusinessException('bad token')),
            );
            const client = buildClient({
                handshake: { auth: { token: 'auth-token' }, headers: {} },
            });

            await gateway.handleConnection(client as any);

            expect(client.disconnect).toHaveBeenCalledWith(true);
        });

        it('should disconnect when token verification fails', async () => {
            authenticationService.verify.mockResolvedValue(
                Res.failure(new TechnicalException('invalid')),
            );
            const client = buildClient({
                handshake: { auth: { token: 'auth-token' }, headers: {} },
            });

            await gateway.handleConnection(client as any);

            expect(client.disconnect).toHaveBeenCalledWith(true);
        });

        it('should disconnect when authentication throws unexpectedly', async () => {
            aesService.decrypt.mockRejectedValue(new Error('boom'));
            const client = buildClient({
                handshake: { auth: { token: 'auth-token' }, headers: {} },
            });

            await gateway.handleConnection(client as any);

            expect(client.disconnect).toHaveBeenCalledWith(true);
        });
    });

    describe('handleDisconnect', () => {
        it('should not throw', () => {
            expect(() =>
                gateway.handleDisconnect(buildClient() as any),
            ).not.toThrow();
        });
    });

    describe('handleSendMessage', () => {
        it('should throw WsException when the client is not authenticated', async () => {
            const client = buildClient();

            await expect(
                gateway.handleSendMessage(
                    { content: 'Olá', sessionId: 'session-1' } as any,
                    client as any,
                ),
            ).rejects.toBeInstanceOf(WsException);
        });

        it('should return the use case result on success', async () => {
            sendMessageUseCase.execute.mockResolvedValue(
                Res.success({
                    userMessage: { content: 'Olá' } as any,
                    aiMessage: { content: 'resposta' } as any,
                }),
            );
            const client = buildClient({ data: { userId: 'user-1' } });

            const response = await gateway.handleSendMessage(
                { content: 'Olá', sessionId: 'session-1' } as any,
                client as any,
            );

            expect(sendMessageUseCase.execute).toHaveBeenCalledWith({
                content: 'Olá',
                userId: 'user-1',
                sessionId: 'session-1',
            });
            expect(response).toEqual({
                userMessage: { content: 'Olá' },
                aiMessage: { content: 'resposta' },
            });
        });

        it('should return an error payload when the use case fails', async () => {
            const error = new BusinessException('Limite atingido');
            sendMessageUseCase.execute.mockResolvedValue(Res.failure(error));
            const client = buildClient({ data: { userId: 'user-1' } });

            const response = await gateway.handleSendMessage(
                { content: 'Olá', sessionId: 'session-1' } as any,
                client as any,
            );

            expect(response).toEqual({ error: 'Limite atingido' });
        });
    });
});
