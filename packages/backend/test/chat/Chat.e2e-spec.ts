import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../setup/test-app';
import { clearTables } from '../setup/db-cleanup';
import { seedUserWithAuthentication } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';
import { ChatMessage } from 'src/modules/chat/domain/models/ChatMessage';
import { ChatMessageRepository } from 'src/modules/chat/domain/repositories/ChatMessage.repository';

describe('Chat (e2e)', () => {
    let app: INestApplication;
    let chatMessageRepository: ChatMessageRepository;

    const ownerEmail = 'chat.owner@agroscope.test';
    const otherEmail = 'chat.other@agroscope.test';
    const password = 'Str0ng-Password!';

    beforeAll(async () => {
        app = await createTestApp();

        chatMessageRepository = app.get('ChatMessageRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearTables(app, ['chat_message', 'authentication', 'user']);
    });

    async function saveMessage(
        userId: string,
        sessionId: string,
        content: string,
        sender: 'human' | 'ai',
    ) {
        const message = ChatMessage.create({ content, sender, userId, sessionId });
        if (message.isFailure()) throw message.error;
        await chatMessageRepository.save(message.value);
    }

    it('lista apenas as sessões do usuário autenticado, mais recente primeiro', async () => {
        const { user: owner } = await seedUserWithAuthentication(app, {
            email: ownerEmail,
            password,
        });
        const { user: other } = await seedUserWithAuthentication(app, {
            email: otherEmail,
            password,
        });

        await saveMessage(owner.id, 'session-a', 'Olá', 'human');
        await saveMessage(owner.id, 'session-b', 'Outra sessão', 'human');
        await saveMessage(other.id, 'session-c', 'Não deveria aparecer', 'human');

        const cookie = await loginAndGetCookie(app, ownerEmail, password);

        const response = await request(app.getHttpServer())
            .get('/chat/sessions')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body.sort()).toEqual(['session-a', 'session-b']);
    });

    it('retorna o histórico de uma sessão do usuário autenticado, em ordem cronológica', async () => {
        const { user: owner } = await seedUserWithAuthentication(app, {
            email: ownerEmail,
            password,
        });

        await saveMessage(owner.id, 'session-a', 'Pergunta do usuário', 'human');
        await saveMessage(owner.id, 'session-a', 'Resposta da IA', 'ai');

        const cookie = await loginAndGetCookie(app, ownerEmail, password);

        const response = await request(app.getHttpServer())
            .get('/chat/history?sessionId=session-a')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].content).toBe('Pergunta do usuário');
        expect(response.body[1].content).toBe('Resposta da IA');
    });

    it('não retorna mensagens de uma sessão pertencente a outro usuário', async () => {
        const { user: owner } = await seedUserWithAuthentication(app, {
            email: ownerEmail,
            password,
        });
        const { user: other } = await seedUserWithAuthentication(app, {
            email: otherEmail,
            password,
        });
        await saveMessage(other.id, 'session-c', 'Mensagem privada', 'human');

        const cookie = await loginAndGetCookie(app, ownerEmail, password);

        const response = await request(app.getHttpServer())
            .get('/chat/history?sessionId=session-c')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('recusa o acesso sem sessão válida', async () => {
        const response = await request(app.getHttpServer()).get(
            '/chat/sessions',
        );

        expect(response.status).toBe(401);
    });
});
