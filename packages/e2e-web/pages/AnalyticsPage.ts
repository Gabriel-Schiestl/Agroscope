import type { Page, Locator } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly newAnalysisTab: Locator;
  readonly historyTab: Locator;
  readonly statisticsTab: Locator;
  readonly fileInput: Locator;
  readonly selectImageButton: Locator;
  readonly cropSelectTrigger: Locator;
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
    this.cropSelectTrigger = page.locator('#crop-select');
    this.analyzeButton = page.getByRole('button', { name: /Analisar Imagem|Analisando/ });
    this.selectedFileLabel = page.getByText(/Arquivo selecionado:/);
    this.usageCounter = page.getByText(/Análises: \d+\/\d+/);
    this.limitReachedMessage = page.getByText(/Limite de \d+ análises atingido/);
    // DiagnosisResult (components/diagnosis-result.tsx): o <h2> do
    // diagnóstico não é único na página (o logotipo "AgroScope" no
    // header/sidebar também é um <h2>), por isso usa data-testid; cultura
    // virou texto simples ao lado dele, e causas/manejo são seções com
    // <h3> de rótulo amigável em vez dos títulos antigos.
    this.resultCropTitle = page.getByTestId('diagnosis-crop');
    this.resultDiagnosisTitle = page.getByTestId('diagnosis-headline');
    this.resultCausesTitle = page.getByRole('heading', {
      name: 'Por que a IA acredita nisso',
    });
    this.resultManagementTitle = page.getByRole('heading', {
      name: 'O que fazer agora',
    });
    this.askQuestionsButton = page.getByRole('button', { name: 'Perguntar à Íris' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/analytics');
  }

  async selectImage(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  /** Cultura exibida na lista (rótulo em PT-BR), ex.: 'Soja', 'Trigo', 'Tomate'. */
  async selectCrop(cropLabel: string): Promise<void> {
    await this.cropSelectTrigger.click();
    await this.page.getByRole('option', { name: cropLabel }).click();
  }

  async analyze(): Promise<void> {
    await this.analyzeButton.click();
  }

  async selectAndAnalyze(filePath: string, cropLabel = 'Soja'): Promise<void> {
    await this.selectCrop(cropLabel);
    await this.selectImage(filePath);
    await this.analyze();
  }
}
