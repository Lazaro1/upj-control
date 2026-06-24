# Deploy UPJ Control — VPS Contabo

## 1. Preparar o servidor (como root)

```bash
apt update && apt upgrade -y

# Firewall — SSH, HTTP, HTTPS (porta 81 do NPM: use túnel SSH ou ufw allow 81/tcp)
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# Usuário deploy
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy
```

## 2. Clonar o projeto

```bash
su - deploy
sudo mkdir -p /opt/upj && sudo chown deploy:deploy /opt/upj
cd /opt/upj
git clone https://github.com/Lazaro1/upj-control.git .
```

## 3. Configurar variáveis

```bash
cp .env.docker.example .env.docker
nano .env.docker
```

Preencha Clerk, `POSTGRES_PASSWORD` (senha forte) e demais secrets.

No Clerk Dashboard, adicione o domínio de produção (ex.: `https://tesouraria.seudominio.com.br`).

## 4. DNS

Registro **A** apontando para o IP da VPS:

```
tesouraria.seudominio.com.br  →  109.123.240.68
```

## 5. Subir o stack de produção

```bash
cd /opt/upj
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.docker up -d --build
```

Verificar:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker logs upj-app -f
```

## 6. Nginx Proxy Manager (HTTPS)

Painel admin (escolha uma opção):

- **Túnel SSH (recomendado):** no Mac → `ssh -L 8181:127.0.0.1:81 deploy@IP_DA_VPS` → abra `http://localhost:8181`
- **Direto:** libere `ufw allow 81/tcp` → `http://IP_DA_VPS:81`

Login inicial:

| Campo | Valor |
|-------|-------|
| Email | `admin@example.com` |
| Senha | `changeme` |

Criar **Proxy Host**:

| Campo | Valor |
|-------|-------|
| Domain Names | `tesouraria.seudominio.com.br` |
| Scheme | `http` |
| Forward Hostname / IP | `upj-app` |
| Forward Port | `3000` |
| Block Common Exploits | ✓ |
| Websockets Support | ✓ |
| SSL | Request a new SSL Certificate (Let's Encrypt) |

## 7. Arquivos Docker Compose

| Arquivo | Uso |
|---------|-----|
| `docker-compose.dev.yml` | Mac — só Postgres + `bun run dev` |
| `docker-compose.yml` | Base — app + Postgres |
| `docker-compose.prod.yml` | VPS — NPM + rede interna (usa junto com o base) |

## 8. Atualizar deploy

```bash
cd /opt/upj
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.docker up -d --build
```
