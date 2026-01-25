# DETALHAMENTO COMPLETO DO PROJETO - e-Restituição IA

## Última Atualização: 25/01/2026 - 08:35 (Horário de Brasília)

---

## 📌 IDENTIFICAÇÃO DO PROJETO

| Campo | Valor |
|-------|-------|
| Nome | e-Restituição IA |
| Versão | 1.0.0 |
| Data Início | Janeiro 2026 |
| Status | Em desenvolvimento |

---

## 🎯 OBJETIVO DO PROJETO

Sistema web para cálculo de restituição de Imposto de Renda sobre Reclamatórias Trabalhistas (RRA - Rendimentos Recebidos Acumuladamente), permitindo que clientes descubram se têm valores a restituir e possam adquirir serviços relacionados.

---

## 🏗️ ARQUITETURA DO SISTEMA

### Frontend
- **Tecnologia:** HTML5, CSS3, JavaScript (Vanilla)
- **Hospedagem:** Servidor local (Python HTTP Server para desenvolvimento)
- **Porta:** 8080

### Backend
- **Tecnologia:** Node.js + TypeScript
- **Framework:** Express.js
- **Porta:** 3001

### Banco de Dados
- **Tecnologia:** A definir (provavelmente MySQL/PostgreSQL)

### Integrações
- **Pagamentos:** Asaas (PIX e Cartão)
- **Comunicação:** WhatsApp (atendimento especialista)
- **E-mail:** A definir (envio do Kit IR)

---

## 📁 ESTRUTURA DE ARQUIVOS

```
/home/ubuntu/restituicaoia/
├── frontend/
│   ├── index.html                 # Página principal
│   ├── css/
│   │   └── style.css              # Estilos
│   └── js/
│       ├── app.js                 # Script principal
│       ├── masks.js               # Máscaras de campos
│       ├── validations.js         # Validações CPF/CNPJ/textos
│       ├── tabBehavior.js         # Comportamento Tab
│       └── confirmacao.js         # Modal de confirmação
│
├── server/
│   └── src/
│       ├── controllers/
│       │   └── calculoController.ts
│       ├── services/
│       │   └── irpfCalculationService.ts  # Motor de cálculo
│       └── data/
│           └── ipcaIndices.ts     # Índices IPCA-E
│
├── CHECKPOINT_25_01_2026_0737.md  # Checkpoint 1
├── CHECKPOINT_25_01_2026_0825.md  # Checkpoint 2 (atual)
├── DANIEL_CASSIMIRO_ANALISE.md    # Análise caso pendente
├── JOSE_RAMOS_PLANILHA.md         # Dados caso validado
├── FLUXO_SITE_DETALHADO.md        # Fluxo do site
├── DETALHAMENTO_PROJETO.md        # Este arquivo
└── todo.md                        # Lista de tarefas
```

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. Motor de Cálculo IRPF (Backend)
- Cálculo de proporção tributável (Tributável/Bruto)
- Proporcionalização de DARFs entre todos os alvarás
- Proporcionalização de honorários (× proporção tributável)
- Deflação por índices IPCA-E
- Cálculo de IR devido por exercício fiscal
- Tabelas IRRF por exercício (2020-2026)
- Suporte a múltiplos anos/exercícios

### 2. Landing Page (Frontend)
- Formulário de 4 etapas (Steps)
- Step 1: Dados Pessoais
- Step 2: Dados do Processo
- Step 3: Valores e Alvarás
- Step 4: Resultado

### 3. Validações e Máscaras
| Funcionalidade | Descrição |
|----------------|-----------|
| CPF | Validação de dígitos verificadores |
| CNPJ | Validação de dígitos verificadores |
| Nomes | Iniciais maiúsculas, preposições minúsculas |
| Comarca | Formatação igual aos nomes |
| Fonte Pagadora | S/A sempre maiúsculo |
| Processo | Máscara XXXXXXX-XX.XXXX.X.XX.XXXX |
| Anos | 4 dígitos, entre 2020 e 2100 |
| Vara | 1-2 dígitos + ª + "do" automático |
| Data | DD/MM/AAAA (máx 4 dígitos no ano) |

### 4. Comportamento de Tab
- Tab em linha preenchida → abre nova linha
- Tab em linha vazia → exclui e vai para próximo item

### 5. Modal de Confirmação
- Resumo de todos os dados antes de calcular
- Botões "Revisar Dados" e "Calcular Agora"

---

## 🔧 FUNCIONALIDADES PENDENTES

### 1. Ajustes de Layout - Tela de Resultado
- [ ] Valor a restituir só aparece após pagamento
- [ ] Mensagem inicial: "Parabéns! Você tem valor a restituir!"
- [ ] Mensagem alternativa: "Você não tem valor a restituir, mas pode ter pago mais do que o devido"
- [ ] Plano Básico: "Descubra seu valor a Restituir" (R$ 29,90 / R$ 5,99 teste)
- [ ] Plano Completo: "Faça você mesmo" - Kit IR (R$ 2.500,00 / R$ 15,99 teste)
- [ ] Opção: "Contratar Especialista" (WhatsApp)
- [ ] Ocultar detalhamento por exercício para o lead

### 2. Integração de Pagamentos (Asaas)
- [ ] Configurar conta Asaas
- [ ] Integrar API de pagamento
- [ ] Fluxo PIX
- [ ] Fluxo Cartão de Crédito
- [ ] Webhook de confirmação de pagamento
- [ ] Atualização de status na tela principal

### 3. Dashboard Administrativo
- [ ] Tela de login admin
- [ ] Listagem de leads/clientes
- [ ] Visualização de cálculos realizados
- [ ] Status de pagamento
- [ ] Relatórios e métricas
- [ ] Gestão de envio do Kit IR (após 8 dias)

### 4. Sistema de E-mail
- [ ] Configurar serviço de e-mail
- [ ] Template de e-mail do Kit IR
- [ ] Agendamento de envio (8 dias após pagamento)
- [ ] Anexos: Templates PDF, Esclarecimentos, Link do vídeo

### 5. Funcionalidades Adicionais
- [ ] Geração de PDF do relatório
- [ ] Histórico de cálculos do usuário
- [ ] Recuperação de cálculo por código de acesso

---

## 🧪 CASOS DE TESTE VALIDADOS

### Caso 1: José Ramos
| Campo | Valor |
|-------|-------|
| Resultado | +R$ 74.028,67 (Restituir) |
| Status | ✅ VALIDADO |

### Caso 2: Ana Carmen
| Campo | Valor |
|-------|-------|
| Resultado | +R$ 26.604,54 (Restituir) |
| Status | ✅ VALIDADO |

### Caso 3: Daniel Cassimiro
| Campo | Valor |
|-------|-------|
| Resultado | Inconsistente |
| Status | ⚠️ PENDENTE ANÁLISE |

---

## 🔒 REGRAS DE BLINDAGEM

1. **NÃO alterar** o motor de cálculo sem consentimento
2. **NÃO alterar** casos validados (José Ramos, Ana Carmen)
3. **NÃO alterar** nomes de variáveis do banco/API
4. **NÃO alterar** validações e máscaras já validadas
5. Qualquer alteração deve ser justificada e aprovada

---

## 📋 CHECKPOINTS

| Data | Arquivo | Descrição |
|------|---------|-----------|
| 25/01/2026 07:37 | CHECKPOINT_25_01_2026_0737.md | Validação motor de cálculo |
| 25/01/2026 08:25 | CHECKPOINT_25_01_2026_0825.md | Validação máscaras e validações |

---

## 🔧 COMANDOS PARA CONTINUIDADE

### Analisar últimas 48 horas:
```
Analise minuciosamente tudo o que foi feito nas últimas 48 horas no projeto e-Restituição IA. Revise todos os arquivos, checkpoints e validações. Responda o que entendeu sobre o projeto, quais passos já foram dados e em que momento estamos.
```

### Continuar implementação (próximos passos):
```
Continue a implementação do projeto e-Restituição IA a partir do CHECKPOINT_25_01_2026_0825.md. O motor de cálculo e as validações/máscaras estão validados e blindados. Implemente os próximos passos conforme FLUXO_SITE_DETALHADO.md: 1) Ajustes de layout da tela de resultado (valor só após pagamento, mensagens corretas, planos com preços), 2) Integração de pagamentos com Asaas (PIX e Cartão), 3) Dashboard administrativo. Leia o todo.md e FLUXO_SITE_DETALHADO.md para detalhes completos.
```
