import * as path from 'path';

/** Senha usada por padrão para usuários criados nos testes (atende PASSWORD_REGEX do backend). */
export const VALID_PASSWORD = 'Senha@123';
export const OTHER_VALID_PASSWORD = 'NovaSenha@456';

/** Gera um e-mail único por execução para evitar colisão entre specs/execuções. */
export function uniqueEmail(prefix = 'user'): string {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `e2e.${prefix}.${stamp}.${rand}@agroscope.e2e`;
}

export function uniqueName(prefix = 'Usuário Teste'): string {
  return `${prefix} ${Math.random().toString(36).slice(2, 6)}`;
}

export const IMAGE_FIXTURE_PATH = path.resolve(
  __dirname,
  '..',
  'fixtures',
  'images',
  'leaf.jpg',
);
export const NOT_IMAGE_FIXTURE_PATH = path.resolve(
  __dirname,
  '..',
  'fixtures',
  'images',
  'not-an-image.txt',
);
