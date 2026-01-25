# DESCRITIVO DETALHADO DO DASHBOARD - e-Restituição

**ID do Documento:** DASH-DESC-25JAN2026-1944
**Data:** 25/01/2026 - 19:44 (Horário de Brasília)
**Versão:** 1.0

---

## 1. VISÃO GERAL

O Dashboard é o **painel administrativo** do sistema e-Restituição, usado para gerenciar clientes, cálculos, pagamentos, geração de Kit IR e acompanhamento do CRM.

### 1.1 Estrutura de Arquivos

```
dashboard/
├── index.html              # Dashboard principal
├── login.html              # Tela de login
├── clientes.html           # Gestão de clientes
├── calculos.html           # Gestão de cálculos
├── crm.html                # CRM/Funil de vendas
├── kit-ir.html             # Geração de Kit IR
├── pagamentos.html         # Gestão de pagamentos
├── financeiro.html         # Controle financeiro
├── comissoes.html          # Comissões de parceiros
├── relatorios.html         # Relatórios
├── usuarios.html           # Gestão de usuários
├── configuracoes.html      # Configurações do sistema
├── css/
│   └── dashboard.css       # Estilos do dashboard
└── js/
    ├── auth.js             # Autenticação (217 linhas)
    ├── login.js            # Lógica de login
    ├── dashboard.js        # Dashboard principal (505 linhas)
    ├── clientes.js         # Gestão de clientes
    ├── calculos.js         # Gestão de cálculos
    ├── crm.js              # CRM
    ├── kit-ir.js           # Kit IR (1017 linhas)
    ├── pagamentos.js       # Pagamentos
    ├── financeiro.js       # Financeiro
    ├── comissoes.js        # Comissões
    ├── relatorios.js       # Relatórios
    ├── usuarios.js         # Usuários
    ├── configuracoes.js    # Configurações
    ├── firebase-config.js  # Config Firebase
    ├── firebase-service.js # Serviço Firebase
    └── utils.js            # Utilitários
```

---

## 2. SISTEMA DE AUTENTICAÇÃO (auth.js)

### 2.1 Usuários de Teste

| Email | Senha | Nome | Nível |
|-------|-------|------|-------|
| `admin@erestituicao.com.br` | `admin123` | Administrador | admin |
| `funcionario@erestituicao.com.br` | `func123` | João Silva | funcionario |
| `parceiro@erestituicao.com.br` | `parc123` | Maria Santos | parceiro |

### 2.2 Níveis de Acesso e Permissões

```javascript
const PERMISSOES = {
  admin: {
    visualizarTodosClientes: true,
    visualizarSeusClientes: true,
    cadastrarClientes: true,
    realizarCalculos: true,
    gerarKitIR: true,
    gerarPDFs: true,
    verPagamentos: true,
    criarContratos: true,
    verRelatorios: true,
    crmVerTodos: true,
    crmAlterarStatus: true,
    crmExcluir: true,
    excluirRegistros: true,
    alterarConfiguracoes: true,
    gerenciarUsuarios: true,
    verDadosFinanceiros: true,
    controleFinanceiro: true,
    verComissoes: true
  },
  funcionario: {
    visualizarTodosClientes: true,
    visualizarSeusClientes: true,
    cadastrarClientes: true,
    realizarCalculos: true,
    gerarKitIR: true,
    gerarPDFs: true,
    verPagamentos: true,
    criarContratos: true,
    verRelatorios: true,
    crmVerTodos: true,
    crmAlterarStatus: true,
    crmExcluir: false,          // ❌
    excluirRegistros: false,    // ❌
    alterarConfiguracoes: false,// ❌
    gerenciarUsuarios: false,   // ❌
    verDadosFinanceiros: false, // ❌
    controleFinanceiro: false,  // ❌
    verComissoes: false         // ❌
  },
  parceiro: {
    visualizarTodosClientes: false,  // ❌ Só vê seus clientes
    visualizarSeusClientes: true,
    cadastrarClientes: true,
    realizarCalculos: false,    // ❌
    gerarKitIR: false,          // ❌
    gerarPDFs: false,           // ❌
    verPagamentos: false,       // ❌
    criarContratos: false,      // ❌
    verRelatorios: false,       // ❌
    crmVerTodos: false,         // ❌
    crmAlterarStatus: false,    // ❌
    crmExcluir: false,          // ❌
    excluirRegistros: false,    // ❌
    alterarConfiguracoes: false,// ❌
    gerenciarUsuarios: false,   // ❌
    verDadosFinanceiros: false, // ❌
    controleFinanceiro: false,  // ❌
    verComissoes: true          // ✅ Só vê suas comissões
  }
};
```

### 2.3 Classe Auth

```javascript
class Auth {
  constructor() {
    this.usuario = null;
    this.carregarSessao();
  }

  login(email, senha) { /* Autentica usuário */ }
  logout() { /* Encerra sessão */ }
  estaLogado() { /* Verifica se logado */ }
  getUsuario() { /* Retorna usuário atual */ }
  temPermissao(permissao) { /* Verifica permissão */ }
  getNivel() { /* Retorna nível */ }
  getNivelFormatado() { /* Retorna nome do nível */ }
  salvarSessao() { /* Salva no localStorage */ }
  carregarSessao() { /* Carrega do localStorage */ }
  verificarAcesso(permissoes) { /* Verifica acesso à página */ }
  getIniciais() { /* Retorna iniciais do nome */ }
}

// Instância global
const auth = new Auth();
window.auth = auth;
```

---

## 3. DASHBOARD PRINCIPAL (index.html + dashboard.js)

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Busca | Sino Notificações | Avatar Usuário   │
├─────────────────────────────────────────────────────────────┤
│ SIDEBAR          │ MAIN CONTENT                             │
│                  │                                          │
│ 📊 Dashboard     │ ┌─────────┬─────────┬─────────┬────────┐│
│                  │ │ Total   │ Cálculos│ Total a │ Pagam. ││
│ 👥 Clientes      │ │Clientes │Realizad.│Restituir│ Hoje   ││
│ 📈 Cálculos      │ │   5     │   4     │R$158k   │R$43,96 ││
│ 📋 CRM          │ └─────────┴─────────┴─────────┴────────┘│
│                  │                                          │
│ OPERAÇÕES        │ ÚLTIMOS CLIENTES                         │
│ 📦 Kit IR        │ ┌────────────────────────────────────┐  │
│ 💳 Pagamentos    │ │ Nome | CPF | Status | Valor | Data │  │
│ 📝 Contratos     │ │ José | xxx | ✅     | 74k   | 25/01│  │
│                  │ │ Ana  | xxx | 💰     | 26k   | 24/01│  │
│ FINANCEIRO       │ └────────────────────────────────────┘  │
│ 💰 Financeiro    │                                          │
│ 📊 Relatórios    │                                          │
│                  │                                          │
│ PARCEIRO         │                                          │
│ 💵 Comissões     │                                          │
│                  │                                          │
│ ADMIN            │                                          │
│ 👤 Usuários      │                                          │
│ ⚙️ Configurações │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

### 3.2 Cards de Estatísticas

| Card | ID | Descrição | Visível para |
|------|-----|-----------|--------------|
| Total de Clientes | `statTotalClientes` | Quantidade de clientes | Todos |
| Cálculos Realizados | `statCalculos` | Quantidade de cálculos | Todos |
| Total a Restituir | `statRestituicao` | Soma dos valores | Todos |
| Pagamentos | `statPagamentos` | Valor recebido | Admin/Funcionário |

### 3.3 Status de Clientes

```javascript
const STATUS_LABELS = {
  novo: { texto: '🆕 Novo', classe: 'novo' },
  calculado: { texto: '📊 Calculado', classe: 'calculado' },
  pago_basico: { texto: '💰 Pago Básico', classe: 'pago' },
  pago_kit: { texto: '💰 Pago Kit IR', classe: 'pago' },
  contrato: { texto: '📝 Contrato', classe: 'contrato' },
  enviado: { texto: '📧 Kit Enviado', classe: 'enviado' },
  analise: { texto: '⏳ Em Análise', classe: 'analise' },
  concluido: { texto: '✅ Concluído', classe: 'concluido' },
  cancelado: { texto: '❌ Cancelado', classe: 'cancelado' }
};
```

### 3.4 Sistema de Notificações

```javascript
let NOTIFICACOES = [
  { 
    id: 1, 
    tipo: 'novo', 
    icone: '🆕', 
    texto: 'Novo cálculo realizado: Maria Fernanda Costa', 
    tempo: '5 min atrás', 
    lido: false 
  },
  { 
    id: 2, 
    tipo: 'pagamento', 
    icone: '💳', 
    texto: 'Pagamento confirmado: Ana Carmen Souza - R$ 5,99', 
    tempo: '1 hora atrás', 
    lido: false 
  },
  { 
    id: 3, 
    tipo: 'kit', 
    icone: '📦', 
    texto: 'Kit IR enviado para: José Ramos da Silva', 
    tempo: '3 horas atrás', 
    lido: true 
  }
];
```

**Funções:**
- `carregarNotificacoes()` - Carrega e exibe notificações
- `toggleNotificacoes()` - Abre/fecha dropdown
- `marcarComoLida(id)` - Marca notificação como lida
- `marcarTodasComoLidas()` - Marca todas como lidas

---

## 4. DADOS MOCKADOS (Temporários)

### 4.1 Clientes de Exemplo

```javascript
const CLIENTES_EXEMPLO = [
  {
    id: 1,
    nome: 'José Ramos da Silva',
    cpf: '070.817.318-72',
    email: 'jose.ramos@email.com',
    telefone: '(11) 99999-1234',
    status: 'concluido',
    valorRestituicao: 74028.67,
    dataCalculo: '2026-01-25',
    tipo: 'externo',
    parceiroId: null
  },
  {
    id: 2,
    nome: 'Ana Carmen Souza',
    cpf: '123.456.789-00',
    email: 'ana.carmen@email.com',
    telefone: '(11) 98888-5678',
    status: 'pago_kit',
    valorRestituicao: 26604.54,
    dataCalculo: '2026-01-24',
    tipo: 'externo',
    parceiroId: null
  },
  // ... mais clientes
];
```

**⚠️ IMPORTANTE:** Estes dados são **MOCKADOS** (falsos). Precisam ser substituídos pela integração real com o Firebase.

---

## 5. MÓDULO KIT IR (kit-ir.html + kit-ir.js)

### 5.1 Fluxo de Geração

```
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 1: BUSCAR CLIENTE                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔍 Buscar por nome ou CPF: [________________]           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ CLIENTE SELECIONADO:                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 José Ramos da Silva                                  ││
│ │ CPF: 070.817.318-72                                     ││
│ │ Processo: 0001234-56.2020.5.02.0001                     ││
│ │ Valor: R$ 74.028,67 | Status: ✅ Concluído              ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ETAPA 2: MONTAR SEÇÕES DO KIT                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [+ Adicionar Seção]                                     ││
│ │                                                         ││
│ │ 📄 ESCLARECIMENTOS (Auto)                               ││
│ │ 📋 PLANILHA RT (Auto)                                   ││
│ │ 🏛️ ALVARÁ [Arquivo: alvara.pdf]                        ││
│ │ ⚖️ SENTENÇA [Arquivo: sentenca.pdf]                    ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ETAPA 3: GERAR KIT IR                                       │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Resumo: 4 seções | 2 PDFs automáticos | 2 uploads       ││
│ │                                                         ││
│ │ [📦 GERAR KIT IR COMPLETO]                              ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Encartes Disponíveis

```javascript
const encartesDisponiveis = {
  esclarecimentos: { 
    nome: 'ESCLARECIMENTOS', 
    icone: '📄', 
    geradoAuto: true  // PDF gerado automaticamente
  },
  calculos_homologados: { 
    nome: 'CÁLCULOS HOMOLOGADOS', 
    icone: '📊', 
    geradoAuto: false // Precisa upload
  },
  homologacao_calculos: { 
    nome: 'HOMOLOGAÇÃO DE CÁLCULOS', 
    icone: '✅', 
    geradoAuto: false 
  },
  planilha_rt: { 
    nome: 'PLANILHA DE APURAÇÃO DE RENDIMENTO TRIBUTÁVEL', 
    icone: '📋', 
    geradoAuto: true  // PDF gerado automaticamente
  },
  requerimento: { 
    nome: 'REQUERIMENTO', 
    icone: '📝', 
    geradoAuto: false 
  },
  documentos_principais: { 
    nome: 'DOCUMENTOS PRINCIPAIS', 
    icone: '📁', 
    geradoAuto: false 
  },
  alvara: { 
    nome: 'ALVARÁ', 
    icone: '🏛️', 
    geradoAuto: false 
  },
  sentenca: { 
    nome: 'SENTENÇA', 
    icone: '⚖️', 
    geradoAuto: false 
  }
};
```

### 5.3 Histórico de Kits

```javascript
// Persistido no localStorage
let historicoKits = JSON.parse(localStorage.getItem('historicoKits') || '[]');

// Estrutura de um registro:
{
  id: 'KIT-1706234567890',
  clienteId: 'CLI-0001',
  clienteNome: 'José Ramos da Silva',
  clienteCpf: '070.817.318-72',
  dataGeracao: '2026-01-25T19:44:00.000Z',
  usuario: 'Administrador',
  secoes: ['esclarecimentos', 'planilha_rt', 'alvara'],
  status: 'gerado'
}
```

### 5.4 Funções Principais

| Função | Descrição |
|--------|-----------|
| `buscarCliente(termo)` | Busca cliente por nome ou CPF |
| `selecionarCliente(id)` | Seleciona cliente para Kit |
| `abrirModalEncarte()` | Abre modal para adicionar seção |
| `confirmarEncarte()` | Confirma adição de seção |
| `abrirModalArquivo()` | Abre modal para upload |
| `confirmarArquivo()` | Confirma upload de arquivo |
| `gerarKitIR()` | Gera o Kit IR completo |
| `carregarHistorico()` | Carrega histórico de Kits |
| `baixarKit(id)` | Baixa Kit gerado |

---

## 6. PÁGINAS DO DASHBOARD

### 6.1 Clientes (clientes.html)

**Funcionalidades:**
- Listar todos os clientes
- Buscar por nome, CPF, email
- Filtrar por status
- Ver detalhes do cliente
- Editar dados do cliente
- Excluir cliente (apenas admin)

### 6.2 Cálculos (calculos.html)

**Funcionalidades:**
- Listar todos os cálculos
- Ver detalhes do cálculo
- Refazer cálculo
- Exportar para PDF

### 6.3 CRM (crm.html)

**Funcionalidades:**
- Funil de vendas visual
- Arrastar clientes entre etapas
- Alterar status
- Adicionar observações
- Histórico de interações

### 6.4 Pagamentos (pagamentos.html)

**Funcionalidades:**
- Listar pagamentos
- Filtrar por status (pendente, pago, cancelado)
- Ver detalhes do pagamento
- Confirmar pagamento manual
- Estornar pagamento

### 6.5 Financeiro (financeiro.html)

**Funcionalidades:**
- Resumo financeiro
- Receitas x Despesas
- Gráficos de evolução
- Exportar relatórios

### 6.6 Comissões (comissoes.html)

**Funcionalidades:**
- Ver comissões do parceiro
- Filtrar por período
- Solicitar saque
- Histórico de pagamentos

### 6.7 Relatórios (relatorios.html)

**Funcionalidades:**
- Relatório de clientes
- Relatório de cálculos
- Relatório financeiro
- Exportar em PDF/Excel

### 6.8 Usuários (usuarios.html)

**Funcionalidades:**
- Listar usuários
- Criar novo usuário
- Editar permissões
- Desativar usuário
- Resetar senha

### 6.9 Configurações (configuracoes.html)

**Funcionalidades:**
- Configurações gerais
- Preços dos planos
- Integração Asaas
- Integração Firebase
- Configuração de emails

---

## 7. INTEGRAÇÃO FIREBASE NO DASHBOARD

### 7.1 Configuração

```javascript
// dashboard/js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyDsUP7_nLQEY_I_dLR-g1btemk8vEyD6AU",
  authDomain: "erestituicao-ffa5c.firebaseapp.com",
  projectId: "erestituicao-ffa5c",
  storageBucket: "erestituicao-ffa5c.firebasestorage.app",
  messagingSenderId: "46142652690",
  appId: "1:46142652690:web:ec56e882b3d446d65933cb"
};
```

### 7.2 Funções do Firebase Service

| Função | Descrição |
|--------|-----------|
| `listarCalculos(limite)` | Lista cálculos do Firebase |
| `buscarPorCPF(cpf)` | Busca cliente por CPF |
| `buscarPorAccessCode(code)` | Busca por código de acesso |
| `atualizarStatus(docId, status)` | Atualiza status do cliente |
| `atualizarPagamento(docId, dados)` | Atualiza dados de pagamento |

---

## 8. PENDÊNCIAS DO DASHBOARD

### 8.1 Dados Mockados a Substituir

| Componente | Arquivo | Linha | Descrição |
|------------|---------|-------|-----------|
| Clientes | dashboard.js | 6-67 | `CLIENTES_EXEMPLO` |
| Notificações | dashboard.js | 230-234 | `NOTIFICACOES` |
| Clientes Kit IR | kit-ir.js | 14-55 | `clientesMock` |
| Usuários | auth.js | 6-28 | `USUARIOS_TESTE` |

### 8.2 Funcionalidades Pendentes

| Funcionalidade | Status | Prioridade |
|----------------|--------|------------|
| Integrar clientes com Firebase | ❌ Pendente | Alta |
| Integrar notificações com Firebase | ❌ Pendente | Média |
| Geração real de PDFs | ❌ Pendente | Alta |
| Download do Kit IR | ❌ Pendente | Alta |
| Autenticação real (Firebase Auth) | ❌ Pendente | Média |
| Envio de email automático | ❌ Pendente | Baixa |

---

## 9. MENU DE NAVEGAÇÃO

### 9.1 Estrutura do Menu

```html
<!-- Sidebar -->
<nav class="sidebar">
  <!-- Principal -->
  <a href="index.html">📊 Dashboard</a>
  
  <!-- Clientes -->
  <a href="clientes.html">👥 Clientes</a>
  <a href="calculos.html">📈 Cálculos</a>
  <a href="crm.html">📋 CRM</a>
  
  <!-- Operações -->
  <div id="navOperacoes">
    <a href="kit-ir.html">📦 Kit IR</a>
    <a href="pagamentos.html">💳 Pagamentos</a>
  </div>
  
  <!-- Financeiro (Admin/Funcionário) -->
  <div id="navFinanceiro">
    <a href="financeiro.html">💰 Financeiro</a>
    <a href="relatorios.html">📊 Relatórios</a>
  </div>
  
  <!-- Parceiro -->
  <div id="navParceiro">
    <a href="comissoes.html">💵 Comissões</a>
  </div>
  
  <!-- Admin -->
  <div id="navAdmin">
    <a href="usuarios.html">👤 Usuários</a>
    <a href="configuracoes.html">⚙️ Configurações</a>
  </div>
</nav>
```

### 9.2 Visibilidade por Nível

| Menu | Admin | Funcionário | Parceiro |
|------|-------|-------------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ (só seus) |
| Cálculos | ✅ | ✅ | ❌ |
| CRM | ✅ | ✅ | ❌ |
| Kit IR | ✅ | ✅ | ❌ |
| Pagamentos | ✅ | ✅ | ❌ |
| Financeiro | ✅ | ❌ | ❌ |
| Relatórios | ✅ | ✅ | ❌ |
| Comissões | ✅ | ❌ | ✅ |
| Usuários | ✅ | ❌ | ❌ |
| Configurações | ✅ | ❌ | ❌ |

---

## 10. UTILITÁRIOS (utils.js)

```javascript
// Formatar moeda
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Formatar data
function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

// Formatar data e hora
function formatarDataHora(data) {
  return new Date(data).toLocaleString('pt-BR');
}

// Obter iniciais do nome
function getIniciais(nome) {
  const partes = nome.split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
}

// Formatar status
function formatarStatus(status) {
  const labels = {
    novo: 'Novo',
    calculado: 'Calculado',
    pago_basico: 'Pago Básico',
    pago_kit: 'Pago Kit IR',
    contrato: 'Contrato',
    enviado: 'Kit Enviado',
    analise: 'Em Análise',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
}

// Obter classe CSS do status
function getStatusClass(status) {
  const classes = {
    novo: 'secondary',
    calculado: 'info',
    pago_basico: 'success',
    pago_kit: 'success',
    contrato: 'warning',
    enviado: 'primary',
    analise: 'warning',
    concluido: 'success',
    cancelado: 'danger'
  };
  return classes[status] || 'secondary';
}
```

---

## 11. RESUMO DO ESTADO ATUAL

### 11.1 O que Funciona

| Componente | Status |
|------------|--------|
| Login/Logout | ✅ Funcionando |
| Controle de Permissões | ✅ Funcionando |
| Layout do Dashboard | ✅ Funcionando |
| Notificações (visual) | ✅ Funcionando |
| Busca de Clientes (mock) | ✅ Funcionando |
| Kit IR (interface) | ✅ Funcionando |
| Histórico Kit IR (localStorage) | ✅ Funcionando |

### 11.2 O que Precisa Ser Feito

| Componente | Status | Descrição |
|------------|--------|-----------|
| Integração Firebase | ❌ Pendente | Substituir dados mockados |
| Geração de PDFs | ❌ Pendente | Conectar com API de PDFs |
| Download Kit IR | ❌ Pendente | Gerar e baixar Kit completo |
| Autenticação Real | ❌ Pendente | Usar Firebase Auth |
| Envio de Emails | ❌ Pendente | Integrar com serviço de email |

---

**FIM DO DOCUMENTO**
