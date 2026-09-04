import type { Page, Locator } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly acceptedTermsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.acceptedTermsCheckbox = page.locator('#acceptedTerms');
    this.submitButton = page.getByRole('button', { name: 'Criar Conta' });
    // Next.js injeta seu próprio elemento com role="alert" (route announcer,
    // sempre vazio) para acessibilidade de navegação — filtra por texto para
    // pegar só o alerta de erro real do formulário.
    this.errorAlert = page.getByRole('alert').filter({ hasText: /\S/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/signup');
  }

  async fill(params: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<void> {
    if (params.name !== undefined) await this.nameInput.fill(params.name);
    if (params.email !== undefined) await this.emailInput.fill(params.email);
    if (params.password !== undefined) await this.passwordInput.fill(params.password);
    if (params.confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(params.confirmPassword);
    }
  }

  async acceptTerms(): Promise<void> {
    await this.acceptedTermsCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async signup(params: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.fill({
      name: params.name,
      email: params.email,
      password: params.password,
      confirmPassword: params.confirmPassword ?? params.password,
    });
    await this.acceptTerms();
    await this.submit();
  }
}
