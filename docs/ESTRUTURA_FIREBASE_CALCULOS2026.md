# Estrutura de Dados - Coleção `calculos2026`

## Projeto Firebase
- **Nome**: eRestituicao
- **ID**: erestituicao-ffa5c
- **Plano**: Blaze (pago)
- **Localização**: southamerica-east1 (São Paulo)

## FirebaseConfig
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDsUP7_nLQEY_I_dLR-g1btemk8vEyD6AU",
  authDomain: "erestituicao-ffa5c.firebaseapp.com",
  projectId: "erestituicao-ffa5c",
  storageBucket: "erestituicao-ffa5c.firebasestorage.app",
  messagingSenderId: "46142652690",
  appId: "1:46142652690:web:ec56e882b3d446d65933cb"
};
```

---

## Estrutura do Documento

### Coleção: `calculos2026`

Cada documento representa um cálculo de restituição de IR.

```javascript
{
  // ========== IDENTIFICAÇÃO ==========
  id: string,                    // ID automático do Firestore
  tipoCalculo: string,           // "mesmo_ano" | "multi_anos"
  createdAt: timestamp,          // Data/hora de criação
  updatedAt: timestamp,          // Data/hora de última atualização
  
  // ========== DADOS DO CLIENTE ==========
  cliente: {
    nomeCompleto: string,        // "JOSÉ RAMOS DA SILVA"
    cpf: string,                 // "003.003.987-86" (formatado)
    dataNascimento: string,      // "25/08/1969" (DD/MM/YYYY)
    email: string,               // "jose@email.com"
    telefone: string,            // "(27) 99999-9999"
  },
  
  // ========== DADOS DO PROCESSO ==========
  processo: {
    numeroProcesso: string,      // "0001971-78.2015.5.17.0007"
    comarca: string,             // "Vitória"
    vara: string,                // "07ª Vara do Trabalho"
    fontePagadora: string,       // Nome da empresa/órgão
    cnpj: string,                // CNPJ da fonte pagadora
  },
  
  // ========== VALORES PRINCIPAIS (em centavos) ==========
  valores: {
    brutoHomologado: number,     // 25333298500 (R$ 253.332.985,00 em centavos)
    tributavelHomologado: number,// Valor tributável em centavos
    numeroMeses: number,         // 58 (número inteiro)
  },
  
  // ========== ALVARÁS (Array dinâmico) ==========
  alvaras: [
    {
      numero: number,            // 1, 2, 3...
      valor: number,             // Valor em centavos
      data: string,              // "24/12/2020" (DD/MM/YYYY)
      anoEquivalente: number,    // 2021
      valorCorrigido: number,    // Valor corrigido pela SELIC em centavos
      selicAcumulada: number,    // 52.39 (percentual)
    }
  ],
  
  // ========== DARFs (Array dinâmico) ==========
  darfs: [
    {
      numero: number,            // 1, 2, 3...
      valor: number,             // Valor em centavos
      data: string,              // "24/12/2020" (DD/MM/YYYY)
      valorCorrigido: number,    // Valor corrigido pela SELIC em centavos
    }
  ],
  
  // ========== HONORÁRIOS (Array dinâmico) ==========
  honorarios: [
    {
      numero: number,            // 1, 2, 3...
      valor: number,             // Valor em centavos
      data: string,              // "24/12/2020" (DD/MM/YYYY)
    }
  ],
  
  // ========== RESULTADOS POR ANO (para multi_anos) ==========
  resultadosPorAno: [
    {
      anoExercicio: number,      // 2021, 2022, etc.
      rendimentoTributavel: number,  // em centavos
      irpfDevido: number,        // em centavos
      irrfRetido: number,        // em centavos (corrigido)
      irpfRestituir: number,     // em centavos
    }
  ],
  
  // ========== TOTAIS FINAIS ==========
  totais: {
    somaAlvaras: number,         // Total alvarás corrigidos em centavos
    somaDarfs: number,           // Total DARFs corrigidos em centavos
    irpfTotalRestituir: number,  // Total a restituir em centavos
    irDevido: number,            // IR devido total em centavos
  },
  
  // ========== STATUS E PAGAMENTO ==========
  status: {
    pagamento: string,           // "pendente" | "pago_etapa1" | "pago_completo"
    kitIR: string,               // "pendente" | "gerado" | "enviado"
    email: string,               // "pendente" | "enviado"
  },
  
  // ========== DADOS DE PAGAMENTO (Asaas) ==========
  pagamento: {
    assinaturaId: string,        // ID da assinatura no Asaas
    plano: string,               // "Starter" | "Pro" | "Premium"
    valorPago: number,           // em centavos
    dataPagamento: timestamp,    // Data do pagamento
  },
  
  // ========== PDFs GERADOS ==========
  pdfs: {
    documento1: string | null,   // URL do PDF
    documento2: string | null,
    documento3: string | null,
    esclarecimento1: string | null,
    esclarecimento2: string | null,
    kitCompleto: string | null,  // URL do Kit IR completo
  },
}
```

---

## Regras de Negócio

### 1. Valores em Centavos
Todos os valores monetários são armazenados em **centavos** (inteiros):
- R$ 253.332.985,00 → 25333298500
- R$ 1.234,56 → 123456

**Vantagens:**
- Evita problemas com ponto flutuante
- Não há confusão com vírgula/ponto
- Cálculos precisos

### 2. Conversão para Exibição
```javascript
// Centavos para Reais (exibição)
function centavosParaReais(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Reais para Centavos (entrada)
function reaisParaCentavos(valor) {
  // Remove formatação e converte
  const limpo = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
  return Math.round(parseFloat(limpo) * 100);
}
```

### 3. Tipos de Cálculo

#### Mesmo Ano (`tipoCalculo: "mesmo_ano"`)
- RRA recebido no mesmo ano do ajuizamento
- Cálculo mais simples
- Apenas um ano de exercício

#### Multi Anos (`tipoCalculo: "multi_anos"`)
- RRA abrange múltiplos anos
- Cálculo proporcional por ano
- Array `resultadosPorAno` preenchido

### 4. Arrays Dinâmicos
- Alvarás, DARFs e Honorários são arrays
- Sem limite de quantidade
- Cada item tem seu próprio índice

---

## Índices Recomendados

Para otimizar consultas, criar índices no Firestore:

1. `cliente.cpf` (ASC)
2. `createdAt` (DESC)
3. `status.pagamento` (ASC) + `createdAt` (DESC)
4. `cliente.nomeCompleto` (ASC)

---

## Migração de Dados Antigos

Se necessário migrar dados da coleção `formularios`:

```javascript
// Exemplo de migração
function migrarDocumento(docAntigo) {
  return {
    tipoCalculo: 'multi_anos',
    cliente: {
      nomeCompleto: docAntigo.userData?.nomeCompleto || docAntigo.nomeCompleto,
      cpf: docAntigo.userData?.cpf || docAntigo.cpf,
      // ... outros campos
    },
    valores: {
      brutoHomologado: converterParaCentavos(docAntigo.brutoHomologado),
      // ... outros campos
    },
    // ... resto da estrutura
  };
}
```

---

## Criado em: 25/01/2026 às 12:46 (Horário de Brasília)
