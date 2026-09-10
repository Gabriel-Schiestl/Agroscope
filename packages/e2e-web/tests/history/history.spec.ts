import { test, expect } from '../../fixtures';
import { HistoryPage } from '../../pages/HistoryPage';
import { HistoryDetailPage } from '../../pages/HistoryDetailPage';
import { predictOnce, predictNTimes, getHistory, signup, loginOrThrow } from '../../support/api-client';
import { request as pwRequest } from '@playwright/test';
import { BASE_URL } from '../../support/env';
import { uniqueEmail, uniqueName, VALID_PASSWORD } from '../../support/test-data';

const SEED_COUNT = 9;

// A cultura agora é escolhida por quem chama /predict (ver Crop.ts no
// backend) em vez de sorteada pelo mock — alterna entre duas culturas
// suportadas ao seedar para garantir diversidade determinística no
// histórico, em vez de depender de sorte como antes.
const SEED_CROPS = ['SOYBEAN', 'WHEAT'];
const CROP_LABELS: Record<string, string> = { SOYBEAN: 'Soja', WHEAT: 'Trigo' };

test.describe('Módulo: Histórico', () => {
  test.beforeEach(async ({ authedUser }) => {
    for (let i = 0; i < SEED_COUNT; i++) {
      await predictOnce(authedUser.apiContext, undefined, SEED_CROPS[i % SEED_CROPS.length]);
    }
  });

  test('CT-26 - visualizar histórico de análises', async ({ authedPage }) => {
    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();

    await expect(historyPage.resultsSummary).toContainText(`de ${SEED_COUNT} análises`);

    const firstItem = historyPage.itemByIndex(0);
    await expect(firstItem).toBeVisible();
    // A cultura sempre é exibida com sua confiança ("Cultura: X (Y%)"); a
    // confiança da doença só aparece quando a análise não é saudável, então
    // não é uma boa asserção genérica aqui — ver CT-27 para o filtro por
    // cultura.
    await expect(firstItem.getByText(/Cultura:.*%/)).toBeVisible();
  });

  test('CT-27 - filtrar histórico por cultura', async ({ authedPage, authedUser }) => {
    const seeded = await getHistory(authedUser.apiContext);
    const targetCropCode = SEED_CROPS[0];
    const targetCropLabel = CROP_LABELS[targetCropCode];
    const expectedCount = seeded.filter((h: any) => h.crop === targetCropCode).length;

    const historyPage = new HistoryPage(authedPage);
    await historyPage.goto();
    await historyPage.filterByCrop(targetCropLabel);

    await expect(historyPage.resultsSummary).toContainText(`de ${expectedCount} análises`);
    const visibleCount = Math.min(expectedCount, 5);
    for (let i = 0; i < visibleCount; i++) {
      await expect(historyPage.itemByIndex(i).getByText(`Cultura: ${targetCropLabel}`)).toBeVisible();
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
    // "O que fazer agora" é a única seção do DiagnosisResult garantida em
    // ambos os cenários (saudável e doente) — nos demais (explicação,
    // causas, precauções) o mock só preenche o texto quando há doença.
    await expect(authedPage.getByRole('heading', { name: 'O que fazer agora' })).toBeVisible();
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
});
