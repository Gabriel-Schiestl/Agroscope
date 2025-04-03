import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { catchError, firstValueFrom } from 'rxjs';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import {
    PredictService,
    PredictServiceResponse,
} from '../../domain/services/Predict.service';
import FormData = require('form-data');

@Injectable()
export class PredictServiceImpl implements PredictService {
    constructor(private readonly httpService: HttpService) {}

    async predict(
        imagePath: string,
    ): Promise<Result<TechnicalException, PredictServiceResponse>> {
        const formData = new FormData();

        const image = fs.createReadStream(imagePath);

        formData.append('image', image, {
            filename: path.basename(imagePath),
            contentType: 'image/*',
        });

        try {
            const { data } = await firstValueFrom(
                this.httpService
                    .post<PredictServiceResponse>(
                        `${process.env.FLASK_API_URL}/predict`,
                        formData,
                        {
                            headers: {
                                ...formData.getHeaders(),
                            },
                        },
                    )
                    .pipe(
                        catchError((error) => {
                            throw new Error(`Error on predict`);
                        }),
                    ),
            );

            return Res.success(data);
        } catch (e) {
            return Res.failure(new TechnicalException('Error on predict'));
        }
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
}
