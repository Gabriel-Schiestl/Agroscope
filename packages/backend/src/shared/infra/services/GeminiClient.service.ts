import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
    GeminiClientService,
    GeminiGenerateRequest,
} from 'src/shared/domain/services/GeminiClient.service';

@Injectable()
export class GeminiClientServiceImpl implements GeminiClientService {
    private readonly logger = new Logger(GeminiClientServiceImpl.name);
    private readonly client: GoogleGenAI | null;
    private readonly model: string;
    private readonly timeoutMs: number;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
        this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        this.timeoutMs = process.env.GEMINI_TIMEOUT_MS
            ? parseInt(process.env.GEMINI_TIMEOUT_MS, 10)
            : 10000;
    }

    async generateContent({
        systemInstruction,
        contents,
        responseSchema,
    }: GeminiGenerateRequest): Promise<string> {
        if (!this.client) {
            throw new Error('GEMINI_API_KEY não configurado');
        }

        const response = await this.withTimeout(
            this.client.models.generateContent({
                model: this.model,
                contents: contents.map(({ role, text }) => ({
                    role,
                    parts: [{ text }],
                })),
                config: {
                    ...(systemInstruction ? { systemInstruction } : {}),
                    ...(responseSchema
                        ? {
                              responseMimeType: 'application/json',
                              responseSchema,
                          }
                        : {}),
                },
            }),
            this.timeoutMs,
        );

        const text = response.text;
        if (!text) {
            throw new Error('Resposta vazia do Gemini');
        }

        return text;
    }

    private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(
                () => reject(new Error(`Gemini timeout após ${ms}ms`)),
                ms,
            );

            promise.then(
                (value) => {
                    clearTimeout(timer);
                    resolve(value);
                },
                (error) => {
                    clearTimeout(timer);
                    reject(error);
                },
            );
        });
    }
}
