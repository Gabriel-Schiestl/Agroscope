import { test, expect, request as pwRequest } from '@playwright/test';
import { SignupPage } from '../../pages/SignupPage';
import { LoginPage } from '../../pages/LoginPage';
import { uniqueEmail, uniqueName, VALID_PASSWORD } from '../../support/test-data';
import { signup as apiSignup, loginOrThrow, waitForAuthenticationReady } from '../../support/api-client';
import { BASE_URL, API_PREFIX } from '../../support/env';

// ─────────────────────────────────────────────────────────────────────────────
// Testes E2E de Segurança — XSS (Cross-Site Scripting)
//
// Valida, com browser real (Chromium headless), que:
//   1. Payloads XSS inseridos via formulário de cadastro NÃO são executados
//      no navegador (window.__xss_triggered nunca fica true, dialogs nunca abrem).
//   2. O nome do usuário exibido na interface é texto escapado, nunca HTML renderizado.
//   3. Payloads XSS no campo de login não causam execução de script.
//   4. A API retorna os cabeçalhos de proteção corretos (CSP, X-Content-Type-Options).
//
// Por que e2e e não só integração?
//   O teste de integração (Supertest) valida que a API não reflete tags brutas
//   no JSON. Mas o XSS Stored/Reflected só se concretiza no browser: é o motor
//   de renderização que interpreta o HTML e executa scripts. Apenas um teste com
//   browser real pode confirmar que o frontend sanitiza a string antes de injetar
//   no DOM — framework como React faz isso por padrão via JSX, mas o teste
//   comprova que nenhum dangerouslySetInnerHTML ou innerHTML foi usado.
// ─────────────────────────────────────────────────────────────────────────────

const XSS_PAYLOADS = [
  '<script>window.__xss_triggered=true</script>',
  '<img src=x onerror="window.__xss_triggered=true">',
  '<svg onload="window.__xss_triggered=true">',
  '"><script>window.__xss_triggered=true</script>',
];

test.describe('Segurança — XSS via formulário de cadastro (browser real)', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Script armazenado no nome não executa no browser após login
  // ─────────────────────────────────────────────────────────────────────────
  test('XSS Stored — payload no campo nome não executa script após login', async ({ page }) => {
    const xssName = '<script>window.__xss_triggered=true</script>';
    const email = uniqueEmail('xss-stored');

    // Monitora qualquer dialog (alert/confirm/prompt) — se abrir, o XSS funcionou
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.fill({ name: xssName, email, password: VALID_PASSWORD });
    await signupPage.acceptTerms();
    await signupPage.submit();

    // Aguarda a credencial ser criada de forma assíncrona
    await page.waitForTimeout(2000);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, VALID_PASSWORD);
    await page.waitForTimeout(2000);

    // O script NÃO deve ter sido executado
    expect(dialogTriggered).toBe(false);

    const xssTriggered = await page.evaluate(() => (window as any).__xss_triggered);
    expect(xssTriggered).toBeFalsy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Múltiplos payloads — nenhum executa script no browser
  // ─────────────────────────────────────────────────────────────────────────
  for (const payload of XSS_PAYLOADS) {
    test(`XSS Stored — "${payload.slice(0, 45)}..." não executa no browser`, async ({ page }) => {
      const email = uniqueEmail('xss-multi');

      let dialogTriggered = false;
      page.on('dialog', async (dialog) => {
        dialogTriggered = true;
        await dialog.dismiss();
      });

      const signupPage = new SignupPage(page);
      await signupPage.goto();
      await signupPage.fill({ name: payload, email, password: VALID_PASSWORD });
      await signupPage.acceptTerms();
      await signupPage.submit();

      await page.waitForTimeout(2000);

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(email, VALID_PASSWORD);
      await page.waitForTimeout(1500);

      expect(dialogTriggered).toBe(false);

      const xssTriggered = await page.evaluate(() => (window as any).__xss_triggered);
      expect(xssTriggered).toBeFalsy();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Payload XSS no campo e-mail do login não executa script
  // ─────────────────────────────────────────────────────────────────────────
  test('XSS Reflected — payload no e-mail do login não executa script', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Tenta fazer login com e-mail sendo um payload XSS
    await loginPage.login('<script>window.__xss_triggered=true</script>', 'qualquercoisa');
    await page.waitForTimeout(1500);

    expect(dialogTriggered).toBe(false);

    const xssTriggered = await page.evaluate(() => (window as any).__xss_triggered);
    expect(xssTriggered).toBeFalsy();

    // Deve permanecer na página de login (não houve redirecionamento)
    await expect(page).toHaveURL(/\/login/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Nome com payload XSS é exibido como texto puro no DOM, nunca como HTML
  // ─────────────────────────────────────────────────────────────────────────
  test('XSS Stored — nome com payload é texto puro no DOM, não HTML renderizado', async ({ page }) => {
    const xssName = '<b>Hacker</b><script>alert(1)</script>';
    const email = uniqueEmail('xss-display');
    const apiCtx = await pwRequest.newContext({ baseURL: BASE_URL });

    // Cadastra via API para bypassar validações de frontend e forçar o dado no banco
    await apiSignup(apiCtx, { name: xssName, email, password: VALID_PASSWORD });
    await apiCtx.dispose();

    await page.waitForTimeout(2000);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, VALID_PASSWORD);
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      // Verifica que <script> não está executável no DOM
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);
      expect(bodyHTML).not.toContain('<script>alert(1)</script>');

      // React/Next.js escapa strings — <b>Hacker</b> NÃO deve criar elemento <b>
      const boldElements = await page.locator('b').filter({ hasText: 'Hacker' }).count();
      expect(boldElements).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cabeçalhos HTTP de proteção contra XSS e Clickjacking
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Segurança — Cabeçalhos HTTP de proteção (XSS / Clickjacking)', () => {

  test('API retorna X-Content-Type-Options: nosniff', async ({ page }) => {
    const response = await page.request.post(`${BASE_URL}${API_PREFIX}/auth/login`, {
      data: { email: 'test@test.com', password: 'wrong' },
    });
    const header = response.headers()['x-content-type-options'];
    expect(header).toBe('nosniff');
  });

  test('API retorna proteção contra clickjacking (X-Frame-Options ou CSP frame-ancestors)', async ({ page }) => {
    const response = await page.request.post(`${BASE_URL}${API_PREFIX}/auth/login`, {
      data: { email: 'test@test.com', password: 'wrong' },
    });
    const headers = response.headers();
    const hasXFrame = headers['x-frame-options'] !== undefined;
    const csp = headers['content-security-policy'] ?? '';
    const hasCspFrame = csp.includes('frame-ancestors') || csp.includes('frame');
    expect(hasXFrame || hasCspFrame).toBe(true);
  });

  test('API retorna Content-Type application/json, nunca text/html', async ({ page }) => {
    const response = await page.request.post(`${BASE_URL}${API_PREFIX}/auth/login`, {
      data: { email: 'test@test.com', password: 'wrong' },
    });
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');
    expect(contentType).not.toContain('text/html');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IDOR via navegação direta no browser
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Segurança — IDOR via navegação direta no browser', () => {

  test('IDOR — navegar para /history/:id de outro usuário não expõe dados na UI', async ({ browser }) => {
    // Usuário A
    const emailA = uniqueEmail('idor-a');
    const ctxApiA = await pwRequest.newContext({ baseURL: BASE_URL });
    await apiSignup(ctxApiA, { name: uniqueName('Usuário A'), email: emailA, password: VALID_PASSWORD });
    await loginOrThrow(ctxApiA, emailA, VALID_PASSWORD);

    // Tenta obter um history ID do usuário A
    const historyRes = await ctxApiA.get(`${API_PREFIX}/history`);
    const history: any[] = historyRes.ok() ? await historyRes.json() : [];
    const targetId = history.length > 0
      ? history[0].id
      : '00000000-0000-0000-0000-000000000001';

    const storageStateA = await ctxApiA.storageState();
    await ctxApiA.dispose();

    // Usuário B tenta acessar /history/:id do usuário A
    const emailB = uniqueEmail('idor-b');
    const ctxApiB = await pwRequest.newContext({ baseURL: BASE_URL });
    await apiSignup(ctxApiB, { name: uniqueName('Usuário B'), email: emailB, password: VALID_PASSWORD });
    await loginOrThrow(ctxApiB, emailB, VALID_PASSWORD);
    const storageStateB = await ctxApiB.storageState();
    await ctxApiB.dispose();

    const ctxB = await browser.newContext({ storageState: storageStateB });
    const pageB = await ctxB.newPage();

    // Navega diretamente para o histórico do usuário A
    await pageB.goto(`/history/${targetId}`);
    await pageB.waitForTimeout(2000);

    const url = pageB.url();
    const bodyText = await pageB.locator('body').innerText().catch(() => '');

    // Ou redireciona pro login, ou mostra página de erro — nunca dados alheios
    const isRedirectLogin = url.includes('/login');
    const isErrorPage =
      bodyText.includes('404') ||
      bodyText.toLowerCase().includes('não encontrad') ||
      bodyText.toLowerCase().includes('acesso negado') ||
      bodyText.toLowerCase().includes('não autorizado');

    expect(isRedirectLogin || isErrorPage).toBe(true);

    await ctxB.close();
  });
});
