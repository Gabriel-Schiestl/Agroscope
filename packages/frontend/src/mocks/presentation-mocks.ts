/**
 * Mock para apresentação da pré-banca (dados do persona engenheiro: clientes,
 * relatórios e eventos de calendário, ainda sem endpoints reais no backend).
 * Ativado quando NEXT_PUBLIC_MOCK=true.
 * Rotas já integradas ao backend real ficam em PASSTHROUGH_ROUTES e não
 * são mockadas, permitindo remover o mock gradualmente por endpoint.
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

// Rotas já integradas com o backend real — não devem ser interceptadas
// mesmo com NEXT_PUBLIC_MOCK=true. Removidas do mock gradualmente conforme
// cada fluxo é validado contra o backend.
const PASSTHROUGH_ROUTES: { method: string; test: (path: string) => boolean }[] = [
  { method: "get", test: (path) => path.includes("/auth/validate") },
  { method: "post", test: (path) => path.includes("/auth/login") },
  { method: "post", test: (path) => path.includes("/auth/logout") },
  { method: "post", test: (path) => path === "/user" },
  { method: "post", test: (path) => path.includes("/predict") },
  { method: "get", test: (path) => path.includes("/limit") },
  { method: "get", test: (path) => path.includes("/chat/history") },
  { method: "get", test: (path) => path.includes("/history") },
];

export function createMockAdapter(
  originalAdapter: AxiosAdapter | undefined
): AxiosAdapter {
  return function mockAdapter(
    config: InternalAxiosRequestConfig
  ): Promise<AxiosResponse> {
    const path = extractPath(config);
    const method = (config.method || "get").toLowerCase();

    const isPassthrough = PASSTHROUGH_ROUTES.some(
      (route) => route.method === method && route.test(path)
    );
    if (isPassthrough) {
      if (!originalAdapter) {
        return Promise.reject(
          new Error(`No adapter available to handle real request to ${path}`)
        );
      }
      return originalAdapter(config);
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

    // Fallback silencioso
    return Promise.resolve(ok(config, null as any, 200));
  } as AxiosAdapter;
}
