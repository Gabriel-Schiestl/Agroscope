// Entrada web: diferente do nativo, o Skia na web roda sobre CanvasKit (WASM)
// e precisa ser carregado assincronamente antes de qualquer componente Skia
// ser montado. Se `@shopify/react-native-skia`/`victory-native` fossem
// importados de forma estática aqui, o bundle único do expo-router web
// (usado em todas as rotas) avaliaria o módulo Skia com `CanvasKit`
// indefinido logo no carregamento da página — e como esse módulo é montado
// como singleton, carregar o CanvasKit depois não conserta mais nada. Isso
// causava tela branca ao abrir a aba "Estatísticas" (o Canvas tentava usar
// `CanvasKit.XYWHRect` com `CanvasKit` undefined e derrubava a árvore React
// inteira, sem ErrorBoundary pra segurar).
//
// `WithSkiaWeb` resolve isso adiando o `import()` do componente real até
// depois do `LoadSkiaWeb()` terminar, isolando o import do Skia num chunk
// carregado sob demanda em vez de fazer parte do bundle inicial.
import type { ComponentProps } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

import { styles } from '@/styles/analytics.styles';
import type { PeriodChartCard as PeriodChartCardImpl, IncidenceChartCard as IncidenceChartCardImpl } from './analytics-charts-impl';

type PeriodChartCardProps = ComponentProps<typeof PeriodChartCardImpl>;
type IncidenceChartCardProps = ComponentProps<typeof IncidenceChartCardImpl>;

function ChartLoadingFallback() {
    return (
        <View style={[styles.chartArea, { alignItems: 'center', justifyContent: 'center' }]}>
            <ActivityIndicator />
        </View>
    );
}

export function PeriodChartCard(props: PeriodChartCardProps) {
    return (
        <WithSkiaWeb<PeriodChartCardProps>
            getComponent={() =>
                import('./analytics-charts-impl').then((m) => ({ default: m.PeriodChartCard }))
            }
            fallback={<ChartLoadingFallback />}
            componentProps={props}
        />
    );
}

export function IncidenceChartCard(props: IncidenceChartCardProps) {
    return (
        <WithSkiaWeb<IncidenceChartCardProps>
            getComponent={() =>
                import('./analytics-charts-impl').then((m) => ({ default: m.IncidenceChartCard }))
            }
            fallback={<ChartLoadingFallback />}
            componentProps={props}
        />
    );
}
