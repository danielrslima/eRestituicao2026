# 🚀 Servidor de Pagamento - e-Restituição IA

Este servidor é o intermediário entre o site e-Restituição e a API do Asaas (processador de pagamentos).

---

## 📋 Pré-requisitos

- **Node.js** versão 18 ou superior
- **NPM** (vem junto com o Node.js)
- **Chave API do Asaas** (obtida no painel do Asaas)

---

## 🔧 Instalação na Hostinger VPS

### Passo 1: Conectar no VPS via SSH

```bash
ssh usuario@seu-ip-do-vps
```

### Passo 2: Instalar Node.js (se não tiver)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### Passo 3: Criar pasta do servidor

```bash
mkdir -p /var/www/pagamento
cd /var/www/pagamento
```

### Passo 4: Fazer upload dos arquivos

Faça upload dos arquivos deste ZIP para a pasta `/var/www/pagamento/`

### Passo 5: Instalar dependências

```bash
cd /var/www/pagamento
npm install
```

### Passo 6: Configurar o arquivo .env

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

**⚠️ IMPORTANTE:** Substitua `COLE_SUA_CHAVE_AQUI` pela sua chave real do Asaas!

### Passo 7: Testar o servidor

```bash
npm start
```

Você deve ver:
```
============================================
🚀 SERVIDOR DE PAGAMENTO - e-Restituição
============================================
📍 Rodando na porta: 3001
🌐 Ambiente: sandbox
============================================
```

### Passo 8: Configurar para rodar permanentemente (PM2)

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar servidor com PM2
pm2 start server.js --name "pagamento-erestituicao"

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

### Passo 9: Configurar Nginx (proxy reverso)

Edite o arquivo de configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/pagamento
```

Adicione:

```nginx
server {
    listen 80;
    server_name api.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Ativar e reiniciar:

```bash
sudo ln -s /etc/nginx/sites-available/pagamento /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 10: Configurar SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com.br
```

---

## 🧪 Testando

### Verificar se está funcionando:

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "Servidor de pagamento funcionando!",
  "environment": "sandbox"
}
```

### Testar criação de pagamento:

```bash
curl -X POST http://localhost:3001/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@email.com",
    "cpfCnpj": "12345678901",
    "value": 5.99,
    "billingType": "PIX"
  }'
```

---

## 📁 Estrutura de Arquivos

```
/var/www/pagamento/
├── server.js          # Servidor principal
├── package.json       # Dependências
├── .env.example       # Exemplo de configuração
├── .env               # Suas configurações (NÃO compartilhar!)
└── README.md          # Este arquivo
```

---

## 🔒 Segurança

- **NUNCA** compartilhe o arquivo `.env`
- **NUNCA** faça upload do `.env` para o GitHub
- Mantenha a chave do Asaas em segredo
- Use HTTPS em produção

---

## 📞 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Verifica se servidor está funcionando |
| POST | `/api/create-payment` | Cria uma cobrança no Asaas |
| GET | `/api/payment-status/:id` | Verifica status de um pagamento |
| POST | `/api/webhook` | Recebe notificações do Asaas |

---

## ❓ Problemas Comuns

### Erro: "Chave da API não configurada"
→ Verifique se o arquivo `.env` existe e tem a chave correta

### Erro: "CORS bloqueado"
→ Adicione seu domínio na variável `ALLOWED_ORIGINS` do `.env`

### Servidor não inicia
→ Verifique se a porta 3001 não está em uso: `lsof -i :3001`

---

**Versão:** 2.0.0  
**Data:** 28/01/2026
