import { test, expect } from '../../fixtures';
import { HistoryPage } from '../../pages/HistoryPage';
import { ChatPanel } from '../../pages/ChatPanel';
import { predictOnce, extractSessionToken } from '../../support/api-client';
import { seedChatMessages } from '../../support/chat-socket';

test.describe('Módulo: Chat', () => {
  test('CT-31 - enviar mensagem de chat em uma análise recebe resposta contextualizada', async ({
    proPage,
    proUser,
  }) => {
    const predictResponse = await predictOnce(proUser.apiContext);
    const analysis = await predictResponse.json();

    const historyPage = new HistoryPage(proPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(proPage);
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
    proPage,
    proUser,
  }) => {
    const predictResponse = await predictOnce(proUser.apiContext);
    await predictResponse.json();

    const historyPage = new HistoryPage(proPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(proPage);
    await chat.waitForConnected();
    await chat.sendMessage('Quais as causas dessa doença?');
    await expect(chat.lastAssistantBubbleText()).toContainText('(resposta mockada)', {
      timeout: 15_000,
    });

    await proPage.keyboard.press('Escape');
    await expect(chat.panel).not.toBeVisible();

    // Reabre o chat da MESMA análise.
    await historyPage.chatButtonForItem(firstItem).click();
    await expect(chat.panel).toBeVisible();

    // As mensagens da sessão anterior (pergunta do usuário + resposta da IA)
    // devem ser recarregadas via GET /chat/history, em ordem cronológica —
    // não uma nova saudação inicial.
    await expect(proPage.getByText('Quais as causas dessa doença?')).toBeVisible();
  });

  test('CT-33 - abrir chat exibe o contexto correto da análise selecionada', async ({
    proPage,
    proUser,
  }) => {
    const predictResponse = await predictOnce(proUser.apiContext);
    await predictResponse.json();

    const historyPage = new HistoryPage(proPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(proPage);
    await expect(chat.panel).toBeVisible();

    // Primeira vez que o chat dessa análise é aberto: sem histórico salvo
    // ainda, o painel monta a saudação inicial localmente a partir dos dados
    // da própria análise — ver buildInitialMessage em chat-panel.tsx. O
    // painel exibe o rótulo em PT-BR (cropLabel), não o código bruto
    // devolvido pela API (`analysis.crop`, ex. "SOYBEAN") — predictOnce()
    // usa a cultura "SOYBEAN" por padrão, exibida como "Soja".
    await expect(chat.panel.getByText('Soja', { exact: false }).first()).toBeVisible();
  });

  test('CT-34 - tentar enviar mensagem com limite de chat esgotado bloqueia o envio', async ({
    proPage,
    proUser,
  }) => {
    const predictResponse = await predictOnce(proUser.apiContext);
    const analysis = await predictResponse.json();

    const token = await extractSessionToken(proUser.apiContext);
    await seedChatMessages(token, analysis.id, 10);

    const historyPage = new HistoryPage(proPage);
    await historyPage.goto();
    const firstItem = historyPage.itemByIndex(0);
    await historyPage.chatButtonForItem(firstItem).click();

    const chat = new ChatPanel(proPage);
    await expect(chat.panel).toBeVisible();
    await expect(chat.limitReachedMessage).toContainText('Limite de 10 mensagens por análise atingido');
    await expect(chat.messageInput).toBeDisabled();
  });

  test('CT-34b - plano gratuito não tem acesso ao chat', async ({ authedPage, authedUser }) => {
    await predictOnce(authedUser.apiContext);

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    await historyPage.chatButtonForItem(historyPage.itemByIndex(0)).click();

    const chat = new ChatPanel(authedPage);
    await expect(chat.panel).toBeVisible();
    await expect(chat.noChatAccessMessage).toBeVisible();
    await expect(chat.messageInput).toBeDisabled();
  });
});
