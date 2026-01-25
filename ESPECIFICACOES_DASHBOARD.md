# ESPECIFICAÇÕES DO DASHBOARD ADMINISTRATIVO

**Data:** 25/01/2026 - 11:39 (Horário de Brasília)

---

## 📊 OBJETIVO DO DASHBOARD

O Dashboard serve para gestão interna do sistema e-Restituição, com dois fluxos distintos de clientes.

---

## 🔄 FLUXOS DE CLIENTES

### Clientes EXTERNOS (via site público)

Os clientes externos acessam o site, preenchem o formulário e passam pelo fluxo de pagamento por etapas.

| Etapa | Descrição | Valor (Teste) |
|-------|-----------|---------------|
| 1 | Preenche formulário e calcula | Grátis |
| 2 | Paga para ver o valor | R$ 5,99 |
| 3 | Paga para receber Kit IR | R$ 10,00 (com abatimento) |
| 4 | Opção de contratar Especialista | WhatsApp |

### Clientes INTERNOS (via dashboard)

Os clientes internos são atendidos diretamente por você ou funcionários. Não passam pelo pagamento por etapas.

| Etapa | Descrição |
|-------|-----------|
| 1 | Funcionário/Admin preenche dados no dashboard |
| 2 | Sistema realiza o cálculo |
| 3 | Gera Kit IR e PDFs diretamente |
| 4 | Fecha contrato com o cliente |
| 5 | **Futuro:** Assinatura eletrônica via ClickSign |

---

## 👥 NÍVEIS DE ACESSO

### 👑 ADMIN (Acesso Total)

O administrador tem acesso completo a todas as funcionalidades do sistema.

| Funcionalidade | Permissão |
|----------------|-----------|
| Visualizar leads/clientes | ✅ |
| Realizar novos cálculos | ✅ |
| Gerar Kit IR / PDFs | ✅ |
| Ver pagamentos | ✅ |
| Criar contratos | ✅ |
| Ver relatórios | ✅ |
| Excluir registros | ✅ |
| Alterar configurações | ✅ |
| Gerenciar outros usuários | ✅ |
| Ver dados financeiros | ✅ |
| Controle Financeiro | ✅ |

### 👤 FUNCIONÁRIO (Acesso Limitado)

O funcionário tem acesso às funcionalidades operacionais, mas não pode alterar configurações ou ver dados financeiros.

| Funcionalidade | Permissão |
|----------------|----------|
| Visualizar leads/clientes | ✅ |
| Realizar novos cálculos | ✅ |
| Gerar Kit IR / PDFs | ✅ |
| Ver pagamentos | ✅ |
| Criar contratos | ✅ |
| Ver relatórios | ✅ |
| CRM - Ver todos clientes | ✅ |
| CRM - Alterar status | ✅ |
| CRM - Excluir | ❌ |
| Excluir registros | ❌ |
| Alterar configurações | ❌ |
| Gerenciar outros usuários | ❌ |
| Ver dados financeiros | ❌ |
| Controle Financeiro | ❌ |

### 🤝 PARCEIRO (Pessoa Física ou Jurídica)

O parceiro indica clientes e recebe comissão. Tem acesso limitado apenas aos seus próprios clientes.

| Funcionalidade | Permissão |
|----------------|----------|
| Cadastrar novos clientes | ✅ |
| Visualizar SEUS clientes | ✅ |
| Ver status/andamento SEUS clientes | ✅ |
| Ver comissões (suas) | ✅ |
| Visualizar TODOS os clientes | ❌ |
| Realizar cálculos | ❌ |
| Gerar Kit IR / PDFs | ❌ |
| Ver pagamentos gerais | ❌ |
| Criar contratos | ❌ |
| Ver relatórios gerais | ❌ |
| CRM - Alterar status | ❌ |
| CRM - Excluir | ❌ |
| Excluir registros | ❌ |
| Alterar configurações | ❌ |
| Gerenciar usuários | ❌ |
| Controle Financeiro | ❌ |

---

## 📋 FUNCIONALIDADES DO DASHBOARD

### 1. Tela de Login
- Login com e-mail e senha
- Identificação do nível de acesso (Admin/Funcionário)
- Recuperação de senha

### 2. Dashboard Principal (Home)
- Resumo de métricas (total de leads, cálculos, pagamentos)
- Notificações de novos cálculos externos
- Acesso rápido às principais funcionalidades

### 3. Gestão de Leads/Clientes
- Listagem de todos os clientes (externos + internos)
- Filtros por status, data, tipo
- Visualização detalhada de cada cliente
- Histórico de interações

### 4. Cálculos
- Realizar novo cálculo (clientes internos)
- Visualizar cálculos realizados
- Detalhamento por exercício
- Exportar dados

### 5. Kit IR e PDFs
- Gerar Esclarecimentos (PDF)
- Gerar PlanilhaRT (PDF)
- Download do Kit completo
- Envio por e-mail

### 6. Pagamentos (Externos)
- Status de pagamentos (Pendente, Pago, Cancelado)
- Histórico de transações
- Integração com Asaas

### 7. Contratos (Internos)
- Criar novo contrato
- Listar contratos
- **Futuro:** Integração ClickSign para assinatura eletrônica

### 7.1 CRM Interno

Controle de andamento e status de cada cliente no processo.

#### Status do Cliente
| Status | Descrição |
|--------|----------|
| 🆕 Novo | Cliente cadastrado, aguardando cálculo |
| 📊 Calculado | Cálculo realizado |
| 💰 Pago Básico | Pagou R$ 5,99 (externo) |
| 💰 Pago Kit IR | Pagou Kit IR (externo) |
| 📝 Contrato | Contrato fechado (interno) |
| 📧 Kit Enviado | Kit IR enviado por e-mail |
| ⏳ Em Análise | Documentação em análise na Receita |
| ✅ Concluído | Restituição recebida |
| ❌ Cancelado | Cliente desistiu |

#### Acesso ao CRM
| Nível | Ver Clientes | Alterar Status | Excluir |
|-------|--------------|----------------|--------|
| Admin | ✅ Todos | ✅ | ✅ |
| Funcionário | ✅ Todos | ✅ | ❌ |
| Parceiro | ✅ Seus | ❌ | ❌ |

### 8. Relatórios (Admin + Funcionário)
- Relatório de cálculos por período
- Relatório de conversão (leads → pagamentos)
- Exportar para Excel/PDF

### 9. Controle Financeiro (Apenas Admin)

Módulo completo para gestão financeira do negócio.

#### Receitas
| Tipo | Descrição |
|------|----------|
| Pagamentos Asaas | Recebimentos de clientes externos (PIX/Cartão) |
| Contratos | Valores de contratos fechados (clientes internos) |
| Por período | Visualização diária, semanal, mensal |

#### Despesas
| Tipo | Descrição |
|------|----------|
| Custos operacionais | Despesas gerais do negócio |
| Comissões | Pagamentos a funcionários |
| Taxas Asaas | Taxas cobradas pelo gateway |
| Outras | Cadastro manual de despesas |

#### Relatórios Financeiros
| Relatório | Descrição |
|-----------|----------|
| Faturamento mensal | Total de receitas por mês |
| Lucro/Prejuízo | Receitas - Despesas |
| Fluxo de caixa | Entradas e saídas por período |
| Exportação | Excel e PDF |

### 10. Configurações (Apenas Admin)
- Gerenciar usuários
- Alterar preços
- Configurações do sistema

### 11. Notificações
- Alerta de novo cálculo externo
- Alerta de novo pagamento
- Notificações em tempo real

---

## 🔔 NOTIFICAÇÕES

O sistema deve notificar quando houver:

| Evento | Notificação |
|--------|-------------|
| Novo cálculo externo | ✅ Alerta no dashboard |
| Novo pagamento | ✅ Alerta no dashboard |
| Pagamento confirmado | ✅ Alerta no dashboard |

---

## 🔧 IMPLEMENTAÇÃO FUTURA

| Funcionalidade | Status |
|----------------|--------|
| Contrato digital | ⏳ Futuro |
| Assinatura eletrônica (ClickSign) | ⏳ Futuro |
| App mobile | ⏳ Futuro |

---

## 📁 REFERÊNCIAS PARA PDFs

Os templates de PDF estão em:
- `referencias_pdfs/0-EsclarecimentosJoseRamos.pdf`
- `referencias_pdfs/6-PLanilhaRTJoséRamos.pdf`

Será necessário análise pixel a pixel para replicar o layout.
