export interface GeminiContent {
    role: 'user' | 'model';
    text: string;
}

export interface GeminiGenerateRequest {
    systemInstruction?: string;
    contents: GeminiContent[];
    responseSchema?: Record<string, unknown>;
}

export interface GeminiClientService {
    generateContent(request: GeminiGenerateRequest): Promise<string>;
}
