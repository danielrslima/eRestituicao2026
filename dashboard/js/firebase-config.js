/**
 * Configuração do Firebase para e-Restituição 2026
 * Projeto: erestituicao-ffa5c
 * Coleção: calculos2026
 * 
 * IMPORTANTE: Esta configuração usa a nova estrutura de dados
 * com valores em centavos e arrays dinâmicos.
 */

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsUP7_nLQEY_I_dLR-g1btemk8vEyD6AU",
  authDomain: "erestituicao-ffa5c.firebaseapp.com",
  projectId: "erestituicao-ffa5c",
  storageBucket: "erestituicao-ffa5c.firebasestorage.app",
  messagingSenderId: "46142652690",
  appId: "1:46142652690:web:ec56e882b3d446d65933cb"
};

// Nome da coleção principal (nova estrutura)
const COLECAO_CALCULOS = 'calculos2026';

// Coleção antiga (apenas para referência/migração)
const COLECAO_ANTIGA = 'formularios';

/**
 * Utilitários para conversão de valores
 */
const FirebaseUtils = {
  
  /**
   * Converte valor em reais para centavos
   * @param {string|number} valor - Valor em reais (ex: "253.332.985,00" ou 253332985.00)
   * @returns {number} Valor em centavos
   */
  reaisParaCentavos: function(valor) {
    if (valor === null || valor === undefined || valor === '') return 0;
    
    // Se já for número, multiplica por 100
    if (typeof valor === 'number') {
      return Math.round(valor * 100);
    }
    
    // Remove formatação brasileira e converte
    const limpo = valor.toString()
      .replace(/[R$\s]/g, '')     // Remove R$ e espaços
      .replace(/\./g, '')         // Remove pontos de milhar
      .replace(',', '.');         // Troca vírgula por ponto
    
    const numero = parseFloat(limpo);
    return isNaN(numero) ? 0 : Math.round(numero * 100);
  },
  
  /**
   * Converte centavos para valor formatado em reais
   * @param {number} centavos - Valor em centavos
   * @returns {string} Valor formatado (ex: "R$ 253.332.985,00")
   */
  centavosParaReais: function(centavos) {
    if (centavos === null || centavos === undefined || isNaN(centavos)) {
      return 'R$ 0,00';
    }
    
    return (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },
  
  /**
   * Converte centavos para número decimal (para cálculos)
   * @param {number} centavos - Valor em centavos
   * @returns {number} Valor decimal
   */
  centavosParaDecimal: function(centavos) {
    if (centavos === null || centavos === undefined || isNaN(centavos)) {
      return 0;
    }
    return centavos / 100;
  },
  
  /**
   * Formata CPF
   * @param {string} cpf - CPF sem formatação
   * @returns {string} CPF formatado (ex: "003.003.987-86")
   */
  formatarCPF: function(cpf) {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },
  
  /**
   * Formata telefone
   * @param {string} telefone - Telefone sem formatação
   * @returns {string} Telefone formatado
   */
  formatarTelefone: function(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  },
  
  /**
   * Gera timestamp atual
   * @returns {string} ISO timestamp
   */
  agora: function() {
    return new Date().toISOString();
  },
  
  /**
   * Formata data para exibição
   * @param {string} isoDate - Data ISO
   * @returns {string} Data formatada (ex: "25/01/2026 12:30")
   */
  formatarDataHora: function(isoDate) {
    if (!isoDate) return '';
    const data = new Date(isoDate);
    return data.toLocaleString('pt-BR');
  }
};

/**
 * Estrutura padrão de um documento de cálculo
 */
function criarDocumentoCalculo(tipoCalculo = 'multi_anos') {
  return {
    // Identificação
    tipoCalculo: tipoCalculo,
    createdAt: FirebaseUtils.agora(),
    updatedAt: FirebaseUtils.agora(),
    
    // Dados do Cliente
    cliente: {
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      email: '',
      telefone: ''
    },
    
    // Dados do Processo
    processo: {
      numeroProcesso: '',
      comarca: '',
      vara: '',
      fontePagadora: '',
      cnpj: ''
    },
    
    // Valores Principais (em centavos)
    valores: {
      brutoHomologado: 0,
      tributavelHomologado: 0,
      numeroMeses: 0
    },
    
    // Arrays dinâmicos
    alvaras: [],
    darfs: [],
    honorarios: [],
    resultadosPorAno: [],
    
    // Totais (em centavos)
    totais: {
      somaAlvaras: 0,
      somaDarfs: 0,
      irpfTotalRestituir: 0,
      irDevido: 0
    },
    
    // Status
    status: {
      pagamento: 'pendente',
      kitIR: 'pendente',
      email: 'pendente'
    },
    
    // Pagamento
    pagamento: {
      assinaturaId: '',
      plano: '',
      valorPago: 0,
      dataPagamento: null
    },
    
    // PDFs
    pdfs: {
      documento1: null,
      documento2: null,
      documento3: null,
      esclarecimento1: null,
      esclarecimento2: null,
      kitCompleto: null
    }
  };
}

/**
 * Adiciona um alvará ao documento
 */
function adicionarAlvara(documento, valor, data, anoEquivalente) {
  const numero = documento.alvaras.length + 1;
  documento.alvaras.push({
    numero: numero,
    valor: FirebaseUtils.reaisParaCentavos(valor),
    data: data,
    anoEquivalente: parseInt(anoEquivalente),
    valorCorrigido: 0,  // Será calculado
    selicAcumulada: 0   // Será calculado
  });
  documento.updatedAt = FirebaseUtils.agora();
  return documento;
}

/**
 * Adiciona um DARF ao documento
 */
function adicionarDarf(documento, valor, data) {
  const numero = documento.darfs.length + 1;
  documento.darfs.push({
    numero: numero,
    valor: FirebaseUtils.reaisParaCentavos(valor),
    data: data,
    valorCorrigido: 0  // Será calculado
  });
  documento.updatedAt = FirebaseUtils.agora();
  return documento;
}

/**
 * Adiciona honorários ao documento
 */
function adicionarHonorario(documento, valor, data) {
  const numero = documento.honorarios.length + 1;
  documento.honorarios.push({
    numero: numero,
    valor: FirebaseUtils.reaisParaCentavos(valor),
    data: data
  });
  documento.updatedAt = FirebaseUtils.agora();
  return documento;
}

// Exportar para uso global
window.firebaseConfig = firebaseConfig;
window.COLECAO_CALCULOS = COLECAO_CALCULOS;
window.FirebaseUtils = FirebaseUtils;
window.criarDocumentoCalculo = criarDocumentoCalculo;
window.adicionarAlvara = adicionarAlvara;
window.adicionarDarf = adicionarDarf;
window.adicionarHonorario = adicionarHonorario;

console.log('✅ Firebase Config carregado - Coleção:', COLECAO_CALCULOS);
