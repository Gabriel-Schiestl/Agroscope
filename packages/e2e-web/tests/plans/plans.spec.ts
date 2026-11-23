import { test, expect } from '../../fixtures';
import { PlansPage } from '../../pages/PlansPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { predictNTimes } from '../../support/api-client';

test.describe('Módulo: Planos', () => {
  test('CT-35 - visualizar informações do plano e limites de uso', async ({
    authedPage,
    authedUser,
  }) => {
    await predictNTimes(authedUser.apiContext, 1);

    const analytics = new AnalyticsPage(authedPage);
    await analytics.goto();
    await expect(analytics.usageCounter).toHaveText('Análises: 1/1');

    const plansPage = new PlansPage(authedPage);
    await plansPage.goto();

    // Plano atual (FREE, atribuído automaticamente no cadastro) exibido com
    // seus limites e o badge "Em uso".
    await expect(plansPage.planHeading('FREE')).toBeVisible();
    await expect(plansPage.inUseBadge).toBeVisible();
    const free = plansPage.limitsText(1, 0);
    await expect(free.images).toBeVisible();
    await expect(free.chat).toBeVisible();

    const pro = plansPage.limitsText(10, 10);
    await expect(pro.images).toBeVisible();
    await expect(pro.chat).toBeVisible();
    await expect(plansPage.planHeading('PREMIUM')).toHaveCount(0);
  });
});
