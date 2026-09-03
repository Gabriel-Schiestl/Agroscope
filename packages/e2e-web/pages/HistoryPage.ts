import type { Page, Locator } from '@playwright/test';

export class HistoryPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly cropFilterTrigger: Locator;
  readonly sortTrigger: Locator;
  readonly clearFiltersButton: Locator;
  readonly resultsSummary: Locator;
  readonly emptyStateMessage: Locator;
  readonly items: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Buscar por cultura ou diagnóstico...');
    this.cropFilterTrigger = page.getByRole('combobox').first();
    this.sortTrigger = page.getByRole('combobox').last();
    this.clearFiltersButton = page.getByRole('button', { name: 'Limpar' });
    this.resultsSummary = page.getByText(/Mostrando \d+ de \d+ análises/);
    this.emptyStateMessage = page.getByText(/Nenhuma análise/);
    // Cada item da lista tem um botão "Ver detalhes" — usamos isso para contar/iterar itens.
    this.items = page.locator('div.divide-y > div');
  }

  async goto(): Promise<void> {
    await this.page.goto('/history');
  }

  async filterByCrop(crop: string): Promise<void> {
    await this.cropFilterTrigger.click();
    await this.page.getByRole('option', { name: crop, exact: true }).click();
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  itemByIndex(index: number): Locator {
    return this.items.nth(index);
  }

  viewDetailsButtonForItem(item: Locator): Locator {
    return item.getByRole('button', { name: 'Ver detalhes' });
  }

  chatButtonForItem(item: Locator): Locator {
    return item.getByRole('button', { name: 'Chat' });
  }
}
