import { test, expect } from '../../fixtures';
import { PlansPage } from '../../pages/PlansPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { predictNTimes } from '../../support/api-client';

test.describe('Módulo: Planos', () => {
  test('CT-35 - visualizar informações do plano e limites de uso', async ({
    authedPage,
    authedUser,
  }) => {
    // Consome parte do limite para que os contadores de uso (só visíveis na
    // página de Análises, não em /plans — ver hooks/use-limit.ts) mostrem
    // algo além de "0/N".
    await predictNTimes(authedUser.apiContext, 2);

    const analytics = new AnalyticsPage(authedPage);
    await analytics.goto();
    await expect(analytics.usageCounter).toHaveText('Análises: 2/10');

    const plansPage = new PlansPage(authedPage);
    await plansPage.goto();

    // Plano atual (FREE, atribuído automaticamente no cadastro) exibido com
    // seus limites e o badge "Em uso".
    await expect(plansPage.planHeading('FREE')).toBeVisible();
    await expect(plansPage.inUseBadge).toBeVisible();
    const limits = plansPage.limitsText(10, 50);
    await expect(limits.images).toBeVisible();
    await expect(limits.chat).toBeVisible();
  });
});
