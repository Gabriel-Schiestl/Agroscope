import { test, expect } from '../../fixtures';
import { HistoryPage } from '../../pages/HistoryPage';
import { ChatPanel } from '../../pages/ChatPanel';
import { predictOnce, extractSessionToken } from '../../support/api-client';
import { seedChatMessages } from '../../support/chat-socket';

test.describe('Módulo: Chat', () => {
  test('CT-31 - enviar mensagem de chat em uma análise recebe resposta contextualizada', async ({
    authedPage,
    authedUser,
  }) => {
    const predictResponse = await predictOnce(authedUser.apiContext);
    const analysis = await predictResponse.json();

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(authedPage);
    await expect(chat.panel).toBeVisible();
    await chat.waitForConnected();

    await chat.sendMessage('Qual o manejo recomendado?');

    // MockAiAgentService (MOCK_AI=true) responde com o texto de `handling` da
    // própria análise quando a pergunta menciona "manejo" — resposta
    // contextualizada e determinística o suficiente para assert.
    await expect(chat.lastAssistantBubbleText()).toContainText(analysis.handling, {
      timeout: 15_000,
    });
    await expect(chat.lastAssistantBubbleText()).toContainText('(resposta mockada)');
  });

  test('CT-32 - rever histórico de conversa de uma sessão anterior', async ({
    authedPage,
    authedUser,
  }) => {
    const predictResponse = await predictOnce(authedUser.apiContext);
    await predictResponse.json();

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(authedPage);
    await chat.waitForConnected();
    await chat.sendMessage('Quais as causas dessa doença?');
    await expect(chat.lastAssistantBubbleText()).toContainText('(resposta mockada)', {
      timeout: 15_000,
    });

    await authedPage.keyboard.press('Escape');
    await expect(chat.panel).not.toBeVisible();

    // Reabre o chat da MESMA análise.
    await historyPage.chatButtonForItem(firstItem).click();
    await expect(chat.panel).toBeVisible();

    // As mensagens da sessão anterior (pergunta do usuário + resposta da IA)
    // devem ser recarregadas via GET /chat/history, em ordem cronológica —
    // não uma nova saudação inicial.
    await expect(authedPage.getByText('Quais as causas dessa doença?')).toBeVisible();
  });

  test('CT-33 - abrir chat exibe o contexto correto da análise selecionada', async ({
    authedPage,
    authedUser,
  }) => {
    const predictResponse = await predictOnce(authedUser.apiContext);
    const analysis = await predictResponse.json();

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(authedPage);
    await expect(chat.panel).toBeVisible();

    // Primeira vez que o chat dessa análise é aberto: sem histórico salvo
    // ainda, o painel monta a saudação inicial localmente a partir dos dados
    // da própria análise (crop + explanation) — ver buildInitialMessage em
    // chat-panel.tsx.
    await expect(chat.panel.getByText(analysis.crop, { exact: false }).first()).toBeVisible();
    if (analysis.explanation) {
      await expect(
        chat.panel.getByText(analysis.explanation, { exact: false }).first(),
      ).toBeVisible();
    }
  });

  test('CT-34 - tentar enviar mensagem com limite de chat esgotado bloqueia o envio', async ({
    authedPage,
    authedUser,
  }) => {
    const predictResponse = await predictOnce(authedUser.apiContext);
    const analysis = await predictResponse.json();

    // Plano FREE tem chatLimit = 50 (ver migration SeedFreePlan). Esgota via
    // socket direto (fora do browser) para não precisar digitar 50 mensagens
    // pela UI — o comportamento sob teste (bloqueio ao atingir o limite) é
    // conferido depois, abrindo a UI normalmente.
    const token = await extractSessionToken(authedUser.apiContext);
    await seedChatMessages(token, analysis.id, 50);

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(authedPage);
    await expect(chat.panel).toBeVisible();
    await expect(chat.limitReachedMessage).toContainText('Limite de 50 mensagens atingido');
    await expect(chat.messageInput).toBeDisabled();
  });
});
