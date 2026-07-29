/**
 * Mock completo para apresentação da pré-banca.
 * Ativado quando NEXT_PUBLIC_MOCK=true.
 *
 * Cenário: Dr. Carlos Agronomia identifica Ferrugem Asiática numa lavoura de soja,
 * analisa via IA e tira dúvidas no chat sobre manejo.
 */

import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ─── Dados de mock ────────────────────────────────────────────────────────────

const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Fazenda São João",
    telephone: "(16) 99123-4567",
    person: "PF",
    document: "123.456.789-00",
    address: {
      street: "Rod. Anhanguera",
      number: "km 310",
      neighborhood: "Zona Rural",
      city: "Ribeirão Preto",
      state: "SP",
      country: "Brasil",
      zipCode: "14000-000",
      latitude: -21.1767,
      longitude: -47.8208,
    },
    totalArea: 1250,
    totalAreaPlanted: 980,
    active: true,
    actualCrop: "SOJA",
    calendarEvents: [
      {
        title: "Visita Técnica – Monitoramento Ferrugem",
        type: "visit",
        status: "COMPLETED",
        date: "2026-05-20T09:00:00.000Z",
        time: "09:00",
        clientId: "1",
        location: "Fazenda São João – Talhão 3",
        description:
          "Monitoramento de Ferrugem Asiática. Confirmado foco no talhão 3.",
      },
      {
        title: "Aplicação de Fungicida – Triazol",
        type: "application",
        status: "PENDING",
        date: "2026-06-10T07:00:00.000Z",
        time: "07:00",
        clientId: "1",
        location: "Fazenda São João – Talhão 3",
        description:
          "Aplicação preventiva e curativa de tebuconazole + azoxystrobina.",
      },
    ],
    reports: [
      {
        id: "r1",
        title: "Relatório de Monitoramento – Maio 2026",
        content:
          "Identificado foco de Ferrugem Asiática (Phakopsora pachyrhizi) no talhão 3. " +
          "Área afetada estimada em 15% do talhão. Recomendada aplicação imediata de fungicida triazol.",
        status: "SENT",
        engineerId: "eng-1",
        clientId: "1",
        createdAt: new Date("2026-05-21"),
      },
    ],
    createdAt: new Date("2025-03-10"),
  },
  {
    id: "2",
    name: "Sítio Esperança",
    telephone: "(34) 98765-4321",
    person: "PF",
    document: "987.654.321-00",
    address: {
      street: "Estrada Municipal",
      number: "s/n",
      neighborhood: "Zona Rural",
      city: "Uberaba",
      state: "MG",
      country: "Brasil",
      zipCode: "38000-000",
      latitude: -19.7472,
      longitude: -47.9381,
    },
    totalArea: 450,
    totalAreaPlanted: 300,
    active: true,
    actualCrop: "MILHO",
    calendarEvents: [
      {
        title: "Visita Técnica – Análise de Solo",
        type: "visit",
        status: "COMPLETED",
        date: "2026-05-15T10:00:00.000Z",
        time: "10:00",
        clientId: "2",
        location: "Sítio Esperança",
        description: "Coleta de amostras de solo para análise laboratorial.",
      },
      {
        title: "Reunião – Planejamento de Safra",
        type: "meeting",
        status: "PENDING",
        date: "2026-06-15T14:00:00.000Z",
        time: "14:00",
        clientId: "2",
        location: "Escritório do Agrônomo",
        description: "Definição de cronograma e insumos para próxima safra.",
      },
    ],
    reports: [
      {
        id: "r2",
        title: "Relatório de Análise de Solo – Maio 2026",
        content:
          "Análise revelou deficiência de potássio (K) e pH levemente ácido. " +
          "Recomendada calagem e adubação corretiva antes do plantio de milho.",
        status: "DRAFT",
        engineerId: "eng-1",
        clientId: "2",
        createdAt: new Date("2026-05-16"),
      },
    ],
    createdAt: new Date("2025-06-20"),
  },
  {
    id: "3",
    name: "Fazenda Paraíso",
    telephone: "(64) 99234-5678",
    person: "PJ",
    document: "12.345.678/0001-90",
    address: {
      street: "Rod. BR-060",
      number: "km 85",
      neighborhood: "Zona Rural",
      city: "Rio Verde",
      state: "GO",
      country: "Brasil",
      zipCode: "75900-000",
      latitude: -17.7921,
      longitude: -50.9192,
    },
    totalArea: 2100,
    totalAreaPlanted: 1850,
    active: true,
    actualCrop: "SOJA",
    calendarEvents: [
      {
        title: "Coleta de Amostras – Suspeita de Ferrugem",
        type: "collection",
        status: "PENDING",
        date: "2026-06-05T08:00:00.000Z",
        time: "08:00",
        clientId: "3",
        location: "Fazenda Paraíso – Talhão 2",
        description:
          "Coleta de folhas para confirmação laboratorial de Ferrugem Asiática.",
      },
      {
        title: "Relatório Técnico Mensal",
        type: "report",
        status: "PENDING",
        date: "2026-06-20T09:00:00.000Z",
        time: "09:00",
        clientId: "3",
        location: "Remoto",
        description: "Elaboração do relatório técnico do mês de junho.",
      },
    ],
    reports: [],
    createdAt: new Date("2026-01-15"),
  },
];

const MOCK_REPORTS = MOCK_CLIENTS.flatMap((c) => c.reports);

const MOCK_EVENTS = MOCK_CLIENTS.flatMap((c) => c.calendarEvents);

const MOCK_PREDICT_RESULT = {
  createdAt: new Date(),
  crop: "Soja",
  cropConfidence: 96.4,
  sicknessId: "sid-ferrugem-asiatica",
  sicknessConfidence: 93.8,
  handling:
    "Aplicar fungicida triazol (tebuconazole ou propiconazole) preferencialmente nas primeiras horas da manhã. " +
    "Respeitar o intervalo de reentrada de 48h e o intervalo de segurança de 14 dias entre aplicações. " +
    "Em alta pressão da doença, realizar mistura com estrobilurina (azoxystrobina). " +
    "Monitorar os demais talhões nas próximas 72 horas.",
  explanation:
    "Ferrugem Asiática (Phakopsora pachyrhizi) identificada na folhagem. " +
    "Lesões pequenas de coloração marrom-avermelhada a castanha, com pústulas na face inferior das folhas, " +
    "típicas desta doença. Progressão detectada nas folhas do terço médio da planta.",
  causes:
    "Condições de alta umidade relativa do ar (acima de 85%) e temperatura entre 18°C e 26°C favoreceram " +
    "o desenvolvimento do patógeno. A disseminação ocorre por uredósporos transportados pelo vento, " +
    "podendo cobrir grandes distâncias em curto espaço de tempo.",
  image: "/placeholder.svg?height=200&width=200",
  userId: "user-001",
};

const MOCK_LIMIT = {
  imageRequests: 3,
  imageLimit: 10,
  chatRequests: 12,
  chatLimit: 50,
};

// ─── Respostas do chat (contexto: Ferrugem Asiática) ─────────────────────────

const CHAT_RESPONSES: Record<string, string> = {
  fungicida:
    "Para o controle da Ferrugem Asiática, os fungicidas mais recomendados são:\n\n" +
    "• Triazóis: tebuconazole, propiconazole, ciproconazole — ação curativa e preventiva\n" +
    "• Estrobilurinas: azoxystrobina, picoxystrobina, trifloxystrobina — ação preventiva\n" +
    "• Mistura: triazol + estrobilurina para maior eficácia e menor risco de resistência\n\n" +
    "Aplique na dose recomendada em bula e respeite o intervalo de segurança de 14 dias. " +
    "Prefira aplicação nas primeiras horas da manhã para melhor absorção foliar.",

  prevenir:
    "Para prevenir a Ferrugem Asiática na soja:\n\n" +
    "• Monitorar a lavoura semanalmente, especialmente a partir do florescimento (R1)\n" +
    "• Usar variedades com maior tolerância à doença\n" +
    "• Realizar aplicação preventiva antes do fechamento das entrelinhas\n" +
    "• Evitar plantio tardio — maior exposição ao inóculo acumulado na região\n" +
    "• Eliminar plantas voluntárias de soja no período de entressafra\n" +
    "• Registrar histórico de ocorrência por talhão para planejamento futuro",

  sintomas:
    "Os principais sintomas da Ferrugem Asiática são:\n\n" +
    "• Lesões: pústulas pequenas de coloração marrom-avermelhada a castanha\n" +
    "• Localização: predominantemente na face inferior das folhas\n" +
    "• Evolução: inicia nas folhas inferiores e progride para o terço superior\n" +
    "• Desfolha prematura em casos severos, com impacto direto no enchimento de grãos\n" +
    "• Em condições de alta umidade, observa-se esporulação esbranquiçada nas pústulas\n\n" +
    "O diagnóstico precoce é fundamental — perdas podem chegar a 80% sem controle.",

  causa:
    "A Ferrugem Asiática é causada pelo fungo Phakopsora pachyrhizi, sendo uma das doenças " +
    "mais destrutivas da sojicultura mundial.\n\n" +
    "Condições favoráveis ao desenvolvimento:\n" +
    "• Temperatura entre 18°C e 26°C (ótima: ~20°C)\n" +
    "• Umidade relativa acima de 85%\n" +
    "• Período de molhamento foliar mínimo de 6 horas\n" +
    "• Ventos que dispersam os uredósporos a longas distâncias\n\n" +
    "O ciclo completo da doença pode ocorrer em apenas 7 a 14 dias em condições ótimas.",

  perda:
    "A Ferrugem Asiática pode causar perdas severas na produção de soja:\n\n" +
    "• Sem controle: perdas de 40% a 80% na produção\n" +
    "• Com controle tardio: perdas de 15% a 30%\n" +
    "• Com controle preventivo adequado: perdas abaixo de 5%\n\n" +
    "O custo do não controle é sempre muito maior que o custo do fungicida. " +
    "Para a área identificada, recomendo aplicação dentro das próximas 24 a 48 horas.",

  default:
    "Com base na análise realizada, identificamos Ferrugem Asiática (Phakopsora pachyrhizi) " +
    "na sua lavoura de soja, com 93,8% de confiança.\n\n" +
    "Esta é uma das doenças mais impactantes, podendo causar perdas de até 80% sem controle adequado.\n\n" +
    "Posso te ajudar com:\n" +
    "• Fungicidas recomendados e doses\n" +
    "• Estratégias de prevenção\n" +
    "• Sintomas e identificação\n" +
    "• Causas e condições favoráveis\n" +
    "• Estimativa de perdas",
};

function getMockAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (
    msg.includes("fungicid") ||
    msg.includes("produto") ||
    msg.includes("químic") ||
    msg.includes("aplicar") ||
    msg.includes("triazol") ||
    msg.includes("estrobilurina")
  ) {
    return CHAT_RESPONSES.fungicida;
  }
  if (
    msg.includes("prevenir") ||
    msg.includes("prevenção") ||
    msg.includes("evitar") ||
    msg.includes("prevent")
  ) {
    return CHAT_RESPONSES.prevenir;
  }
  if (
    msg.includes("sintoma") ||
    msg.includes("sinal") ||
    msg.includes("identific") ||
    msg.includes("aparência") ||
    msg.includes("como saber")
  ) {
    return CHAT_RESPONSES.sintomas;
  }
  if (
    msg.includes("causa") ||
    msg.includes("por que") ||
    msg.includes("porque") ||
    msg.includes("condição") ||
    msg.includes("temperatura") ||
    msg.includes("umidade")
  ) {
    return CHAT_RESPONSES.causa;
  }
  if (
    msg.includes("perda") ||
    msg.includes("prejuízo") ||
    msg.includes("impact") ||
    msg.includes("produção") ||
    msg.includes("quanto")
  ) {
    return CHAT_RESPONSES.perda;
  }

  return CHAT_RESPONSES.default;
}

// ─── Mock Socket (substitui socket.io-client) ─────────────────────────────────

let _msgCounter = 0;

export function createMockSocket(analysis: { id: string } | null) {
  const socket = {
    on(event: string, cb: (...args: any[]) => void) {
      if (event === "connect") {
        setTimeout(() => cb(), 400);
      }
    },
    off() {},
    emit(
      event: string,
      data: any,
      callback?: (response: any) => void
    ) {
      if (event === "send_message" && callback) {
        const content =
          typeof data === "object" ? (data.content as string) : String(data);
        const sessionId =
          typeof data === "object"
            ? data.sessionId
            : analysis?.id || "session-mock";

        const delay = 1000 + Math.random() * 1000;

        setTimeout(() => {
          const now = new Date().toISOString();
          callback({
            userMessage: {
              id: `msg-u-${++_msgCounter}`,
              content,
              sender: "human",
              userId: "user-001",
              sessionId,
              createdAt: now,
            },
            aiMessage: {
              id: `msg-a-${++_msgCounter}`,
              content: getMockAIResponse(content),
              sender: "ai",
              userId: "ai-agroscope",
              sessionId,
              createdAt: new Date(Date.now() + 50).toISOString(),
            },
          });
        }, delay);
      }
    },
    disconnect() {},
  };

  return socket as any;
}

// ─── Axios Mock Adapter ───────────────────────────────────────────────────────

function extractPath(config: InternalAxiosRequestConfig): string {
  const url = config.url || "";
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url;
}

function ok<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: { "content-type": "application/json" },
    config,
    request: {},
  };
}

export function createMockAdapter(
  _originalAdapter: AxiosAdapter | undefined
): AxiosAdapter {
  return function mockAdapter(
    config: InternalAxiosRequestConfig
  ): Promise<AxiosResponse> {
    const path = extractPath(config);
    const method = (config.method || "get").toLowerCase();

    // Auth validate
    if (method === "get" && path.includes("/auth/validate")) {
      return Promise.resolve(
        ok(config, {
          name: "Dr. Carlos Agronomia",
          email: "carlos@agroscope.com",
          isEngineer: true,
          isAdmin: false,
        })
      );
    }

    // Auth login
    if (method === "post" && path.includes("/auth/login")) {
      return Promise.resolve(
        ok(config, { success: true, message: "Login realizado com sucesso." })
      );
    }

    // User registration
    if (method === "post" && path === "/user") {
      return Promise.resolve(ok(config, { success: true }, 201));
    }

    // Predict – simula 2,5s de processamento
    if (method === "post" && path.includes("/predict")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            ok(
              config,
              {
                ...MOCK_PREDICT_RESULT,
                id: `analysis-${Date.now()}`,
                createdAt: new Date(),
              },
              201
            )
          );
        }, 2500);
      });
    }

    // Usage limit
    if (method === "get" && path.includes("/limit")) {
      return Promise.resolve(ok(config, MOCK_LIMIT));
    }

    // Clients list  GET /engineer/clients
    if (method === "get" && /\/engineer\/clients$/.test(path)) {
      return Promise.resolve(ok(config, MOCK_CLIENTS));
    }

    // Single client  GET /engineer/clients/:id
    if (method === "get" && /\/engineer\/clients\/[^/]+$/.test(path)) {
      const id = path.split("/").pop();
      const client = MOCK_CLIENTS.find((c) => c.id === id) ?? MOCK_CLIENTS[0];
      return Promise.resolve(ok(config, client));
    }

    // Reports  GET /reports or /reports/:id
    if (method === "get" && path.includes("/reports")) {
      return Promise.resolve(ok(config, MOCK_REPORTS));
    }

    // Calendar events  GET /calendar/events
    if (method === "get" && path.includes("/calendar")) {
      return Promise.resolve(ok(config, MOCK_EVENTS));
    }

    // Chat history  GET /chat/history
    if (method === "get" && path.includes("/chat/history")) {
      return Promise.resolve(ok(config, []));
    }

    // Fallback silencioso
    return Promise.resolve(ok(config, null as any, 200));
  } as AxiosAdapter;
}
