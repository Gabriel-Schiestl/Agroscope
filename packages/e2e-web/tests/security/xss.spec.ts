import { test, expect, request as pwRequest, type Page } from '@playwright/test';
import { SignupPage } from '../../pages/SignupPage';
import { LoginPage } from '../../pages/LoginPage';
import { formatPersonName, uniqueEmail, VALID_PASSWORD } from '../../support/test-data';
import { signup as apiSignup, waitForAuthenticationReady } from '../../support/api-client';
import { BASE_URL, API_PREFIX } from '../../support/env';

// ─────────────────────────────────────────────────────────────────────────────
// Testes E2E de Segurança — XSS (Cross-Site Scripting) com browser real
//
// O teste de integração (backend/test/security/Injection.e2e-spec.ts) prova
// que a API guarda o payload como texto e não o reflete em erros. Mas o XSS só
// se concretiza no browser: é o motor de renderização que interpreta HTML e
// executa scripts. Aqui confirmamos, no Chromium, que:
//   1. Payloads gravados no nome (XSS Stored) aparecem como TEXTO literal no
//      header e nenhum script/handler executa (flag global + dialogs).
//   2. Payloads digitados no login (XSS Reflected) não executam.
//   3. A API devolve os cabeçalhos de proteção (nosniff, anti-clickjacking, CSP).
// ─────────────────────────────────────────────────────────────────────────────

// Cada payload tenta setar window.__xss_triggered — se a flag mudar, executou.
const XSS_PAYLOADS = [
  '<script>window.__xss_triggered=true</script>',
  '<img src=x onerror="window.__xss_triggered=true">',
  '<svg onload="window.__xss_triggered=true">',
  '"><script>window.__xss_triggered=true</script>',
  '<iframe srcdoc="<script>parent.__xss_triggered=true</script>">',
  '<a href="javascript:window.__xss_triggered=true">clique</a>',
  '<details open ontoggle="window.__xss_triggered=true">',
];

/** Instala os "detectores" de XSS antes de qualquer script da página rodar. */
async function armXssDetectors(page: Page): Promise<{ dialogs: string[] }> {
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.addInitScript(() => {
    (window as any).__xss_triggered = false;
  });
  return { dialogs };
}

async function xssTriggered(page: Page): Promise<boolean> {
  return page.evaluate(() => Boolean((window as any).__xss_triggered));
}

async function loginThroughUi(page: Page, email: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, VALID_PASSWORD);
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

test.describe('Segurança — XSS Stored no nome do usuário (browser real)', () => {
  for (const payload of XSS_PAYLOADS) {
    test(`payload ${JSON.stringify(payload.slice(0, 40))} é exibido como texto e não executa`, async ({ page }) => {
      const { dialogs } = await armXssDetectors(page);
      const email = uniqueEmail('xss-stored');

      // Cadastra via API: pula qualquer validação do formulário e força o
      // payload a ir parar no banco, como faria um atacante.
      const api = await pwRequest.newContext({ baseURL: BASE_URL });
      await apiSignup(api, { name: payload, email, password: VALID_PASSWORD });
      await api.dispose();
      await waitForAuthenticationReady(email, VALID_PASSWORD);

      await loginThroughUi(page, email);

      // O nome aparece no header como texto literal — prova que o React
      // escapou a string em vez de interpretá-la como HTML.
      await expect(
        page.locator('header').getByText(formatPersonName(payload), { exact: true }),
      ).toBeVisible();

      expect(await xssTriggered(page)).toBe(false);
      expect(dialogs).toEqual([]);
    });
  }

  test('payload enviado pelo formulário de cadastro também não executa', async ({ page }) => {
    const { dialogs } = await armXssDetectors(page);
    const payload = XSS_PAYLOADS[1];
    const email = uniqueEmail('xss-form');

    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup({ name: payload, email, password: VALID_PASSWORD });
    await waitForAuthenticationReady(email, VALID_PASSWORD);

    await loginThroughUi(page, email);

    expect(await xssTriggered(page)).toBe(false);
    expect(dialogs).toEqual([]);
  });

  test('o payload não vira elemento no DOM (nenhuma <img>/<script>/<b> injetada)', async ({ page }) => {
    await armXssDetectors(page);
    const payload = '<b id="xss-b">Hacker</b><img id="xss-img" src=x><script id="xss-script"></script>';
    const email = uniqueEmail('xss-dom');

    const api = await pwRequest.newContext({ baseURL: BASE_URL });
    await apiSignup(api, { name: payload, email, password: VALID_PASSWORD });
    await api.dispose();
    await waitForAuthenticationReady(email, VALID_PASSWORD);

    await loginThroughUi(page, email);
      await expect(
        page.locator('header').getByText(formatPersonName(payload), { exact: true }),
      ).toBeVisible();

    await expect(page.locator('#xss-b')).toHaveCount(0);
    await expect(page.locator('#xss-img')).toHaveCount(0);
    await expect(page.locator('#xss-script')).toHaveCount(0);
  });
});

test.describe('Segurança — XSS Reflected no login (browser real)', () => {
  for (const payload of XSS_PAYLOADS.slice(0, 3)) {
    test(`payload ${JSON.stringify(payload.slice(0, 40))} no e-mail não executa e mantém o usuário no login`, async ({ page }) => {
      const { dialogs } = await armXssDetectors(page);

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.emailInput.fill(payload);
      await loginPage.passwordInput.fill('qualquerCoisa@1');
      await loginPage.submitButton.click();
      // Dá tempo para a resposta da API (ou a validação do form) ser renderizada.
      await page.waitForLoadState('networkidle');

      expect(await xssTriggered(page)).toBe(false);
      expect(dialogs).toEqual([]);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe('Segurança — Cabeçalhos HTTP de proteção (XSS / Clickjacking)', () => {
  async function apiErrorResponse(page: Page) {
    return page.request.post(`${BASE_URL}${API_PREFIX}/auth/login`, {
      data: { email: 'test@test.com', password: 'wrong' },
    });
  }

  test('API retorna X-Content-Type-Options: nosniff', async ({ page }) => {
    const response = await apiErrorResponse(page);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('API proíbe ser carregada em iframe (X-Frame-Options: DENY)', async ({ page }) => {
    const response = await apiErrorResponse(page);
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('API envia Content-Security-Policy restritiva', async ({ page }) => {
    const csp = (await apiErrorResponse(page)).headers()['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
  });

  test('API não expõe a tecnologia do servidor (sem X-Powered-By)', async ({ page }) => {
    const response = await apiErrorResponse(page);
    expect(response.headers()['x-powered-by']).toBeUndefined();
  });

  test('API responde application/json, nunca text/html', async ({ page }) => {
    const contentType = (await apiErrorResponse(page)).headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');
    expect(contentType).not.toContain('text/html');
  });

  test('cookie de sessão é HttpOnly: document.cookie não enxerga o token', async ({ page }) => {
    const email = uniqueEmail('xss-cookie');
    const api = await pwRequest.newContext({ baseURL: BASE_URL });
    await apiSignup(api, { name: 'Cookie Test', email, password: VALID_PASSWORD });
    await api.dispose();
    await waitForAuthenticationReady(email, VALID_PASSWORD);

    await loginThroughUi(page, email);

    // Mesmo que um XSS executasse, ele não conseguiria ler a sessão.
    const visibleToJs = await page.evaluate(() => document.cookie);
    expect(visibleToJs).not.toContain('agroscope-authentication');
    const cookies = await page.context().cookies();
    const session = cookies.find((c) => c.name === 'agroscope-authentication');
    expect(session?.httpOnly).toBe(true);
  });
});
