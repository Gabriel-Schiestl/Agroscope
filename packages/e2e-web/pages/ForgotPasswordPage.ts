import type { Page, Locator } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.submitButton = page.getByRole('button', { name: /Enviar código|Enviando/ });
    // Next.js injeta seu próprio elemento com role="alert" (route announcer,
    // sempre vazio) para acessibilidade de navegação — filtra por texto para
    // pegar só o alerta de erro real do formulário.
    this.errorAlert = page.getByRole('alert').filter({ hasText: /\S/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/forgot-password');
  }

  async requestRecovery(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
