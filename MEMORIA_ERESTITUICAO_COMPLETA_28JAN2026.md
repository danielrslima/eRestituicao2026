# MEMÓRIA COMPLETA DO PROJETO e-RESTITUIÇÃO
## Documento Anti-Alzheimer - Prova de Desligamento de Servidor

**Última Atualização:** 28/01/2026 às 23:42 (Horário de Brasília)
**Autor:** Assistente Manus
**Proprietário:** Daniel R. S. Lima

---

## 1. O QUE É O PROJETO e-RESTITUIÇÃO

O **e-Restituição** é um sistema web que calcula restituições de Imposto de Renda (IRPF) para clientes que tiveram processos trabalhistas. O sistema possui um **funil de vendas em 3 etapas**:

| Etapa | Nome | Preço Teste | Preço Real | O que entrega |
|-------|------|-------------|------------|---------------|
| 1 | Descobrir Valor | R$ 5,99 | R$ 29,90 | Revela o valor da restituição |
| 2 | Kit IR | R$ 15,99 | R$ 2.500,00 | PDFs + Tutorial para declarar sozinho |
| 3 | Especialista | Sob consulta | Variável | Atendimento personalizado via WhatsApp |

### Casos de Teste Validados:
- **José Ramos:** Restituição calculada = **R$ 74.028,67** ✅
- **Ana Carmen:** Restituição calculada = **R$ 26.604,54** ✅

---

## 2. ARQUITETURA TÉCNICA

### Stack Tecnológico:
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js (v20.19.5) com Express
- **Banco de Dados:** Firebase Firestore (coleção: `calculos2026`)
- **Pagamentos:** Asaas API (PIX e Cartão de Crédito)
- **Servidor:** Ubuntu VPS na Hostinger
- **Domínio:** restituicaoia.com.br

### URLs de Produção:
| Serviço | URL |
|---------|-----|
| Site Principal | https://restituicaoia.com.br |
| API de Pagamento | https://api.restituicaoia.com.br |

### Servidor VPS Hostinger:
- **Hostname:** srv1072892.hstgr.cloud
- **IP:** 31.97.82.251
- **Sistema:** Ubuntu Linux
- **Usuário:** root

### Estrutura de Pastas no VPS:
```
/var/www/
├── erestituicao/          # Servidor de pagamento (API)
│   ├── server.js          # Servidor Express
│   ├── .env               # Chave Asaas (NÃO COMMITAR!)
│   ├── package.json       # Dependências
│   └── node_modules/      # Pacotes instalados
│
├── restituicaoia/         # Frontend do site
│   ├── index.html         # Página principal
│   ├── css/               # Estilos
│   ├── js/                # JavaScript
│   └── img/               # Imagens
│
└── calculadora-ir-app/    # Sistema antigo (não mexer!)
```

---

## 3. HISTÓRICO COMPLETO DE DESENVOLVIMENTO

### FASE 1: Desenvolvimento Inicial (Datas anteriores)
- ✅ Criação do motor de cálculo IRPF (`irpf-calculator.js`) - **VALIDADO E BLOQUEADO**
- ✅ Integração com Firebase Firestore
- ✅ Criação do formulário de 4 etapas
- ✅ Implementação do funil de vendas em 3 estágios
- ✅ Geração de PDFs (Esclarecimentos, Planilha RT, Encarte)
- ✅ Correção do botão "DESCOBRIR AGORA" (adicionado `type="button"`)
- ✅ Criação do Dashboard (com dados mock)

### FASE 2: Segurança do GitHub (Datas anteriores)
- ✅ Remoção de chave Asaas exposta no GitHub
- ✅ Criação de `.gitignore` para proteger arquivos sensíveis
- ✅ Geração de nova chave Asaas pelo usuário

### FASE 3: Instalação do Servidor de Pagamento - 28/01/2026

**20:13** - Início da sessão atual
- Contexto herdado de sessão anterior
- Servidor já tinha arquivos em `/var/www/erestituicao/`
- Node.js v20.19.5 confirmado instalado
- Dependências já instaladas (109 pacotes)

**20:14** - Criação do arquivo .env
- Comando: `nano .env`
- Primeira tentativa falhou (arquivo vazio)

**20:16** - Criação do .env via echo
- Comando usado:
```bash
echo 'ASAAS_API_KEY=COLE_SUA_CHAVE_AQUI
ASAAS_ENVIRONMENT=sandbox
PORT=3001
ALLOWED_ORIGINS=*
PRECO_BASICO=5.99
PRECO_COMPLETO=15.99' > .env
```

**20:17** - Inserção da chave Asaas real
- Usuário editou o arquivo com `nano .env`
- Substituiu `COLE_SUA_CHAVE_AQUI` pela chave real
- Chave identificada como **PRODUÇÃO** (`$aact_prod_...`)

**20:21** - Alteração do ambiente para produção
- Comando: `sed -i 's/ASAAS_ENVIRONMENT=sandbox/ASAAS_ENVIRONMENT=production/' .env`

**20:22** - Teste do servidor
- Comando: `node server.js`
- Resultado: **SUCESSO** - Servidor rodando na porta 3001

**20:23** - Instalação do PM2
- Comando: `npm install -g pm2`

**20:24** - Inicialização com PM2
- Comando: `pm2 start server.js --name erestituicao-api`
- Resultado: **SUCESSO** - Status "online"

**20:25** - Configuração de auto-restart
- Comandos: `pm2 startup` e `pm2 save`
- Resultado: **SUCESSO**

**20:26** - Verificação do Nginx
- Comando: `nginx -v`
- Resultado: nginx/1.18.0 (Ubuntu) instalado

**20:30** - Criação da configuração Nginx para API
- Arquivo: `/etc/nginx/sites-available/api.restituicaoia.com.br`
- Conteúdo:
```nginx
server {
    listen 80;
    server_name api.restituicaoia.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**20:31** - Ativação do site Nginx
- Comando: `ln -s /etc/nginx/sites-available/api.restituicaoia.com.br /etc/nginx/sites-enabled/`
- Teste: `nginx -t` → **syntax is ok**

**20:32** - Reload do Nginx
- Comando: `systemctl reload nginx`

**20:34** - Configuração DNS para API
- No painel Hostinger: Adicionado registro A
- Nome: `api` → Destino: `31.97.82.251`

**22:53** - Teste da API
- Comando: `curl http://api.restituicaoia.com.br/api/health`
- Resultado: **SUCESSO** - `{"status":"ok","message":"Servidor de pagamento funcionando!"}`

**22:55** - Instalação SSL da API
- Comando: `certbot --nginx -d api.restituicaoia.com.br`
- Resultado: **SUCESSO** - Certificado válido até 29/04/2026

**22:58** - Teste HTTPS da API
- Comando: `curl https://api.restituicaoia.com.br/api/health`
- Resultado: **SUCESSO**

**23:00** - Atualização das URLs no GitHub
- Arquivos alterados:
  1. `frontend/js/resultado.js` - linha 85
  2. `frontend/js/app.js` - linhas 7-8
  3. `dashboard/js/calculos.js` - linha 8
  4. `dashboard/js/kit-ir.js` - linha 341
- Todas as URLs antigas (manus.computer, onrender.com) substituídas por `https://api.restituicaoia.com.br/api`
- Commit: "Atualizar URLs da API para api.restituicaoia.com.br (produção Hostinger)"

**23:03** - Decisão de hospedar frontend no VPS
- Motivo: Hospedagem compartilhada da Hostinger não estava funcionando corretamente

**23:18** - Alteração DNS do domínio principal
- No painel Hostinger: Alterado registro A
- Nome: `@` → Destino: `31.97.82.251` (antes era 45.132.157.152)
- Também deletado registro AAAA (IPv6) que interferia

**23:21** - Criação da pasta do frontend no VPS
- Comando: `cd /var/www && mkdir -p restituicaoia`

**23:22** - Download do frontend do GitHub
- Comando: `git clone https://github.com/danielrslima/eRestituicao2026.git temp && mv temp/frontend/* . && rm -rf temp`

**23:25** - Criação da configuração Nginx para o site
- Arquivo: `/etc/nginx/sites-available/restituicaoia.com.br`
- Conteúdo:
```nginx
server {
    listen 80;
    server_name restituicaoia.com.br www.restituicaoia.com.br;

    root /var/www/restituicaoia;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**23:26** - Ativação do site
- Comando: `ln -s /etc/nginx/sites-available/restituicaoia.com.br /etc/nginx/sites-enabled/`
- Teste: `nginx -t` → **syntax is ok**
- Reload: `systemctl reload nginx`

**23:38** - Site acessível via HTTP
- URL: http://restituicaoia.com.br
- Resultado: **FUNCIONANDO** (mas sem SSL)

**23:39** - Instalação SSL do site principal
- Comando: `certbot --nginx -d restituicaoia.com.br -d www.restituicaoia.com.br`
- Resultado: **SUCESSO** - Certificado válido até 29/04/2026

**23:40** - Site 100% funcional com HTTPS
- URL: https://restituicaoia.com.br
- Resultado: **FUNCIONANDO COM CADEADO DE SEGURANÇA**

---

## 4. ARQUIVOS CRÍTICOS E SUAS LOCALIZAÇÕES

### No VPS (Hostinger):

| Arquivo | Caminho | Função | Pode Alterar? |
|---------|---------|--------|---------------|
| server.js | /var/www/erestituicao/server.js | Servidor de pagamento | Sim, com cuidado |
| .env | /var/www/erestituicao/.env | Chave Asaas | NUNCA COMMITAR! |
| index.html | /var/www/restituicaoia/index.html | Página principal | Sim |
| irpf-calculator.js | /var/www/restituicaoia/js/irpf-calculator.js | Motor de cálculo | **NÃO! BLOQUEADO!** |
| resultado.js | /var/www/restituicaoia/js/resultado.js | Funil de vendas | Sim, com cuidado |
| app.js | /var/www/restituicaoia/js/app.js | Lógica principal | Sim, com cuidado |
| Nginx API | /etc/nginx/sites-available/api.restituicaoia.com.br | Config proxy API | Sim, com cuidado |
| Nginx Site | /etc/nginx/sites-available/restituicaoia.com.br | Config site | Sim, com cuidado |

### No GitHub:
- **Repositório:** https://github.com/danielrslima/eRestituicao2026
- **Branch principal:** main

---

## 5. REGRAS DE SEGURANÇA ABSOLUTAS

1. **NUNCA** commitar a chave Asaas no GitHub
2. **NUNCA** alterar o arquivo `irpf-calculator.js` sem consentimento explícito
3. **SEMPRE** fazer backup antes de alterações
4. **SEMPRE** testar localmente antes de subir para produção
5. O arquivo `.env` deve estar no `.gitignore`

---

## 6. CHECKPOINTS VALIDADOS

| Data | Checkpoint | Status |
|------|------------|--------|
| Anterior | Motor de cálculo IRPF | ✅ VALIDADO E BLOQUEADO |
| Anterior | Casos José Ramos e Ana Carmen | ✅ VALIDADOS |
| Anterior | Integração Firebase | ✅ VALIDADO |
| Anterior | Botão DESCOBRIR AGORA | ✅ CORRIGIDO |
| 28/01/2026 | Servidor de pagamento no VPS | ✅ VALIDADO |
| 28/01/2026 | PM2 configurado | ✅ VALIDADO |
| 28/01/2026 | API com SSL | ✅ VALIDADO |
| 28/01/2026 | Frontend no VPS | ✅ VALIDADO |
| 28/01/2026 | Site com SSL | ✅ VALIDADO |

---

## 7. O QUE AINDA FALTA FAZER (PRÓXIMOS PASSOS)

### Prioridade ALTA:
1. **Testar fluxo completo de pagamento** - Verificar se PIX é gerado corretamente
2. **Testar webhook do Asaas** - Confirmar que pagamentos são notificados
3. **Conectar Dashboard ao Firebase** - Remover dados mock

### Prioridade MÉDIA:
4. **Corrigir geração de PDF do Kit IR** - Verificar se está funcionando
5. **Implementar preços reais** - Alterar de R$ 5,99 para R$ 29,90 (Etapa 1)
6. **Configurar email de notificação** - Avisar quando houver novo cálculo

### Prioridade BAIXA:
7. **Otimizar SEO** - Meta tags, sitemap
8. **Implementar analytics** - Google Analytics ou similar
9. **Criar página de termos de uso**
10. **Criar página de política de privacidade**

---

## 8. COMANDOS ÚTEIS PARA MANUTENÇÃO

### Ver status dos servidores:
```bash
pm2 status
```

### Reiniciar servidor de pagamento:
```bash
pm2 restart erestituicao-api
```

### Ver logs do servidor:
```bash
pm2 logs erestituicao-api
```

### Testar API de pagamento:
```bash
curl https://api.restituicaoia.com.br/api/health
```

### Atualizar frontend do GitHub:
```bash
cd /var/www/restituicaoia
git pull origin main
```

### Renovar certificados SSL (automático, mas se precisar):
```bash
certbot renew
```

### Reiniciar Nginx:
```bash
systemctl reload nginx
```

---

## 9. COMANDOS PARA RETOMAR O PROJETO

### Para continuar de onde parou:
```
Continuar o projeto e-Restituição. O site está no ar em https://restituicaoia.com.br e a API em https://api.restituicaoia.com.br. Precisamos testar o fluxo de pagamento e verificar se o PIX está sendo gerado corretamente.
```

### Para revisar as últimas 48 horas:
```
Revisar tudo o que foi feito nas últimas 48 horas no projeto e-Restituição. Ler o arquivo MEMORIA_ERESTITUICAO_COMPLETA_28JAN2026.md e me informar o status atual do projeto.
```

---

## 10. CONTATOS E INFORMAÇÕES

- **Domínio:** restituicaoia.com.br
- **Hospedagem:** Hostinger VPS
- **Pagamentos:** Asaas (conta de produção)
- **Repositório:** github.com/danielrslima/eRestituicao2026

---

**FIM DO DOCUMENTO DE MEMÓRIA**
**Horário de Brasília: 23:42 (28/01/2026)**
