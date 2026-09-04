import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './env';

/**
 * Envia mensagens de chat diretamente via Socket.IO (fora do browser), usada
 * apenas para ARRANJAR estado (ex.: esgotar o limite de chat do plano antes
 * de abrir a UI no CT-34). O envio "sob teste" em si (CT-31/CT-32/CT-33)
 * sempre acontece pela UI real, com Playwright, não por aqui.
 *
 * `token` é o valor bruto do cookie "agroscope-authentication" (ver
 * api-client.extractSessionToken) — o gateway do backend aceita esse valor
 * tanto via cookie quanto via `handshake.auth.token`.
 */
export async function seedChatMessages(
  token: string,
  sessionId: string,
  count: number,
): Promise<void> {
  const socket: Socket = io(`${BASE_URL}/chat`, {
    path: '/api/socket.io',
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });

  try {
    await waitForConnect(socket);

    for (let i = 0; i < count; i++) {
      const response = await emitWithTimeout(
        socket,
        'send_message',
        { content: `Mensagem de setup #${i + 1}`, sessionId },
        20_000,
      );
      if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(
          `[chat-socket] send_message #${i + 1} retornou erro: ${(response as any).error}`,
        );
      }
    }
  } finally {
    socket.disconnect();
  }
}

function waitForConnect(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('[chat-socket] timeout conectando ao gateway /chat')),
      15_000,
    );
    socket.once('connect', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function emitWithTimeout(
  socket: Socket,
  event: string,
  data: unknown,
  timeoutMs: number,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[chat-socket] timeout aguardando ack de "${event}"`)),
      timeoutMs,
    );
    socket.emit(event, data, (response: unknown) => {
      clearTimeout(timer);
      resolve(response);
    });
  });
}
