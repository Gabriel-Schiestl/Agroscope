import type { Page, Locator } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly newAnalysisTab: Locator;
  readonly historyTab: Locator;
  readonly statisticsTab: Locator;
  readonly fileInput: Locator;
  readonly selectImageButton: Locator;
  readonly analyzeButton: Locator;
  readonly selectedFileLabel: Locator;
  readonly usageCounter: Locator;
  readonly limitReachedMessage: Locator;
  readonly resultCropTitle: Locator;
  readonly resultDiagnosisTitle: Locator;
  readonly resultCausesTitle: Locator;
  readonly resultManagementTitle: Locator;
  readonly askQuestionsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newAnalysisTab = page.getByRole('tab', { name: 'Nova Análise' });
    this.historyTab = page.getByRole('tab', { name: 'Histórico' });
    this.statisticsTab = page.getByRole('tab', { name: 'Estatísticas' });
    this.fileInput = page.locator('input[type="file"]');
    this.selectImageButton = page.getByRole('button', { name: 'Selecionar Imagem' });
    this.analyzeButton = page.getByRole('button', { name: /Analisar Imagem|Analisando/ });
    this.selectedFileLabel = page.getByText(/Arquivo selecionado:/);
    this.usageCounter = page.getByText(/Análises: \d+\/\d+/);
    this.limitReachedMessage = page.getByText(/Limite de \d+ análises atingido/);
    this.resultCropTitle = page.getByRole('heading', { name: 'Cultura Identificada' });
    this.resultDiagnosisTitle = page.getByRole('heading', { name: 'Diagnóstico' });
    this.resultCausesTitle = page.getByRole('heading', { name: 'Causas' });
    this.resultManagementTitle = page.getByRole('heading', {
      name: 'Recomendações de Manejo',
    });
    this.askQuestionsButton = page.getByRole('button', { name: 'Tirar dúvidas' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/analytics');
  }

  async selectImage(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  async analyze(): Promise<void> {
    await this.analyzeButton.click();
  }

  async selectAndAnalyze(filePath: string): Promise<void> {
    await this.selectImage(filePath);
    await this.analyze();
  }
}
