# Agroscope Mobile App 📱

Aplicação mobile para análise inteligente de plantas usando React Native e Expo.

## Funcionalidades

- **Análise de Plantas**: Capturar ou selecionar imagens para diagnóstico automático de doenças
- **Histórico**: Acompanhar análises anteriores com confiança e data
- **Estatísticas**: Visualizar tendências e doenças mais frequentes
- **Câmera e Galeria**: Suporte completo para diferentes formas de captura

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure a URL da API:

```bash
cp .env.example .env
```

Edite `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Iniciar o app

```bash
npm start
```

### Opções de execução

- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

## Estrutura do Projeto

```
src/
├── app/
│   ├── index.tsx          # Tela de home
│   ├── analytics.tsx      # Tela de análise de plantas
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizáveis
├── constants/             # Constantes e temas
├── hooks/                 # Hooks customizados
└── shared/
    └── http/
        └── http.config.ts # Configuração Axios
```

## Telas

### Home (index.tsx)

Tela inicial com apresentação da funcionalidade e botão para iniciar análise.

### Análise (analytics.tsx)

- **Nova Análise**: Capturar ou selecionar imagem e analisar
- **Histórico**: Ver análises anteriores
- **Estatísticas**: Visualizar gráficos e tendências

## Requisitos

- Node.js 18+
- Expo CLI: `npm install -g eas-cli`
- Backend rodando em http://localhost:3000 (ou configure em `.env`)

## Desenvolvimento

Para modificar temas e cores, edite `src/constants/theme.ts`.

Para adicionar novas telas, crie arquivos em `src/app/` e atualize `src/components/app-tabs.tsx` se necessário.

## Build para Produção

```bash
npm run lint
eas build
```

## Licença

Agroscope - Todos os direitos reservados

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
