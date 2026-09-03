import { Pool } from 'pg';
import { DATABASE_URL } from './env';

/**
 * Acesso direto ao Postgres — usado EXCLUSIVAMENTE para os cenários de
 * recuperação de senha (CT-08/CT-09/CT-10).
 *
 * Por que isso existe: o código de recuperação de 6 dígitos é enviado por
 * e-mail (fila RabbitMQ "email-service"), e este ambiente de teste não tem
 * um mail-catcher configurado. Não há nenhuma interface pública do sistema
 * que devolva esse código — de propósito, para não vazar se um e-mail existe
 * ou não (ver PasswordRecovery.ts no frontend). Os próprios testes e2e do
 * backend (packages/backend/test) resolvem isso lendo o repositório
 * diretamente, dentro do processo Jest; aqui replicamos a mesma ideia lendo
 * a tabela "authentication" direto do Postgres, já que os testes rodam fora
 * do processo do backend.
 *
 * Todo o resto da suíte é 100% caixa-preta (só HTTP/UI) — este arquivo é a
 * única exceção deliberada.
 */

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL });
  }
  return pool;
}

export async function getRecoveryCode(email: string): Promise<string | null> {
  const { rows } = await getPool().query(
    'SELECT "recoveryCode" FROM "authentication" WHERE "email" = $1',
    [email],
  );
  return rows[0]?.recoveryCode ?? null;
}

/** Move a expiração do código de recuperação para o passado, simulando os "mais de 5 minutos" do CT-09. */
export async function expireRecoveryCode(email: string): Promise<void> {
  await getPool().query(
    `UPDATE "authentication"
     SET "recoveryCodeExpiration" = NOW() - INTERVAL '1 minute'
     WHERE "email" = $1`,
    [email],
  );
}

export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
