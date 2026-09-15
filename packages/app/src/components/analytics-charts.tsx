// Entrada nativa (iOS/Android): o Skia nativo já está pronto no processo,
// então os componentes podem ser importados e renderizados diretamente.
// A contraparte `.web.tsx` adia esse import até o CanvasKit (WASM) carregar
// — ver aquele arquivo para o motivo.
export { PeriodChartCard, IncidenceChartCard } from './analytics-charts-impl';
