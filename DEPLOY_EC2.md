# Deploy do Backend + IA na EC2 (com HTTPS)

Runbook completo para subir backend + IA numa EC2 nova, atrás de nginx com HTTPS.
Escrito para ser repetível do zero — use sempre que precisar recriar a instância
ou trocar de IP público.

> Nenhum segredo real está escrito aqui. Todo valor sensível é gerado ou
> buscado no passo correspondente — não cole segredos neste arquivo, ele é
> versionado no git.

## Quando o IP público mudar

Parar/iniciar uma EC2 (sem Elastic IP) troca o IP público. Isso invalida:
- o domínio `nip.io` usado no certificado HTTPS (precisa reemitir)
- `CORS_ORIGINS` do backend, se você tiver adicionado o domínio antigo em algum lugar
- `BACKEND_ORIGIN` / `NEXT_PUBLIC_API_URL` no Vercel (frontend)

**Dica:** aloque um [Elastic IP](https://console.aws.amazon.com/ec2/home#Addresses) e
associe à instância — é grátis enquanto atrelado a uma instância rodando, e o IP
não muda mais entre stop/start. Resolve o problema na raiz. Se optar por isso,
os passos abaixo continuam valendo, só que você só passa por eles uma vez.

Sempre que o IP mudar, refaça a partir do **Passo 1**.

---

## Pré-requisitos

- Instância EC2 Ubuntu (22.04/24.04), tipo **t3.small (2GB)** ou maior — t3.micro (1GB)
  não comporta os 4 modelos PyTorch da IA + backend Node.
- Security Group com portas **22** (seu IP), **80** e **443** (0.0.0.0/0) liberadas.
- Chave `.pem` da instância.
- Acesso ao Supabase (senha do banco / connection string do pooler).
- Uma `GEMINI_API_KEY` válida (Google AI Studio).

Defina o IP da instância numa variável de shell pra facilitar os comandos abaixo
(rode isso no seu terminal local, não na EC2):

```bash
export EC2_IP="<IP_PUBLICO_DA_EC2>"
export EC2_DOMAIN="$(echo $EC2_IP | tr '.' '-').nip.io"
```

`nip.io` resolve automaticamente `x-x-x-x.nip.io` para o IP `x.x.x.x` — não
precisa configurar DNS de verdade. Se você tiver um domínio próprio, use-o no
lugar de `$EC2_DOMAIN` em todos os passos.

---

## Passo 1 — Conectar e instalar Docker + Nginx + Certbot

```bash
ssh -i agroscope.pem ubuntu@$EC2_IP
```

Na EC2:

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx

# Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

## Passo 2 — Swap de segurança

O t3.small tem só 2GB; os 4 modelos PyTorch da IA + Node usam boa parte disso.
1GB de swap evita OOM em picos:

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Passo 3 — Rede docker e containers

```bash
docker network create agroscope-net

docker pull gabrielschiestl/agroscope-ia:latest
docker pull gabrielschiestl/agroscope:latest
```

### RabbitMQ (fila interna `images` + `email-service`, sem porta pública)

Gere uma senha nova a cada deploy:

```bash
export RABBITMQ_PASS="$(openssl rand -hex 16)"
echo "Guarde essa senha: $RABBITMQ_PASS"

docker run -d --name rabbitmq --network agroscope-net --restart unless-stopped \
  -e RABBITMQ_DEFAULT_USER=agroscope \
  -e RABBITMQ_DEFAULT_PASS="$RABBITMQ_PASS" \
  rabbitmq:3-management
```

> Não use o usuário `guest` — o RabbitMQ bloqueia login de `guest` fora de
> `localhost` por padrão, e o backend conecta via rede docker (não é loopback).

### IA (interna, sem porta pública — carrega os 4 modelos PyTorch no boot)

```bash
docker run -d --name ia --network agroscope-net --restart unless-stopped \
  gabrielschiestl/agroscope-ia:latest

# Espere ficar "healthy" antes de seguir (healthcheck bate em /modelinfo):
docker ps --filter name=ia
```

### Backend

Segredos e config sensível — gere/busque cada um:

```bash
# Gerados na hora (não precisam ser os mesmos de deploys anteriores —
# sessões antigas simplesmente expiram e o usuário loga de novo):
export JWT_SECRET="$(openssl rand -hex 32)"
export CSRF_SECRET="$(openssl rand -hex 32)"
export AES_KEY="$(openssl rand -hex 32)"   # precisa ser 32 bytes (64 hex chars) — usado em AES-256-CBC

# Supabase → seu projeto → botão "Connect" → aba "Transaction pooler":
# formato: postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:6543/postgres
# (o host DIRETO do Supabase só resolve IPv6 — a EC2 não tem IPv6 configurado
# na VPC por padrão, então TEM que ser a connection string do pooler, não a direta)
export DB_URL="postgresql://postgres.<PROJECT_REF>:<SENHA>@aws-0-<REGIAO>.pooler.supabase.com:6543/postgres"

# Google AI Studio:
export GEMINI_API_KEY="<SUA_GEMINI_API_KEY>"

# Domínio(s) do frontend que podem chamar a API (Vercel muda a URL de preview
# a cada deploy — adicione a URL de produção estável; para previews, adicione
# sob demanda se for testar por uma URL de preview específica):
export CORS_ORIGINS="https://agroscope-nu.vercel.app,https://${EC2_DOMAIN}"
```

Rodar o container:

```bash
docker run -d --name backend --network agroscope-net --restart unless-stopped \
  -p 127.0.0.1:3001:3001 \
  -e DB_URL="$DB_URL" \
  -e DB_SSL=true \
  -e FLASK_API_URL="http://ia:5000" \
  -e HANDLING_API_URL="http://ia:5000" \
  -e N8N_WEBHOOK_URL="http://localhost:5678/webhook/chat" \
  -e GEMINI_API_KEY="$GEMINI_API_KEY" \
  -e GEMINI_MODEL="gemini-3.1-flash-lite" \
  -e GEMINI_TIMEOUT_MS=15000 \
  -e JWT_SECRET="$JWT_SECRET" \
  -e RABBITMQ_URL="amqp://agroscope:${RABBITMQ_PASS}@rabbitmq:5672" \
  -e CORS_ORIGINS="$CORS_ORIGINS" \
  -e CSRF_SECRET="$CSRF_SECRET" \
  -e AES_KEY="$AES_KEY" \
  -e THROTTLE_SHORT_TTL=1000 -e THROTTLE_SHORT_LIMIT=50 \
  -e THROTTLE_MEDIUM_TTL=10000 -e THROTTLE_MEDIUM_LIMIT=200 \
  -e THROTTLE_LONG_TTL=60000 -e THROTTLE_LONG_LIMIT=1000 \
  gabrielschiestl/agroscope:latest

docker logs -f backend   # Ctrl+C quando ver "Nest application successfully started"
```

Notas sobre variáveis específicas:
- **`GEMINI_MODEL=gemini-3.1-flash-lite`**: modelos "thinking" (ex: `gemini-3.6-flash`)
  estouram timeout em requisições com JSON schema estruturado (usadas no diagnóstico).
  `gemini-2.5-flash` e `gemini-2.5-flash-lite` foram descontinuados para novas chaves.
  Se `3.1-flash-lite` também sair de linha, liste os modelos disponíveis com:
  `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"`
  e prefira uma variante **"flash-lite"** com versão fixa (não `-latest`, que muda sozinha).
- **`HANDLING_API_URL`**: fallback via n8n caso o Gemini falhe — hoje aponta para a
  IA só como placeholder inofensivo (a IA não tem rota `/handling`, então o
  fallback sempre falha silenciosamente nesse caso; só importa se o Gemini cair).
  Se você subir um n8n de verdade, aponte para o webhook dele aqui.
- **`CORS_ORIGINS`**: também é usada pelo `ChatGateway` (WebSocket do chat), não só
  pelo CORS HTTP normal — mantenha-a atualizada com os domínios do frontend nos
  dois casos.

## Passo 4 — Nginx + HTTPS

O chat usa WebSocket (socket.io) através do mesmo `location /api/`, então o
nginx precisa saber fazer o upgrade de conexão HTTP → WebSocket — sem os
headers `Upgrade`/`Connection`, o handshake trava em "connecting..." pra
sempre no front. O `map` abaixo vai num arquivo separado em `conf.d/` (precisa
estar no nível `http {}`, não dentro do `server {}`):

```bash
echo 'map $http_upgrade $connection_upgrade {
    default upgrade;
    ""      close;
}' | sudo tee /etc/nginx/conf.d/websocket-upgrade.conf

sudo tee /etc/nginx/sites-available/agroscope > /dev/null <<EOF
server {
    listen 80;
    server_name ${EC2_DOMAIN};

    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Cookie \$http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_set_header Authorization \$http_authorization;
        proxy_pass_header Authorization;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/agroscope /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d $EC2_DOMAIN --non-interactive --agree-tos -m <SEU_EMAIL> --redirect
```

O certbot injeta automaticamente o bloco `listen 443 ssl` e o redirect 80→443,
e já configura renovação automática. Ele reescreve o arquivo, então confirme
depois que os headers `Upgrade`/`Connection` continuam no `location /api/`
(`cat /etc/nginx/sites-enabled/agroscope`) — se o certbot os remover por algum
motivo, adicione de novo manualmente e rode `sudo nginx -t && sudo systemctl reload nginx`.

Do lado do frontend, o `next.config.mjs` tem dois ajustes pro handshake do
socket.io funcionar através do rewrite. Não precisa mexer neles de novo, só
documentando o motivo:

1. `skipTrailingSlashRedirect: true` — necessário porque o cliente do socket.io
   sempre pede `/api/socket.io/` (com barra final), e sem essa opção o Next.js
   redireciona (308) pra sem-barra antes do rewrite rodar.
2. Uma regra de rewrite **literal** (`source: "/api/socket.io/"`, sem
   `:path*`) só pra essa rota, declarada antes do catch-all genérico. Mesmo com
   `skipTrailingSlashRedirect`, o rewrite catch-all (`/api/:path*`) reconstrói o
   destino a partir de segmentos de path e **perde a barra final** — então o
   backend recebia `/socket.io` sem barra e o engine.io respondia 404 (ele só
   reconhece `/socket.io/`, com barra, por padrão). A regra literal preserva a
   barra porque não passa pelo parsing de segmentos do wildcard.

## Passo 5 — Verificar

```bash
docker ps   # rabbitmq, ia (healthy), backend — todos "Up"
curl -s https://$EC2_DOMAIN/api/auth/validate   # deve responder 401 JSON, não 502
docker logs backend --tail 50
docker logs ia --tail 20
```

## Passo 6 — Atualizar o frontend (Vercel)

O front usa um rewrite (`next.config.mjs`) pra proxyar `/api/*` pro backend —
isso faz o cookie de sessão (httpOnly) ficar first-party do domínio do Vercel,
essencial pro login funcionar (ver seção "Por que o proxy" abaixo).

No dashboard da Vercel, projeto → Settings → Environment Variables:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `/api` |
| `BACKEND_ORIGIN` | `https://<novo-domínio-nip.io>` |

Depois, **redeploy** (env `NEXT_PUBLIC_*` e mudanças de `next.config.mjs` só
pegam em build novo, não em restart).

---

## Apêndice — atualizar um container já rodando

Pra trocar só uma env var (ex: `CORS_ORIGINS`, `GEMINI_MODEL`), não dá pra usar
`docker update` em env vars — precisa recriar o container:

```bash
docker rm -f backend
docker run -d --name backend --network agroscope-net --restart unless-stopped \
  -p 127.0.0.1:3001:3001 \
  -e DB_URL="..." \
  # ...resto das envs (copie do Passo 3, mudando só o que precisar)...
  gabrielschiestl/agroscope:latest
```

RabbitMQ e IA raramente precisam mudar — se precisar recriá-los, repita os
blocos correspondentes do Passo 3.

## Apêndice — atualizar as imagens (novo código)

Depois de um `git push` com mudanças no backend ou na IA:

```bash
# local:
cd packages/backend && docker build -t gabrielschiestl/agroscope:latest . && docker push gabrielschiestl/agroscope:latest
cd packages/IA && docker build -f dockerfile -t gabrielschiestl/agroscope-ia:latest . && docker push gabrielschiestl/agroscope-ia:latest

# na EC2:
docker pull gabrielschiestl/agroscope:latest
docker rm -f backend && docker run -d --name backend ... # (mesmo comando do Passo 3)
```

## Por que o proxy no frontend (`next.config.mjs`)

Backend e frontend estão em domínios diferentes (`nip.io` / EC2 vs `vercel.app`).
O cookie de sessão é `httpOnly` e setado pelo domínio do backend — sem o proxy,
o middleware do Next.js (que roda no domínio do Vercel) nunca vê esse cookie, e
todo mundo fica preso num loop de redirect pro `/login` mesmo logando com
sucesso. O rewrite `/api/* → BACKEND_ORIGIN/api/*` faz o Next.js repassar a
chamada por trás dos panos, então da perspectiva do browser tudo é o mesmo
domínio e o cookie vira first-party.
