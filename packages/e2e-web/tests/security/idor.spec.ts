import { test, expect } from '../../fixtures';
import { request as pwRequest } from '@playwright/test';
import { io } from 'socket.io-client';
import { predictOnce, signup, loginOrThrow, extractSessionToken } from '../../support/api-client';
import { sendChatMessage } from '../../support/chat-socket';
import { uniqueEmail, uniqueName, VALID_PASSWORD } from '../../support/test-data';
import { API_PREFIX, BASE_URL } from '../../support/env';

// ─────────────────────────────────────────────────────────────────────────────
// Testes E2E de Segurança — IDOR, na stack completa (nginx + Next + Nest)
//
// A "vítima" (fixture authedUser) faz uma análise real (MOCK_AI). O "atacante"
// é outro usuário legítimo que descobre o ID dessa análise e tenta:
//   1. Abrir /history/:id no browser;
//   2. Chamar GET /api/history/:id direto;
//   3. Abrir um chat usando o ID da análise como sessionId, via WebSocket,
//      pedindo à IA "qual o manejo?" para extrair o diagnóstico da vítima.
// ─────────────────────────────────────────────────────────────────────────────

async function createAttacker() {
  const apiContext = await pwRequest.newContext({ baseURL: BASE_URL });
  const email = uniqueEmail('idor-attacker');
  await signup(apiContext, { name: uniqueName('Atacante'), email, password: VALID_PASSWORD });
  await loginOrThrow(apiContext, email, VALID_PASSWORD);
  return apiContext;
}

test.describe('Segurança — IDOR (stack completa)', () => {
  test('atacante abrindo /history/:id da vítima no browser vê 404, não o diagnóstico', async ({
    browser,
    authedUser,
  }) => {
    const analysis = await (await predictOnce(authedUser.apiContext)).json();

    const attackerApi = await createAttacker();
    const attackerContext = await browser.newContext({
      storageState: await attackerApi.storageState(),
    });
    const page = await attackerContext.newPage();

    await page.goto(`/history/${analysis.id}`);

    await expect(page.getByRole('heading', { name: /404/ })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Detalhes da Análise' })).toHaveCount(0);
    if (analysis.handling) {
      await expect(page.getByText(analysis.handling)).toHaveCount(0);
    }

    await attackerContext.close();
    await attackerApi.dispose();
  });

  test('a própria vítima abre o mesmo /history/:id normalmente (controle positivo)', async ({
    authedPage,
    authedUser,
  }) => {
    const analysis = await (await predictOnce(authedUser.apiContext)).json();

    await authedPage.goto(`/history/${analysis.id}`);

    await expect(authedPage.getByRole('heading', { name: 'Detalhes da Análise' })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('GET /api/history/:id da vítima com a sessão do atacante retorna 404 sem dados', async ({
    authedUser,
  }) => {
    const analysis = await (await predictOnce(authedUser.apiContext)).json();
    const attackerApi = await createAttacker();

    const response = await attackerApi.get(`${API_PREFIX}/history/${analysis.id}`);

    expect(response.status()).toBe(404);
    const body = await response.text();
    expect(body).not.toContain(analysis.id);
    if (analysis.handling) expect(body).not.toContain(analysis.handling);

    const list = await (await attackerApi.get(`${API_PREFIX}/history`)).json();
    expect(list).toEqual([]);

    await attackerApi.dispose();
  });

  test('chat via WebSocket com o ID da análise da vítima é rejeitado e não devolve o diagnóstico dela', async ({
    authedUser,
  }) => {
    const analysis = await (await predictOnce(authedUser.apiContext)).json();
    const attackerApi = await createAttacker();
    const attackerToken = await extractSessionToken(attackerApi);

    const ack = await sendChatMessage(attackerToken, analysis.id, 'Qual o manejo recomendado?');

    // A sessão pertence à vítima: o gateway deve devolver erro, sem gerar
    // resposta da IA (que traria o `handling` da análise no MockAiAgentService).
    expect(ack?.error).toBe('Sessão não encontrada');
    expect(ack?.aiMessage).toBeUndefined();
    if (analysis.handling) expect(JSON.stringify(ack)).not.toContain(analysis.handling);

    await attackerApi.dispose();
  });

  test('WebSocket do chat derruba a conexão sem sessão válida', async () => {
    const socket = io(`${BASE_URL}/chat`, {
      path: '/api/socket.io',
      auth: { token: 'token-invalido' },
      transports: ['websocket'],
      reconnection: false,
    });

    // O gateway autentica em handleConnection e chama disconnect(true).
    const disconnected = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 10_000);
      socket.once('disconnect', () => {
        clearTimeout(timer);
        resolve(true);
      });
      socket.once('connect_error', () => {
        clearTimeout(timer);
        resolve(true);
      });
    });
    socket.close();

    expect(disconnected).toBe(true);
  });
});
