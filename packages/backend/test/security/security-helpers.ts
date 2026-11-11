import { INestApplication } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Response } from 'supertest';
import { History, CreateHistoryProps } from 'src/modules/core/domain/models/History';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';
import { User } from 'src/modules/core/domain/models/User';
import { seedPlan, seedUserWithAuthentication } from '../setup/seed';
import { loginAndGetCookie } from '../setup/auth-helper';

export const AUTH_COOKIE = 'agroscope-authentication';

export const STRONG_PASSWORD = 'Str0ng@Passw0rd!';

export interface SeededActor {
    user: User;
    email: string;
    cookie: string;
}

/**
 * Cria dois usuários com o mesmo plano: a "vítima" (dona dos recursos) e o
 * "atacante" (usuário legítimo, autenticado, que tenta acessar o que não é dele).
 */
export async function seedVictimAndAttacker(
    app: INestApplication,
    prefix: string,
): Promise<{ victim: SeededActor; attacker: SeededActor; planId: string }> {
    const plan = await seedPlan(app, {
        type: `${prefix}-free`,
        chatLimit: 50,
        featureFlags: ['FULL_HISTORY'],
    });

    const victimEmail = `${prefix}.victim@agroscope.test`;
    const attackerEmail = `${prefix}.attacker@agroscope.test`;

    const { user: victimUser } = await seedUserWithAuthentication(app, {
        name: 'Vitima Original',
        email: victimEmail,
        password: STRONG_PASSWORD,
        planId: plan.id,
    });
    const { user: attackerUser } = await seedUserWithAuthentication(app, {
        name: 'Atacante Malicioso',
        email: attackerEmail,
        password: STRONG_PASSWORD,
        planId: plan.id,
    });

    return {
        planId: plan.id,
        victim: {
            user: victimUser,
            email: victimEmail,
            cookie: await loginAndGetCookie(app, victimEmail, STRONG_PASSWORD),
        },
        attacker: {
            user: attackerUser,
            email: attackerEmail,
            cookie: await loginAndGetCookie(app, attackerEmail, STRONG_PASSWORD),
        },
    };
}

export async function seedHistory(
    app: INestApplication,
    userId: string,
    overrides: Partial<CreateHistoryProps> = {},
): Promise<History> {
    const historyRepository = app.get<HistoryRepository>('HistoryRepository');

    const history = History.create({
        crop: 'Soja',
        cropConfidence: 0.95,
        image: 'soja.jpg',
        causes: 'Causa confidencial da vitima',
        handling: 'Manejo confidencial da vitima',
        explanation: 'Explicacao confidencial da vitima',
        userId,
        ...overrides,
    });

    const saved = await historyRepository.save(history);
    if (saved.isFailure()) throw saved.error;

    return history;
}

/** Retorna o header Set-Cookie completo (com flags) do cookie informado. */
export function findSetCookie(
    response: Response,
    name: string = AUTH_COOKIE,
): string | undefined {
    const cookies =
        (response.headers['set-cookie'] as unknown as string[] | undefined) ??
        [];
    return cookies.find((cookie) => cookie.startsWith(`${name}=`));
}

/** Valor bruto (URL-decoded) do cookie de sessão. */
export function cookieValue(setCookie: string): string {
    const raw = setCookie.split(';')[0].slice(`${AUTH_COOKIE}=`.length);
    return decodeURIComponent(raw);
}

/** Mesma criptografia do AESServiceImpl (aes-256-cbc, formato "iv:ciphertext" em base64). */
export function aesEncrypt(plainText: string, hexKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(hexKey, 'hex'),
        iv,
    );
    const encrypted =
        cipher.update(plainText, 'utf8', 'base64') + cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
}

export function aesDecrypt(data: string, hexKey: string): string {
    const [ivBase64, encrypted] = data.split(':');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(hexKey, 'hex'),
        Buffer.from(ivBase64, 'base64'),
    );
    return decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8');
}

/**
 * Monta um cookie de sessão "forjado": JWT assinado com `jwtSecret` e
 * criptografado com `aesKey`. Usado para provar que o backend só aceita
 * sessões assinadas com o segredo real do servidor.
 */
export function forgeSessionCookie(
    payload: Record<string, unknown>,
    options: { jwtSecret: string; aesKey: string; expiresIn?: string | number },
): string {
    const token = jwt.sign(payload, options.jwtSecret, {
        expiresIn: (options.expiresIn ?? '1h') as jwt.SignOptions['expiresIn'],
    });
    return `${AUTH_COOKIE}=${encodeURIComponent(aesEncrypt(token, options.aesKey))}`;
}
