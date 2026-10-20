import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { clearTables } from '../setup/db-cleanup';
import { seedPlan } from '../setup/seed';
import { ChatMessage } from 'src/modules/chat/domain/models/ChatMessage';
import { ChatMessageRepository } from 'src/modules/chat/domain/repositories/ChatMessage.repository';
import { SendMessageUseCase } from 'src/modules/chat/application/usecases/SendMessage.usecase';
import { AiAgentPayload } from 'src/modules/chat/domain/services/AiAgent.service';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { Res } from 'src/shared/Result';
import { seedHistory, seedVictimAndAttacker } from './security-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Segurança — IDOR (Insecure Direct Object Reference)
//
// Um usuário autenticado (o "atacante") conhece ou adivinha o ID de um recurso
// de outro usuário (a "vítima") e tenta lê-lo ou alterá-lo direto pela API.
// O backend precisa SEMPRE derivar o dono do recurso da sessão (JWT `sub`),
// nunca de algo que o cliente envia (path, query ou body).
//
// Cada teste faz login de dois usuários, então os limites do throttler são
// fixados altos ANTES de importar o app (import dinâmico no beforeAll) para a
// suíte não depender do .env local; o ambiente é restaurado no afterAll.
// ─────────────────────────────────────────────────────────────────────────────

const THROTTLE_ENV: Record<string, string> = {
    THROTTLE_SHORT_TTL: '1000',
    THROTTLE_SHORT_LIMIT: '1000',
    THROTTLE_MEDIUM_TTL: '60000',
    THROTTLE_MEDIUM_LIMIT: '10000',
    THROTTLE_LONG_TTL: '3600000',
    THROTTLE_LONG_LIMIT: '100000',
    THROTTLE_LOGIN_LIMIT: '1000',
};

describe('Segurança — IDOR (e2e)', () => {
    let app: INestApplication;
    let chatMessageRepository: ChatMessageRepository;
    let userRepository: UserRepository;
    const originalEnv: Record<string, string | undefined> = {};
    const aiAgent = {
        sendMessage: jest.fn(async (_payload: AiAgentPayload) =>
            Res.success('resposta da IA'),
        ),
    };

    beforeAll(async () => {
        for (const [key, value] of Object.entries(THROTTLE_ENV)) {
            originalEnv[key] = process.env[key];
            process.env[key] = value;
        }

        const { createTestApp } = await import('../setup/test-app');
        app = await createTestApp([
            { token: 'AiAgentService', value: aiAgent },
        ]);
        chatMessageRepository = app.get('ChatMessageRepository');
        userRepository = app.get('UserRepository');
    });

    afterAll(async () => {
        await app.close();
        for (const [key, value] of Object.entries(originalEnv)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    });

    beforeEach(async () => {
        aiAgent.sendMessage.mockClear();
        await clearTables(app, [
            'chat_message',
            'history',
            'authentication',
            'user',
        ]);
    });

    async function saveChatMessage(
        userId: string,
        sessionId: string,
        content: string,
    ) {
        const message = ChatMessage.create({
            content,
            sender: 'human',
            userId,
            sessionId,
        });
        if (message.isFailure()) throw message.error;
        await chatMessageRepository.save(message.value);
    }

    describe('Histórico de análises (/history)', () => {
        it('GET /history/:id de outro usuário retorna 404 e não vaza nenhum dado da vítima', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-hist');
            const victimHistory = await seedHistory(app, victim.user.id);

            const response = await request(app.getHttpServer())
                .get(`/history/${victimHistory.id}`)
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(404);
            const body = JSON.stringify(response.body);
            expect(body).not.toContain('confidencial');
            expect(body).not.toContain(victim.user.id);
        });

        it('o dono continua acessando o próprio histórico pelo mesmo ID (controle positivo)', async () => {
            const { victim } = await seedVictimAndAttacker(app, 'idor-hist-own');
            const victimHistory = await seedHistory(app, victim.user.id);

            const response = await request(app.getHttpServer())
                .get(`/history/${victimHistory.id}`)
                .set('Cookie', victim.cookie);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(victimHistory.id);
        });

        it('"ID de outro usuário" recebe o mesmo status de "ID inexistente" (404, não 403)', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-enum');
            const victimHistory = await seedHistory(app, victim.user.id);
            const nonExistentId = '00000000-0000-4000-8000-000000000000';

            const otherUsers = await request(app.getHttpServer())
                .get(`/history/${victimHistory.id}`)
                .set('Cookie', attacker.cookie);
            const nonExistent = await request(app.getHttpServer())
                .get(`/history/${nonExistentId}`)
                .set('Cookie', attacker.cookie);

            expect(otherUsers.status).toBe(404);
            expect(nonExistent.status).toBe(404);
        });

        it('GET /history/:id sem sessão retorna 401', async () => {
            const { victim } = await seedVictimAndAttacker(app, 'idor-anon');
            const victimHistory = await seedHistory(app, victim.user.id);

            const response = await request(app.getHttpServer()).get(
                `/history/${victimHistory.id}`,
            );

            expect(response.status).toBe(401);
        });

        it('GET /history lista somente as análises do usuário da sessão', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-list');
            await seedHistory(app, victim.user.id, { crop: 'Milho' });
            await seedHistory(app, victim.user.id, { crop: 'Soja' });
            const attackerHistory = await seedHistory(app, attacker.user.id, {
                crop: 'Tomate',
            });

            const response = await request(app.getHttpServer())
                .get('/history')
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].id).toBe(attackerHistory.id);
        });

        it('parâmetro "userId" injetado na query string é ignorado (dono vem só da sessão)', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-query');
            await seedHistory(app, victim.user.id);

            const response = await request(app.getHttpServer())
                .get(`/history?userId=${victim.user.id}&user_id=${victim.user.id}`)
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('GET /history/analytics agrega somente os dados do usuário da sessão', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-analytics');
            await seedHistory(app, victim.user.id);
            await seedHistory(app, victim.user.id);
            await seedHistory(app, victim.user.id);

            const response = await request(app.getHttpServer())
                .get(`/history/analytics?userId=${victim.user.id}`)
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body.totalAnalyses).toBe(0);
            expect(response.body.byCrop).toEqual([]);
        });
    });

    describe('Chat (/chat e gateway WebSocket)', () => {
        it('GET /chat/history com sessionId de outro usuário retorna lista vazia', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-chat');
            await saveChatMessage(victim.user.id, 'sessao-da-vitima', 'Mensagem privada');

            const response = await request(app.getHttpServer())
                .get('/chat/history?sessionId=sessao-da-vitima')
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('GET /chat/sessions não lista sessões de outros usuários', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-sessions');
            await saveChatMessage(victim.user.id, 'sessao-da-vitima', 'Mensagem privada');
            await saveChatMessage(attacker.user.id, 'sessao-do-atacante', 'Oi');

            const response = await request(app.getHttpServer())
                .get('/chat/sessions')
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(['sessao-do-atacante']);
        });

        it('enviar mensagem usando o ID da análise de outro usuário como sessão é rejeitado sem gravar nada nem chamar a IA', async () => {
            // O chat usa o ID da análise como sessionId e injeta o diagnóstico
            // no contexto da IA. Se não houver checagem de dono, o atacante
            // pergunta "qual o manejo?" e a IA responde com os dados da vítima
            // — ou, no mínimo, grava mensagens dele na sessão de outro usuário.
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-ws');
            const victimHistory = await seedHistory(app, victim.user.id);
            const sendMessage = app.get(SendMessageUseCase);

            const result = await sendMessage.execute({
                content: 'Qual o manejo recomendado?',
                userId: attacker.user.id,
                sessionId: victimHistory.id,
                initialMessage: 'Olá!',
            });

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error.message).toBe(
                'Sessão não encontrada',
            );
            expect(aiAgent.sendMessage).not.toHaveBeenCalled();

            const attackerMessages = await chatMessageRepository.getBySession(
                victimHistory.id,
                attacker.user.id,
            );
            if (attackerMessages.isFailure()) throw attackerMessages.error;
            expect(attackerMessages.value).toHaveLength(0);

            const attackerAfter = await userRepository.getById(attacker.user.id);
            if (attackerAfter.isFailure()) throw attackerAfter.error;
            expect(attackerAfter.value.limit.chatRequests).toBe(0);
        });

        it('o dono da análise recebe o contexto do diagnóstico normalmente (controle positivo)', async () => {
            const { victim } = await seedVictimAndAttacker(app, 'idor-ws-own');
            const victimHistory = await seedHistory(app, victim.user.id);
            const sendMessage = app.get(SendMessageUseCase);

            await sendMessage.execute({
                content: 'Qual o manejo recomendado?',
                userId: victim.user.id,
                sessionId: victimHistory.id,
            });

            const payload = aiAgent.sendMessage.mock.calls[0][0];
            expect(payload.analysisContext?.handling).toBe(
                'Manejo confidencial da vitima',
            );
        });
    });

    describe('Usuário / plano (/user/plan)', () => {
        it('PATCH /user/plan com "userId" da vítima no body altera somente o plano do atacante (mass assignment)', async () => {
            const { victim, attacker, planId } = await seedVictimAndAttacker(app, 'idor-plan');
            const premium = await seedPlan(app, { type: 'idor-plan-premium', price: 99 });

            const response = await request(app.getHttpServer())
                .patch('/user/plan')
                .set('Cookie', attacker.cookie)
                .send({
                    planId: premium.id,
                    userId: victim.user.id,
                    sub: victim.user.id,
                    id: victim.user.id,
                });

            expect(response.status).toBe(200);

            const victimAfter = await userRepository.getById(victim.user.id);
            const attackerAfter = await userRepository.getById(attacker.user.id);
            if (victimAfter.isFailure()) throw victimAfter.error;
            if (attackerAfter.isFailure()) throw attackerAfter.error;

            expect(victimAfter.value.planId).toBe(planId);
            expect(attackerAfter.value.planId).toBe(premium.id);
        });

        it('PATCH /user/plan sem sessão retorna 401 e não altera nenhum usuário', async () => {
            const { victim, planId } = await seedVictimAndAttacker(app, 'idor-plan-anon');
            const premium = await seedPlan(app, { type: 'idor-plan-anon-premium' });

            const response = await request(app.getHttpServer())
                .patch('/user/plan')
                .send({ planId: premium.id, userId: victim.user.id });

            expect(response.status).toBe(401);

            const victimAfter = await userRepository.getById(victim.user.id);
            if (victimAfter.isFailure()) throw victimAfter.error;
            expect(victimAfter.value.planId).toBe(planId);
        });

        it('GET /auth/validate devolve os dados do dono da sessão, nunca de outro usuário', async () => {
            const { victim, attacker } = await seedVictimAndAttacker(app, 'idor-validate');

            const response = await request(app.getHttpServer())
                .get(`/auth/validate?userId=${victim.user.id}`)
                .set('Cookie', attacker.cookie);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(attacker.email);
            expect(JSON.stringify(response.body)).not.toContain(victim.email);
        });
    });
});
