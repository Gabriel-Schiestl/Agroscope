import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ChatPanel {
  readonly page: Page;
  readonly panel: Locator;
  readonly title: Locator;
  readonly connectedBadge: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly limitReachedMessage: Locator;
  readonly usageCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.panel = page.getByRole('dialog');
    this.title = page.getByText('Assistente AgroScope');
    this.connectedBadge = page.getByText('● Conectado');
    this.messageInput = page.getByPlaceholder('Escreva sua dúvida... (Enter para enviar)');
    this.sendButton = this.panel.locator('button:has(svg.lucide-send)');
    this.limitReachedMessage = page.getByText(/Limite de \d+ mensagens atingido/);
    this.usageCounter = page.getByText(/Mensagens: \d+\/\d+/);
  }

  async waitForConnected(): Promise<void> {
    await expect(this.connectedBadge).toBeVisible({ timeout: 15_000 });
  }

  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.messageInput.press('Enter');
  }

  lastAssistantBubbleText(): Locator {
    return this.panel.locator('p.whitespace-pre-wrap').last();
  }
}
