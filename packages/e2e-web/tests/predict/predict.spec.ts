import { test, expect } from '../../fixtures';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { predictNTimes } from '../../support/api-client';
import { IMAGE_FIXTURE_PATH, NOT_IMAGE_FIXTURE_PATH } from '../../support/test-data';

test.describe('Módulo: Análise de Imagem / Predição', () => {
  test('CT-17 - análise de imagem de planta doente — fluxo completo', async ({
    authedPage,
  }) => {
    const analytics = new AnalyticsPage(authedPage);
    await analytics.goto();

    await expect(analytics.analyzeButton).toBeDisabled();
    await analytics.selectImage(IMAGE_FIXTURE_PATH);
    await expect(analytics.selectedFileLabel).toBeVisible();
    await expect(analytics.analyzeButton).toBeEnabled();

    const [response] = await Promise.all([
      authedPage.waitForResponse((r) => r.url().includes('/predict') && r.request().method() === 'POST'),
      analytics.analyze(),
    ]);
    expect(response.status()).toBe(201);

    // O MockPredictService (MOCK_AI=true) sorteia aleatoriamente entre 3 doenças
    // (Tomate/Requeima, Milho/Ferrugem, Soja/Mancha Alvo) — por isso as
    // asserções abaixo checam a ESTRUTURA do resultado, não um cenário específico.
    await expect(analytics.resultCropTitle).toBeVisible();
    await expect(analytics.resultDiagnosisTitle).toBeVisible();
    await expect(analytics.resultCausesTitle).toBeVisible();
    await expect(analytics.resultManagementTitle).toBeVisible();
    await expect(analytics.askQuestionsButton).toBeVisible();

    const body = await response.json();
    expect(body.crop).toBeTruthy();
    expect(body.handling).toBeTruthy();
    expect(body.causes).toBeTruthy();
  });

  test('CT-19 - tentar analisar sem selecionar imagem mantém o botão desabilitado', async ({
    authedPage,
  }) => {
    const analytics = new AnalyticsPage(authedPage);
    await analytics.goto();

    await expect(analytics.analyzeButton).toBeDisabled();
  });

  test('CT-20 - enviar arquivo que não é imagem é rejeitado pelo backend', async ({
    authedPage,
  }) => {
    const analytics = new AnalyticsPage(authedPage);
    await analytics.goto();

    await analytics.selectImage(NOT_IMAGE_FIXTURE_PATH);
    await expect(analytics.analyzeButton).toBeEnabled();

    const [response] = await Promise.all([
      authedPage.waitForResponse((r) => r.url().includes('/predict') && r.request().method() === 'POST'),
      analytics.analyze(),
    ]);

    expect(response.status()).not.toBe(201);
    await expect(analytics.resultCropTitle).not.toBeVisible();
  });

  test('CT-24 - tentar analisar com limite de análises esgotado desabilita o botão', async ({
    authedPage,
    authedUser,
  }) => {
    // Plano FREE (atribuído automaticamente no cadastro) tem imageLimit = 10
    // (ver migration SeedFreePlan). Esgota via API antes de abrir a UI.
    await predictNTimes(authedUser.apiContext, 10);

    const analytics = new AnalyticsPage(authedPage);
    await analytics.goto();

    await expect(analytics.usageCounter).toHaveText('Análises: 10/10');
    await analytics.selectImage(IMAGE_FIXTURE_PATH);
    await expect(analytics.analyzeButton).toBeDisabled();
    await expect(analytics.limitReachedMessage).toBeVisible();
  });

  test.fixme(
    'CT-18 - análise de imagem de planta saudável (bloqueado: fluxo "saudável" desativado no mock)',
    async ({ authedPage }) => {
      // packages/backend/src/modules/core/infra/services/MockPredictService.ts
      // tem `const isHealthy = false;` hardcoded, com o comentário:
      // "Desativado: o fluxo de planta saudável em PredictUseCase salva
      // crop/cropConfidence como null, o que viola a constraint NOT NULL da
      // coluna 'crop' em 'history'. Reative quando esse bug pré-existente
      // for corrigido." Ou seja: com MOCK_AI=true este caminho nunca é
      // exercitado hoje, e sem os serviços reais de IA (Flask/handling, que
      // não fazem parte deste docker-compose de teste) não há como forçar
      // esse cenário pela UI. Assim que o bug for corrigido e o mock puder
      // devolver plantas saudáveis, o corpo abaixo deve funcionar como está.
      const analytics = new AnalyticsPage(authedPage);
      await analytics.goto();
      await analytics.selectAndAnalyze(IMAGE_FIXTURE_PATH);
      await expect(analytics.resultCropTitle).toBeVisible();
      await expect(authedPage.getByText(/saud[aá]vel/i)).toBeVisible();
    },
  );

  test.fixme(
    'CT-21 - enviar imagem sem planta suportada (bloqueado: mock não simula esse cenário)',
    async ({ authedPage }) => {
      // O MockPredictService sempre devolve uma das 3 culturas conhecidas
      // (Tomate/Milho/Soja) com confiança fixa alta — ele ignora completamente
      // o conteúdo da imagem enviada. Não há como, apenas trocando a imagem
      // de entrada, provocar a resposta "nenhuma cultura identificada": isso
      // depende do serviço real de IA (Flask), que não está presente neste
      // ambiente de teste (MOCK_AI=true).
      const analytics = new AnalyticsPage(authedPage);
      await analytics.goto();
      await analytics.selectAndAnalyze(IMAGE_FIXTURE_PATH);
      await expect(
        authedPage.getByText(/n[ãa]o foi poss[íi]vel identificar/i),
      ).toBeVisible();
    },
  );

  test.fixme(
    'CT-22 - enviar imagem corrompida (bloqueado: mock não valida bytes da imagem)',
    async ({ authedPage }) => {
      // MockPredictService.predict() nunca lê o arquivo (getImageBase64 só é
      // chamado depois, para repassar a imagem à fila — e fs.readFile aceita
      // qualquer sequência de bytes sem validar se é um JPEG/PNG válido).
      // Não há, portanto, um caminho determinístico para provocar "arquivo
      // corrompido" nesse ambiente mockado.
      const analytics = new AnalyticsPage(authedPage);
      await analytics.goto();
      await analytics.selectAndAnalyze(IMAGE_FIXTURE_PATH); // trocar por fixture de imagem corrompida
      await expect(authedPage.getByText(/n[ãa]o p[oô]de ser processado/i)).toBeVisible();
    },
  );

  test.fixme(
    'CT-23 - enviar imagem de baixa qualidade (bloqueado: mock sempre retorna confiança alta fixa)',
    async ({ authedPage }) => {
      // MockPredictService sempre devolve predictionConfidence = 0.92 e
      // plantConfidence = 0.96, independente da imagem. O caminho de baixa
      // confiança (testado no backend em Predict.e2e-spec.ts com um
      // FakePredictService customizado) não é alcançável pela UI neste
      // ambiente sem o serviço real de IA.
      const analytics = new AnalyticsPage(authedPage);
      await analytics.goto();
      await analytics.selectAndAnalyze(IMAGE_FIXTURE_PATH);
      await expect(
        authedPage.getByText(/confian[çc]a insuficiente/i),
      ).toBeVisible();
    },
  );

  test.fixme(
    'CT-25 - tentar analisar sem plano ativo (bloqueado: cadastro sempre atribui o plano FREE)',
    async ({ authedPage }) => {
      // CreateUser.usecase.ts sempre busca o plano FREE e atribui
      // `planId: freePlan.value.id` a todo usuário novo — não existe hoje
      // nenhuma rota pública (nem autenticada) que remova o plano de um
      // usuário (PATCH /user/plan exige um planId válido, não aceita null).
      // Não há, portanto, caminho real pelo sistema para chegar num usuário
      // autenticado "sem plano ativo".
      const analytics = new AnalyticsPage(authedPage);
      await analytics.goto();
      await expect(authedPage.getByText(/plano ativo/i)).toBeVisible();
    },
  );
});
