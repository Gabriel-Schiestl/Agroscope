import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { HeaderPage } from '../../pages/HeaderPage';
import { login as apiLogin } from '../../support/api-client';

test.describe('Módulo: Autenticação — Login', () => {
  test('CT-01 - login com credenciais válidas', async ({ page, newUser }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(newUser.email, newUser.password);

    await expect(page).toHaveURL(/\/analytics/);
  });

  test('CT-02 - login com e-mail em branco e senha preenchida é bloqueado pelo navegador', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.passwordInput.fill('Senha@123');
    await loginPage.submitEmpty();

    // Campo "required" do HTML5 impede o submit; a página não navega.
    await expect(page).toHaveURL(/\/login/);
    const validity = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(validity).toBe(false);
  });

  test('CT-03 - login com senha em branco é bloqueado pelo navegador', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.emailInput.fill('usuario@email.com');
    await loginPage.submitEmpty();

    await expect(page).toHaveURL(/\/login/);
    const validity = await loginPage.passwordInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(validity).toBe(false);
  });

  test('CT-04 - login com senha incorreta exibe erro genérico', async ({ page, newUser }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(newUser.email, 'senhaErrada123!');

    await expect(loginPage.errorAlert).toContainText(
      'Email ou senha inválidos. Tente novamente.',
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test('CT-05 - login com e-mail não cadastrado exibe a mesma mensagem genérica', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('inexistente.e2e@agroscope.e2e', 'QualquerSenha@123');

    await expect(loginPage.errorAlert).toContainText(
      'Email ou senha inválidos. Tente novamente.',
    );
  });

  test('CT-06 - bloqueio de conta após 5 tentativas incorretas', async ({
    page,
    newUser,
    apiContext,
  }) => {
    // 4 tentativas incorretas "já realizadas" (pré-condição do CT-06) + a 5ª,
    // feitas via API para não repetir manualmente 5 submits de formulário.
    for (let i = 0; i < 5; i++) {
      const response = await apiLogin(apiContext, newUser.email, 'senhaErrada');
      expect(response.status()).toBe(401);
    }

    // A conta agora está bloqueada — mesmo a senha correta deve ser recusada,
    // e essa tentativa final é feita pela UI real.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);

    await expect(loginPage.errorAlert).toContainText(
      'Sua conta foi bloqueada por excesso de tentativas incorretas',
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test('CT-11 - acesso a rota protegida sem autenticação redireciona para o login', async ({
    page,
  }) => {
    await page.goto('/analytics');

    await expect(page).toHaveURL(/\/login/);
  });

  test('CT-12 - logout encerra a sessão e impede acesso sem nova autenticação', async ({
    authedPage,
  }) => {
    await authedPage.goto('/analytics');
    await expect(authedPage).toHaveURL(/\/analytics/);

    const header = new HeaderPage(authedPage);
    await header.logout();

    await expect(authedPage).toHaveURL('http://localhost/');

    await authedPage.goto('/analytics');
    await expect(authedPage).toHaveURL(/\/login/);
  });
});
