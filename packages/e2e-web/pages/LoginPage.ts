import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: 'Entrar', exact: true });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Esqueceu a senha?' });
    this.signupLink = page.getByRole('link', { name: 'Cadastre-se' });
    // Next.js injeta seu próprio elemento com role="alert" (route announcer,
    // sempre vazio) para acessibilidade de navegação — filtra por texto para
    // pegar só o alerta de erro real do formulário.
    this.errorAlert = page.getByRole('alert').filter({ hasText: /\S/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async submitEmpty(): Promise<void> {
    await this.submitButton.click();
  }
}
