# DESCRITIVO DETALHADO DO FRONTEND - e-Restituição

**ID do Documento:** FRONT-DESC-25JAN2026-1944
**Data:** 25/01/2026 - 19:44 (Horário de Brasília)
**Versão:** 1.0

---

## 1. VISÃO GERAL

O Frontend do e-Restituição é um sistema de **funil de vendas em 3 etapas** para cálculo de restituição de IRPF sobre Rendimentos Recebidos Acumuladamente (RRA) de ações trabalhistas.

### 1.1 Estrutura de Arquivos

```
frontend/
├── index.html              # Página principal (formulário)
├── css/
│   ├── style.css           # Estilos principais
│   └── resultado.css       # Estilos da tela de resultado
├── img/
│   └── logo.jpg            # Logo do sistema
└── js/
    ├── app.js              # Aplicação principal (783 linhas)
    ├── masks.js            # Máscaras de campos (163 linhas)
    ├── validations.js      # Validações (400+ linhas)
    ├── resultado.js        # Módulo de resultado/pagamento (539 linhas)
    ├── irpf-calculator.js  # Motor de cálculo (196 linhas)
    ├── firebase-config.js  # Configuração Firebase (257 linhas)
    ├── firebase-service.js # Serviço Firebase (320 linhas)
    ├── tabBehavior.js      # Comportamento de Tab
    └── confirmacao.js      # Modal de confirmação
```

---

## 2. FLUXO DO FORMULÁRIO (4 STEPS)

### Step 1: Dados Pessoais
**Campos:**
| Campo | ID | Tipo | Máscara | Obrigatório |
|-------|-----|------|---------|-------------|
| Nome Completo | `nome` | text | Nome Próprio | ✅ Sim |
| Email | `email` | email | - | ✅ Sim |
| Telefone | `telefone` | tel | `(00) 00000-0000` | ✅ Sim |
| CPF | `cpf` | text | `000.000.000-00` | ✅ Sim |
| Data Nascimento | `dataNascimento` | date | - | ❌ Não |

**Validação de Email:**
- Gera código de 6 dígitos aleatório
- Exibe campo para digitar código
- Gera `accessCode` no formato `REST-XXXXXX`

### Step 2: Dados do Processo
**Campos:**
| Campo | ID | Tipo | Máscara | Obrigatório |
|-------|-----|------|---------|-------------|
| Nº Processo | `numeroProcesso` | text | `0000000-00.0000.0.00.0000` | ❌ Não |
| Vara | `vara` | text | `Xª Vara do Trabalho` | ❌ Não |
| Comarca | `comarca` | text | Nome Próprio | ❌ Não |
| Fonte Pagadora | `fontePagadora` | text | Nome Próprio + S/A | ❌ Não |
| CNPJ | `cnpj` | text | `00.000.000/0000-00` | ❌ Não |

### Step 3: Valores e Alvarás
**Campos Fixos:**
| Campo | ID | Tipo | Máscara | Obrigatório |
|-------|-----|------|---------|-------------|
| INSS Reclamante | `inss` | text | `R$ 0,00` | ❌ Não |
| Bruto Homologado | `brutoHomologado` | text | `R$ 0,00` | ✅ Sim |
| Tributável Homologado | `tributavelHomologado` | text | `R$ 0,00` | ✅ Sim |
| Número de Meses | `numeroMeses` | number | - | ✅ Sim |

**Campos Dinâmicos (Arrays):**

**Alvarás:**
- Valor: máscara `R$ 0,00`
- Data: máscara `DD/MM/AAAA`
- Mínimo: 1 alvará obrigatório

**DARFs:**
- Valor: máscara `R$ 0,00`
- Data: máscara `DD/MM/AAAA`
- Mínimo: 1 DARF obrigatório

**Honorários:**
- Valor: máscara `R$ 0,00`
- Ano Pago: select (2015 até ano atual)
- Mínimo: 0 (opcional)

### Step 4: Resultado
Exibido pelo módulo `resultado.js` em 3 etapas de pagamento.

---

## 3. MÁSCARAS (masks.js)

### 3.1 Funções de Máscara

| Função | Entrada | Saída | Exemplo |
|--------|---------|-------|---------|
| `maskCPF(value)` | `07081731872` | `070.817.318-72` | CPF formatado |
| `maskPhone(value)` | `11999991234` | `(11) 99999-1234` | Telefone formatado |
| `maskCNPJ(value)` | `12345678000100` | `12.345.678/0001-00` | CNPJ formatado |
| `maskMoney(value)` | `7402867` | `R$ 74.028,67` | Moeda brasileira |
| `maskDate(value)` | `25012026` | `25/01/2026` | Data DD/MM/AAAA |

### 3.2 Funções de Conversão

| Função | Descrição | Exemplo |
|--------|-----------|---------|
| `moneyToNumber(value)` | Converte moeda para número | `R$ 74.028,67` → `74028.67` |
| `numberToMoney(value)` | Converte número para moeda | `74028.67` → `R$ 74.028,67` |
| `dateToISO(value)` | Converte data BR para ISO | `25/01/2026` → `2026-01-25` |
| `isoToDate(value)` | Converte data ISO para BR | `2026-01-25` → `25/01/2026` |

---

## 4. VALIDAÇÕES (validations.js)

### 4.1 Validação de CPF
```javascript
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  // Verifica se tem 11 dígitos
  // Verifica se todos os dígitos são iguais
  // Calcula primeiro dígito verificador
  // Calcula segundo dígito verificador
  // Retorna true/false
}
```

### 4.2 Validação de CNPJ
```javascript
function validarCNPJ(cnpj) {
  // Remove caracteres não numéricos
  // Verifica se tem 14 dígitos
  // Verifica se todos os dígitos são iguais
  // Calcula primeiro dígito verificador
  // Calcula segundo dígito verificador
  // Retorna true/false
}
```

### 4.3 Formatação de Nomes

| Função | Descrição | Exemplo |
|--------|-----------|---------|
| `formatarNomeProprio(texto)` | Iniciais maiúsculas, preposições minúsculas | `jose da silva` → `José da Silva` |
| `formatarFontePagadora(texto)` | Nome próprio + S/A, Ltda., ME, EPP | `banco do brasil sa` → `Banco do Brasil S/A` |
| `formatarVara(texto)` | Número + ª + Vara | `1 vara trabalho` → `1ª Vara do Trabalho` |

### 4.4 Máscara de Processo
```javascript
function maskProcesso(value) {
  // Formato: XXXXXXX-XX.XXXX.X.XX.XXXX
  // Total: 20 dígitos
}
```

---

## 5. MOTOR DE CÁLCULO (irpf-calculator.js)

### 5.1 Constantes

**Índices IPCA-E (84 meses):**
```javascript
const IPCA_E_INDICES = {
  "2020-01": 1.39532486,
  "2020-02": 1.385487896,
  // ... até ...
  "2026-01": 1.000000000
};
```

**Tabelas de IR:**
```javascript
// Tabela 2015-2023
const TABELA_IR_2015_2023 = [
  { min: 0, max: 1903.98, aliquota: 0, deducao: 0 },
  { min: 1903.99, max: 2826.65, aliquota: 0.075, deducao: 142.80 },
  { min: 2826.66, max: 3751.05, aliquota: 0.15, deducao: 354.80 },
  { min: 3751.06, max: 4664.68, aliquota: 0.225, deducao: 636.13 },
  { min: 4664.69, max: Infinity, aliquota: 0.275, deducao: 869.36 }
];

// Tabela 2024 (Fevereiro)
const TABELA_IR_2024_FEV = [
  { min: 0, max: 2259.20, aliquota: 0, deducao: 0 },
  // ...
];

// Tabela 2026
const TABELA_IR_2026 = [
  { min: 0, max: 2428.80, aliquota: 0, deducao: 0 },
  // ...
];
```

### 5.2 Regra da Chave Seletora

**CRÍTICO:** Esta é a regra mais importante do sistema!

```javascript
const anosUnicos = new Set();
alvaras.forEach(a => {
  const d = parseDataUTC(a.data);
  if (d) anosUnicos.add(d.getUTCFullYear());
});

const ehMesmoAno = anosUnicos.size === 1;
const usarDeflacaoAjustado = ehMesmoAno ? false : usarDeflacao;
```

| Situação | `ehMesmoAno` | Deflação IPCA-E |
|----------|--------------|-----------------|
| Todos alvarás do mesmo ano | `true` | ❌ NÃO aplica |
| Alvarás de anos diferentes | `false` | ✅ APLICA |

### 5.3 Fórmulas de Cálculo

**Proporção Tributável:**
```
proporcaoTributavel = tributavelHomologado / brutoHomologado
```

**Valor Deflacionado (se múltiplos anos):**
```
valorDeflacionado = valorOriginal × indiceIpca
```

**DARF Proporcional:**
```
// Mesmo ano:
darfProporcional = totalDarfOriginal

// Múltiplos anos:
darfProporcional = (totalDarfOriginal × proporcaoAlvara) / indiceIpca
```

**Rendimento Tributável por Alvará:**
```
rtAlvara = (valorOriginal + darfProporcional) × proporcaoTributavel
```

**IR Devido (RRA):**
```
rra = baseCalculo / numeroMeses
irDevido = (aliquota × rra - deducao) × numeroMeses
```

**IRPF a Restituir:**
```
irpf = irrf - irDevido
```

### 5.4 Funções Exportadas

```javascript
window.IRPFCalculator = {
  calcular: calcularIRPF,
  limparValorBR,
  formatarMoedaBR,
  parseDataUTC,
  arredondarFinanceiro
};
```

---

## 6. MÓDULO DE RESULTADO (resultado.js)

### 6.1 Preços

```javascript
const PRECOS = {
  basico: {
    teste: 5.99,
    producao: 29.90
  },
  completo: {
    teste: 15.99,
    producao: 2500.00
  }
};

const MODO_TESTE = true; // Altera para false em produção
```

### 6.2 As 3 Etapas do Funil

| Etapa | Função | O que mostra | Preço |
|-------|--------|--------------|-------|
| 1 | `exibirResultadoInicial()` | "Parabéns! Você tem valor a restituir!" + botão "DESCUBRA SEU VALOR" | R$ 5,99 |
| 2 | `exibirResultadoAposBasico()` | Valor total + detalhamento + botão "FAÇA VOCÊ MESMO" (Kit IR) | R$ 10,00 (com abatimento) |
| 3 | `exibirResultadoAposCompleto()` | Mensagem Kit enviado + botão "ESPECIALISTA" | WhatsApp |

### 6.3 Abatimento de Valor

```javascript
function calcularPrecoComAbatimento() {
  if (resultadoState.planoBasicoPago) {
    return Math.max(0, PRECO_COMPLETO - PRECO_BASICO);
  }
  return PRECO_COMPLETO;
}
```

**Exemplo:**
- Plano Básico: R$ 5,99
- Plano Completo: R$ 15,99
- Com abatimento: R$ 15,99 - R$ 5,99 = **R$ 10,00**

### 6.4 Fluxo de Pagamento

```javascript
// ⚠️ PROBLEMA ATUAL - Esta URL não funciona no Manus
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('manus.computer')
  ? 'http://localhost:3001/api'  // ❌ NÃO EXISTE
  : '/api';
```

**Processo:**
1. Usuário clica em "DESCOBRIR AGORA" ou "QUERO O KIT IR"
2. Modal de pagamento aparece (PIX ou Cartão)
3. Sistema chama `API_URL/create-payment`
4. **PROBLEMA:** `localhost:3001` não existe, sistema quebra

### 6.5 WhatsApp do Especialista

```javascript
const WHATSAPP_ESPECIALISTA = '5511941139391';

function contatarEspecialista() {
  const mensagem = encodeURIComponent('Olá! Gostaria de contratar um Especialista...');
  const url = `https://api.whatsapp.com/send/?phone=${WHATSAPP_ESPECIALISTA}&text=${mensagem}`;
  window.open(url, '_blank');
}
```

---

## 7. INTEGRAÇÃO FIREBASE

### 7.1 Configuração

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDsUP7_nLQEY_I_dLR-g1btemk8vEyD6AU",
  authDomain: "erestituicao-ffa5c.firebaseapp.com",
  projectId: "erestituicao-ffa5c",
  storageBucket: "erestituicao-ffa5c.firebasestorage.app",
  messagingSenderId: "46142652690",
  appId: "1:46142652690:web:ec56e882b3d446d65933cb"
};

const COLECAO_CALCULOS = 'calculos2026';
```

### 7.2 Estrutura do Documento

```javascript
{
  tipoCalculo: 'multi_anos' | 'mesmo_ano',
  accessCode: 'REST-XXXXXX',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  cliente: {
    nomeCompleto: 'JOSÉ RAMOS DA SILVA',
    cpf: '070.817.318-72',
    dataNascimento: '1980-01-15',
    email: 'jose@email.com',
    telefone: '(11) 99999-1234'
  },
  
  processo: {
    numeroProcesso: '0001234-56.2020.5.02.0001',
    comarca: 'São Paulo',
    vara: '1ª Vara do Trabalho',
    fontePagadora: 'Banco do Brasil S/A',
    cnpj: '00.000.000/0001-91'
  },
  
  valores: {
    brutoHomologado: 25333298500,  // Em centavos
    tributavelHomologado: 20000000000,
    numeroMeses: 49
  },
  
  alvaras: [
    { numero: 1, valor: 10000000000, data: '15/03/2020', anoEquivalente: 2021 },
    { numero: 2, valor: 8000000000, data: '20/06/2021', anoEquivalente: 2022 }
  ],
  
  darfs: [
    { numero: 1, valor: 5000000000, data: '15/04/2020' }
  ],
  
  honorarios: [
    { numero: 1, valor: 2000000000, anoPago: 2020 }
  ],
  
  resultadosPorAno: [
    { anoExercicio: 2021, rendimentoTributavel: X, irpfDevido: Y, irrfRetido: Z, irpfRestituir: W }
  ],
  
  totais: {
    somaAlvaras: 18000000000,
    somaDarfs: 5000000000,
    irpfTotalRestituir: 7402867,  // R$ 74.028,67
    irDevido: 1234567
  },
  
  status: {
    pagamento: 'pendente' | 'pago_etapa1' | 'pago_etapa2',
    kitIR: 'pendente' | 'gerado' | 'enviado',
    email: 'pendente' | 'enviado'
  },
  
  pagamento: {
    assinaturaId: 'pay_xxxxx',
    plano: 'Starter' | 'Kit IR',
    valorPago: 599,  // Em centavos
    dataPagamento: Timestamp
  },
  
  pdfs: {
    documento1: null,
    documento2: null,
    kitCompleto: null
  }
}
```

### 7.3 Funções do Firebase Service

| Função | Descrição |
|--------|-----------|
| `salvarCalculoFirebase(dados, resultado)` | Salva novo cálculo |
| `atualizarPagamento(docId, dados)` | Atualiza status de pagamento |
| `buscarPorAccessCode(code)` | Busca por código de acesso |
| `buscarPorCPF(cpf)` | Busca por CPF |
| `listarCalculos(limite)` | Lista todos os cálculos |

---

## 8. ESTADO DA APLICAÇÃO (app.js)

```javascript
let state = {
  currentStep: 1,
  emailValidado: false,
  accessCode: null,
  dadosFormulario: {},
  resultado: null,
  alvaras: [],
  darfs: [],
  honorarios: [],
  codigoVerificacao: null,
  firebaseDocId: null
};
```

---

## 9. CASOS DE TESTE VALIDADOS

### Caso 1: José Ramos da Silva
- **Tipo:** Múltiplos Anos (2020, 2021, 2022)
- **Bruto Homologado:** R$ 253.332.985,00
- **Tributável:** R$ 200.000.000,00
- **Meses:** 49
- **Resultado Esperado:** R$ 74.028,67 a restituir

### Caso 2: Ana Carmen Souza
- **Tipo:** Mesmo Ano (2022)
- **Bruto Homologado:** R$ 1.387.659,26
- **Tributável:** R$ 1.387.659,26
- **Meses:** 49
- **Resultado Esperado:** R$ 26.604,54 a restituir

---

## 10. PROBLEMA ATUAL IDENTIFICADO

**Arquivo:** `resultado.js` (linha 83-85)

```javascript
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('manus.computer')
  ? 'http://localhost:3001/api'  // ❌ ESTE SERVIDOR NÃO EXISTE
  : '/api';
```

**Sintoma:** Quando clica em "Pagar" no ambiente Manus, o sistema tenta chamar `localhost:3001` que não existe, causando erro e voltando para a página inicial.

**Solução Proposta:** Alterar para usar a API do Render que já funciona:
```javascript
const API_URL = 'https://assas-payment-new-account.onrender.com';
```

---

## 11. DEPENDÊNCIAS EXTERNAS

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| Firebase SDK | 10.7.1 | Banco de dados |
| Google Fonts (Inter) | - | Tipografia |

---

**FIM DO DOCUMENTO**
