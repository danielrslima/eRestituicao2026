/**
 * Firebase Service - e-Restituição 2026
 * Serviço para interação com Firestore
 * Coleção: calculos2026
 * 
 * IMPORTANTE: Todos os valores monetários são salvos em CENTAVOS
 */

// Inicializa Firebase
let db = null;

function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  console.log('✅ Firebase inicializado - Coleção:', COLECAO_CALCULOS);
  return db;
}

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', function() {
  try {
    initFirebase();
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
  }
});

/**
 * Salva um novo cálculo no Firebase
 * @param {Object} dadosCalculo - Dados do cálculo do frontend
 * @param {Object} resultado - Resultado do cálculo da API
 * @returns {Promise<string>} ID do documento criado
 */
async function salvarCalculoFirebase(dadosCalculo, resultado) {
  if (!db) {
    initFirebase();
  }
  
  try {
    // Determina o tipo de cálculo baseado nos resultados - Compatível com IRPFCalculator
    const tipoCalculo = resultado.tipoCalculo || 
      ((resultado.exercicios || resultado.resultadosPorAno || []).length > 1 ? 'multi_anos' : 'mesmo_ano');
    
    // Monta o documento na nova estrutura
    const documento = {
      // Identificação
      tipoCalculo: tipoCalculo,
      accessCode: dadosCalculo.accessCode || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      
      // Dados do Cliente
      cliente: {
        nomeCompleto: (dadosCalculo.nome || '').toUpperCase(),
        cpf: dadosCalculo.cpf || '',
        dataNascimento: dadosCalculo.dataNascimento || '',
        email: dadosCalculo.email || '',
        telefone: dadosCalculo.telefone || ''
      },
      
      // Dados do Processo
      processo: {
        numeroProcesso: dadosCalculo.processo || '',
        comarca: dadosCalculo.comarca || '',
        vara: dadosCalculo.vara || '',
        fontePagadora: dadosCalculo.fontePagadora || '',
        cnpj: dadosCalculo.cnpj || ''
      },
      
      // Valores Principais (em centavos)
      valores: {
        brutoHomologado: FirebaseUtils.reaisParaCentavos(dadosCalculo.brutoHomologado),
        tributavelHomologado: FirebaseUtils.reaisParaCentavos(dadosCalculo.tributavelHomologado),
        numeroMeses: parseInt(dadosCalculo.numeroMeses) || 0
      },
      
      // Alvarás (convertidos para centavos)
      alvaras: (dadosCalculo.alvaras || []).map((alvara, index) => ({
        numero: index + 1,
        valor: FirebaseUtils.reaisParaCentavos(alvara.valor),
        data: formatarDataParaBR(alvara.data),
        anoEquivalente: extrairAnoEquivalente(alvara.data),
        valorCorrigido: 0,
        selicAcumulada: 0
      })),
      
      // DARFs (convertidos para centavos)
      darfs: (dadosCalculo.darfs || []).map((darf, index) => ({
        numero: index + 1,
        valor: FirebaseUtils.reaisParaCentavos(darf.valor),
        data: formatarDataParaBR(darf.data),
        valorCorrigido: 0
      })),
      
      // Honorários (convertidos para centavos)
      honorarios: (dadosCalculo.honorarios || []).map((hon, index) => ({
        numero: index + 1,
        valor: FirebaseUtils.reaisParaCentavos(hon.valor),
        anoPago: hon.anoPago || 0
      })),
      
      // Resultados por Ano (do cálculo) - Compatível com IRPFCalculator
      resultadosPorAno: (resultado.exercicios || resultado.resultadosPorAno || []).map(ano => ({
        anoExercicio: ano.exercicio || ano.anoExercicio,
        rendimentoTributavel: FirebaseUtils.reaisParaCentavos(ano.rendimentosTributaveis || ano.rendimentoTributavel || 0),
        irpfDevido: FirebaseUtils.reaisParaCentavos(ano.irDevido || ano.irpfDevido || 0),
        irrfRetido: FirebaseUtils.reaisParaCentavos(ano.irrf || ano.irrfRetido || ano.irrfCorrigido || 0),
        irpfRestituir: FirebaseUtils.reaisParaCentavos(ano.irpf || ano.irpfRestituir || ano.restituicao || 0)
      })),
      
      // Totais (em centavos) - Compatível com IRPFCalculator
      totais: {
        somaAlvaras: FirebaseUtils.reaisParaCentavos(resultado.totalAlvarasDeflacionados || resultado.somaAlvaras || 0),
        somaDarfs: FirebaseUtils.reaisParaCentavos(resultado.totalDarfOriginal || resultado.somaDarfs || 0),
        irpfTotalRestituir: FirebaseUtils.reaisParaCentavos(resultado.totalIrpf || resultado.totalRestituir || resultado.irpfRestituir || 0),
        irDevido: FirebaseUtils.reaisParaCentavos((resultado.exercicios || []).reduce((s, e) => s + (e.irDevido || 0), 0) || resultado.irDevido || 0)
      },
      
      // Status
      status: {
        pagamento: 'pendente',
        kitIR: 'pendente',
        email: 'pendente'
      },
      
      // Pagamento (será preenchido após pagamento)
      pagamento: {
        assinaturaId: '',
        plano: '',
        valorPago: 0,
        dataPagamento: null
      },
      
      // PDFs (serão preenchidos após geração)
      pdfs: {
        documento1: null,
        documento2: null,
        documento3: null,
        esclarecimento1: null,
        esclarecimento2: null,
        kitCompleto: null
      }
    };
    
    // Salva no Firestore
    const docRef = await db.collection(COLECAO_CALCULOS).add(documento);
    
    console.log('✅ Cálculo salvo no Firebase:', docRef.id);
    console.log('📊 Dados salvos:', documento);
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Erro ao salvar cálculo no Firebase:', error);
    throw error;
  }
}

/**
 * Atualiza status de pagamento
 * @param {string} documentoId - ID do documento
 * @param {Object} dadosPagamento - Dados do pagamento
 */
async function atualizarPagamento(documentoId, dadosPagamento) {
  if (!db) {
    initFirebase();
  }
  
  try {
    await db.collection(COLECAO_CALCULOS).doc(documentoId).update({
      'status.pagamento': dadosPagamento.status || 'pago_etapa1',
      'pagamento.assinaturaId': dadosPagamento.assinaturaId || '',
      'pagamento.plano': dadosPagamento.plano || 'Starter',
      'pagamento.valorPago': FirebaseUtils.reaisParaCentavos(dadosPagamento.valor),
      'pagamento.dataPagamento': firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Pagamento atualizado:', documentoId);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar pagamento:', error);
    throw error;
  }
}

/**
 * Busca cálculo por accessCode
 * @param {string} accessCode - Código de acesso
 * @returns {Promise<Object|null>} Documento encontrado ou null
 */
async function buscarPorAccessCode(accessCode) {
  if (!db) {
    initFirebase();
  }
  
  try {
    const snapshot = await db.collection(COLECAO_CALCULOS)
      .where('accessCode', '==', accessCode)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
    
  } catch (error) {
    console.error('❌ Erro ao buscar por accessCode:', error);
    throw error;
  }
}

/**
 * Busca cálculo por CPF
 * @param {string} cpf - CPF do cliente
 * @returns {Promise<Array>} Lista de cálculos
 */
async function buscarPorCPF(cpf) {
  if (!db) {
    initFirebase();
  }
  
  try {
    const snapshot = await db.collection(COLECAO_CALCULOS)
      .where('cliente.cpf', '==', cpf)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
  } catch (error) {
    console.error('❌ Erro ao buscar por CPF:', error);
    throw error;
  }
}

/**
 * Lista todos os cálculos (para dashboard)
 * @param {number} limite - Número máximo de resultados
 * @returns {Promise<Array>} Lista de cálculos
 */
async function listarCalculos(limite = 100) {
  if (!db) {
    initFirebase();
  }
  
  try {
    const snapshot = await db.collection(COLECAO_CALCULOS)
      .orderBy('createdAt', 'desc')
      .limit(limite)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
  } catch (error) {
    console.error('❌ Erro ao listar cálculos:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

/**
 * Formata data ISO para formato brasileiro
 * @param {string} dataISO - Data no formato YYYY-MM-DD
 * @returns {string} Data no formato DD/MM/YYYY
 */
function formatarDataParaBR(dataISO) {
  if (!dataISO) return '';
  
  // Se já estiver no formato BR, retorna
  if (dataISO.includes('/')) return dataISO;
  
  // Converte de YYYY-MM-DD para DD/MM/YYYY
  const partes = dataISO.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  return dataISO;
}

/**
 * Extrai o ano equivalente (exercício) de uma data
 * @param {string} data - Data no formato YYYY-MM-DD ou DD/MM/YYYY
 * @returns {number} Ano do exercício (ano seguinte)
 */
function extrairAnoEquivalente(data) {
  if (!data) return 0;
  
  let ano;
  if (data.includes('/')) {
    // Formato DD/MM/YYYY
    ano = parseInt(data.split('/')[2]);
  } else {
    // Formato YYYY-MM-DD
    ano = parseInt(data.split('-')[0]);
  }
  
  // O exercício é o ano seguinte ao recebimento
  return ano + 1;
}

// Exporta funções para uso global
window.salvarCalculoFirebase = salvarCalculoFirebase;
window.atualizarPagamento = atualizarPagamento;
window.buscarPorAccessCode = buscarPorAccessCode;
window.buscarPorCPF = buscarPorCPF;
window.listarCalculos = listarCalculos;
window.initFirebase = initFirebase;

console.log('✅ Firebase Service carregado');
