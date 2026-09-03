import { test, expect } from '../../fixtures';
import { HistoryPage } from '../../pages/HistoryPage';
import { HistoryDetailPage } from '../../pages/HistoryDetailPage';
import { predictNTimes, getHistory, signup, loginOrThrow } from '../../support/api-client';
import { request as pwRequest } from '@playwright/test';
import { BASE_URL } from '../../support/env';
import { uniqueEmail, uniqueName, VALID_PASSWORD } from '../../support/test-data';

const SEED_COUNT = 9;

test.describe('Módulo: Histórico', () => {
  test.beforeEach(async ({ authedUser }) => {
    // MockPredictService sorteia entre 3 culturas (Tomate/Milho/Soja) a cada
    // chamada — seedar várias análises dá uma boa chance de ter mais de uma
    // cultura representada, o que os testes de filtro exploram dinamicamente
    // (em vez de assumir qual cultura específica vai sair).
    await predictNTimes(authedUser.apiContext, SEED_COUNT);
  });

  test('CT-26 - visualizar histórico de análises', async ({ authedPage }) => {
    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();

    await expect(historyPage.resultsSummary).toContainText(`de ${SEED_COUNT} análises`);

    const firstItem = historyPage.itemByIndex(0);
    await expect(firstItem).toBeVisible();
    await expect(firstItem.getByText(/Cultura:/)).toBeVisible();
    await expect(firstItem.getByText(/%$/)).toBeVisible();
  });

  test('CT-27 - filtrar histórico por cultura', async ({ authedPage, authedUser }) => {
    const seeded = await getHistory(authedUser.apiContext);
    // O filtro de cultura em /history só lista Soja/Milho/Café/Algodão/Trigo
    // (CROP_OPTIONS em history/page.tsx) — "Tomate", que o MockPredictService
    // também sorteia, não é uma opção selecionável. Por isso restringimos às
    // culturas que de fato aparecem no filtro.
    const FILTERABLE_CROPS = ['Soja', 'Milho', 'Café', 'Algodão', 'Trigo'];
    const crops = Array.from(
      new Set(seeded.map((h: any) => h.crop).filter((c: string) => FILTERABLE_CROPS.includes(c))),
    );
    test.skip(
      crops.length === 0,
      'Nenhuma das 9 análises seedadas caiu em Soja/Milho (só Tomate, por sorte do mock) — não dá para exercitar o filtro desta vez.',
    );
    const targetCrop = crops[0] as string;
    const expectedCount = seeded.filter((h: any) => h.crop === targetCrop).length;

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    await historyPage.filterByCrop(targetCrop);

    await expect(historyPage.resultsSummary).toContainText(`de ${expectedCount} análises`);
    const visibleCount = Math.min(expectedCount, 5);
    for (let i = 0; i < visibleCount; i++) {
      await expect(historyPage.itemByIndex(i).getByText(`Cultura: ${targetCrop}`)).toBeVisible();
    }
  });

  test('CT-28 - visualizar detalhes de uma análise', async ({ authedPage }) => {
    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();

    const firstItem = historyPage.itemByIndex(0);
    await historyPage.viewDetailsButtonForItem(firstItem).click();

    await expect(authedPage).toHaveURL(/\/history\/.+/);
    const detailPage = new HistoryDetailPage(authedPage);
    await expect(detailPage.title).toBeVisible();
    await expect(detailPage.diagnosisHeading).toBeVisible();
    await expect(detailPage.cropHeading).toBeVisible();
    // CardTitle (components/ui/card.tsx) renderiza uma <div>, não uma heading semântica.
    await expect(authedPage.getByText('Informações Detalhadas')).toBeVisible();
  });

  test('CT-30 - isolamento de histórico entre usuários', async ({ authedPage, browser }) => {
    // Usuário A já tem SEED_COUNT análises (seedadas no beforeEach). Cria um
    // usuário B, isolado, com uma quantidade diferente de análises, e confirma
    // que cada um só enxerga as próprias.
    const userB = { name: uniqueName('Usuário B'), email: uniqueEmail('user-b'), password: VALID_PASSWORD };
    const apiContextB = await pwRequest.newContext({ baseURL: BASE_URL });
    await signup(apiContextB, userB);
    await loginOrThrow(apiContextB, userB.email, userB.password);
    const userBSeedCount = 2;
    await predictNTimes(apiContextB, userBSeedCount);

    const storageStateB = await apiContextB.storageState();
    const contextB = await browser.newContext({ storageState: storageStateB });
    const pageB = await contextB.newPage();

    const historyPageA = new HistoryPage(authedPage);
    await historyPageA.goto();
    await expect(historyPageA.resultsSummary).toContainText(`de ${SEED_COUNT} análises`);

    const historyPageB = new HistoryPage(pageB);
    await historyPageB.goto();
    await expect(historyPageB.resultsSummary).toContainText(`de ${userBSeedCount} análises`);

    await contextB.close();
    await apiContextB.dispose();
  });

  test.fixme(
    'CT-29 - confirmar ou contestar diagnóstico (bloqueado: funcionalidade não existe na UI nem na API)',
    async ({ authedPage }) => {
      // Não há botões de confirmação/contestação em /history nem em
      // /history/[id] (packages/frontend/src/app/(dashboard)/history/**), e o
      // backend não expõe nenhuma rota para atualizar o status de um
      // diagnóstico (packages/backend/src/modules/core/controllers/core.controller.ts
      // só tem GET para history). Não é possível automatizar este fluxo até
      // a funcionalidade ser implementada.
      const historyPage = new HistoryPage(authedPage);
      await historyPage.goto();
      const firstItem = historyPage.itemByIndex(0);
      await historyPage.viewDetailsButtonForItem(firstItem).click();
      await authedPage.getByRole('button', { name: 'Confirmar Diagnóstico' }).click();
      await expect(authedPage.getByText('Confirmado')).toBeVisible();
    },
  );
});
