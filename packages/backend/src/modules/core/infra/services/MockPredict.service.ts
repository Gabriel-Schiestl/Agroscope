import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import {
    HandlingServiceResponse,
    PredictService,
    PredictServiceResponse,
} from '../../domain/services/Predict.service';

interface MockScenario {
    plant: string;
    prediction: string;
    handling: HandlingServiceResponse;
}

const HEALTHY_PLANTS = ['Tomate', 'Milho', 'Soja'];

const SCENARIOS: MockScenario[] = [
    {
        plant: 'Tomate',
        prediction: 'Requeima',
        handling: {
            diagnostico:
                'Requeima (Phytophthora infestans) identificada nas folhas do tomateiro.',
            explicacao:
                'A requeima é uma doença fúngica que ataca folhas, caules e frutos do tomateiro, provocando manchas encharcadas que evoluem para necrose em poucos dias.',
            causas:
                'Causada pelo oomiceto Phytophthora infestans, favorecida por umidade alta, temperaturas amenas (15-24°C) e chuvas frequentes. Dissemina-se rapidamente por respingos de água e vento.',
            manejo:
                'Remova e destrua as folhas e frutos afetados. Aplique fungicida à base de cobre ou clorotalonil, evite molhar as folhas na irrigação e garanta espaçamento adequado entre as plantas para melhorar a ventilação.',
            precautions:
                'Evite irrigação por aspersão, faça rotação de culturas e monitore a lavoura após períodos chuvosos.',
        },
    },
    {
        plant: 'Milho',
        prediction: 'Ferrugem',
        handling: {
            diagnostico:
                'Ferrugem comum do milho (Puccinia sorghi) identificada nas folhas.',
            explicacao:
                'Doença fúngica que forma pústulas de coloração ferrugem nas duas faces das folhas, reduzindo a área fotossintética da planta.',
            causas:
                'Causada pelo fungo Puccinia sorghi, favorecida por temperaturas amenas (16-23°C), alta umidade relativa e orvalho prolongado nas folhas.',
            manejo:
                'Utilize cultivares resistentes, aplique fungicidas triazóis ou estrobilurinas no início dos sintomas e evite adubação nitrogenada excessiva.',
            precautions:
                'Monitore a lavoura semanalmente durante períodos úmidos e evite plantio muito adensado.',
        },
    },
    {
        plant: 'Soja',
        prediction: 'Mancha Alvo',
        handling: {
            diagnostico:
                'Mancha-alvo (Corynespora cassiicola) identificada nas folhas da soja.',
            explicacao:
                'Doença fúngica que causa lesões circulares com anéis concêntricos, semelhantes a um alvo, levando à desfolha precoce.',
            causas:
                'Causada pelo fungo Corynespora cassiicola, favorecida por alta umidade, chuvas frequentes e temperaturas entre 25-30°C.',
            manejo:
                'Aplique fungicidas específicos assim que os primeiros sintomas forem identificados, realize rotação de culturas e utilize sementes de boa procedência.',
            precautions:
                'Evite o monocultivo contínuo de soja na mesma área e mantenha boa drenagem do solo.',
        },
    },
];

@Injectable()
export class MockPredictService implements PredictService {
    private readonly logger = new Logger(MockPredictService.name);

    async predict(
        imagePath: string,
    ): Promise<Result<TechnicalException, PredictServiceResponse>> {
        await this.simulateDelay();

        // Desativado: o fluxo de planta saudável em PredictUseCase salva crop/cropConfidence
        // como null, o que viola a constraint NOT NULL da coluna "crop" em "history".
        // Reative quando esse bug pré-existente (fora do escopo do mock) for corrigido.
        const isHealthy = false;

        if (isHealthy) {
            const plant =
                HEALTHY_PLANTS[
                    Math.floor(Math.random() * HEALTHY_PLANTS.length)
                ];

            this.logger.debug(`[MOCK] Predição gerada: ${plant} saudavel`);

            return Res.success({
                plant,
                plantConfidence: 0.95,
                prediction: 'planta_saudavel',
                predictionConfidence: 0.97,
            });
        }

        const scenario =
            SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

        this.logger.debug(
            `[MOCK] Predição gerada: ${scenario.plant} / ${scenario.prediction}`,
        );

        return Res.success({
            plant: scenario.plant,
            plantConfidence: 0.96,
            prediction: scenario.prediction,
            predictionConfidence: 0.92,
        });
    }

    async getImageBase64(
        imagePath: string,
    ): Promise<Result<TechnicalException, string>> {
        const imageBase64 = await fs.promises.readFile(imagePath, {
            encoding: 'base64',
        });

        if (!imageBase64) {
            return Res.failure(
                new TechnicalException('Error on get image base64'),
            );
        }

        return Res.success(imageBase64);
    }

    async getHandling(
        prediction: string,
        crop: string,
    ): Promise<Result<TechnicalException, HandlingServiceResponse>> {
        await this.simulateDelay();

        const scenario = SCENARIOS.find(
            (s) => s.prediction.toLowerCase() === prediction.toLowerCase(),
        );

        if (!scenario) {
            return Res.success({
                diagnostico: `${prediction} identificada em ${crop}.`,
                explicacao:
                    'Doença identificada pela análise de imagem (dados mockados).',
                causas:
                    'Causas não catalogadas para este mock — configure um cenário específico em MockPredict.service.ts.',
                manejo:
                    'Consulte um agrônomo para recomendação de manejo específico.',
                precautions: 'Monitore a lavoura regularmente.',
            });
        }

        this.logger.debug(`[MOCK] Manejo retornado para: ${prediction}`);

        return Res.success(scenario.handling);
    }

    private simulateDelay(): Promise<void> {
        const ms = 300 + Math.random() * 500;
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
