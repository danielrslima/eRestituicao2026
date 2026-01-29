/**
 * e-Restituição - Aplicação Principal
 * Versão: 1.0.0
 */

// Configuração da API
const API_BASE_URL = 'https://api.restituicaoia.com.br/api'; // URL pública do backend
const ASAAS_URL = 'https://api.restituicaoia.com.br/api/create-payment';

// Estado da aplicação
let state = {
  currentStep: 1,
  emailValidado: false,
  accessCode: null,
  dadosFormulario: {},
  resultado: null,
  alvaras: [],
  darfs: [],
  honorarios: []
};

// Expor state globalmente para outros módulos (resultado.js, tabBehavior.js)
window.state = state;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Inicializa máscaras
  window.masks.init();
  
  // Inicializa validações
  if (window.validations && window.validations.init) {
    window.validations.init();
  }
  
  // Inicializa comportamento de Tab
  if (window.tabBehavior && window.tabBehavior.init) {
    window.tabBehavior.init();
  }
  
  // Inicializa modal de confirmação
  if (window.confirmacao && window.confirmacao.init) {
    window.confirmacao.init();
  }
  
  // Inicializa eventos
  initEventListeners();
  
  // Adiciona primeiro alvará, DARF e honorário
  addAlvara();
  addDarf();
  addHonorario();
  
  console.log('e-Restituição iniciado');
});

// Event Listeners
function initEventListeners() {
  // Botão Enviar Código
  document.getElementById('btnEnviarCodigo').addEventListener('click', enviarCodigoVerificacao);
  
  // Botão Validar Código
  document.getElementById('btnValidarCodigo').addEventListener('click', validarCodigo);
  
  // Reenviar Código
  document.getElementById('reenviarCodigo').addEventListener('click', function(e) {
    e.preventDefault();
    enviarCodigoVerificacao();
  });
  
  // Navegação entre steps
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', function() {
      const nextStep = parseInt(this.dataset.next);
      goToStep(nextStep);
    });
  });
  
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', function() {
      const prevStep = parseInt(this.dataset.prev);
      goToStep(prevStep);
    });
  });
  
  // Botão Calcular
  document.getElementById('btnCalcular').addEventListener('click', calcular);
  
  // Adicionar Alvará
  document.getElementById('addAlvara').addEventListener('click', addAlvara);
  
  // Adicionar DARF
  document.getElementById('addDarf').addEventListener('click', addDarf);
  
  // Adicionar Honorário
  document.getElementById('addHonorario').addEventListener('click', addHonorario);
  
  // Modal de Recuperação
  document.getElementById('linkRecuperacao').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('modalRecuperacao').style.display = 'flex';
  });
  
  document.getElementById('fecharModal').addEventListener('click', function() {
    document.getElementById('modalRecuperacao').style.display = 'none';
  });
  
  document.getElementById('btnRecuperar').addEventListener('click', recuperarCalculo);
}

// Navegação entre steps
function goToStep(step) {
  // Valida step atual antes de avançar
  if (step > state.currentStep && !validateCurrentStep()) {
    return;
  }
  
  // Esconde step atual
  document.getElementById(`step${state.currentStep}`).classList.remove('active');
  
  // Mostra novo step
  document.getElementById(`step${step}`).classList.add('active');
  
  // Atualiza indicadores
  updateStepIndicators(step);
  
  state.currentStep = step;
}

function updateStepIndicators(activeStep) {
  document.querySelectorAll('.step').forEach((stepEl, index) => {
    const stepNum = index + 1;
    stepEl.classList.remove('active', 'completed');
    
    if (stepNum < activeStep) {
      stepEl.classList.add('completed');
    } else if (stepNum === activeStep) {
      stepEl.classList.add('active');
    }
  });
}

function validateCurrentStep() {
  const step = state.currentStep;
  
  if (step === 1) {
    // Validar dados pessoais
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    
    if (!nome || !email || !telefone || !cpf) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    
    if (!state.emailValidado) {
      alert('Por favor, valide seu email antes de continuar.');
      return false;
    }
  }
  
  if (step === 3) {
    // Validar valores
    const bruto = document.getElementById('brutoHomologado').value;
    const tributavel = document.getElementById('tributavelHomologado').value;
    const meses = document.getElementById('numeroMeses').value;
    
    if (!bruto || !tributavel || !meses) {
      alert('Por favor, preencha os valores homologados e número de meses.');
      return false;
    }
    
    if (state.alvaras.length === 0) {
      alert('Por favor, adicione pelo menos um alvará.');
      return false;
    }
    
    if (state.darfs.length === 0) {
      alert('Por favor, adicione pelo menos um DARF.');
      return false;
    }
  }
  
  return true;
}

// Validação de Email
async function enviarCodigoVerificacao() {
  const email = document.getElementById('email').value.trim();
  
  if (!email) {
    alert('Por favor, digite seu email.');
    return;
  }
  
  // Simula envio de código (em produção, chamar API)
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Armazena código temporariamente (em produção, isso seria no backend)
  state.codigoVerificacao = codigo;
  
  // Mostra campo de validação
  document.getElementById('emailValidation').style.display = 'block';
  document.getElementById('btnEnviarCodigo').style.display = 'none';
  
  // Em produção, enviar email via API
  console.log('Código de verificação:', codigo);
  alert(`Código enviado para ${email}!\n\n(Para teste, o código é: ${codigo})`);
}

async function validarCodigo() {
  const codigoDigitado = document.getElementById('codigoVerificacao').value.trim();
  
  if (codigoDigitado === state.codigoVerificacao) {
    state.emailValidado = true;
    state.accessCode = generateAccessCode();
    
    // Mostra botão próximo
    document.getElementById('btnProximoStep1').style.display = 'inline-block';
    document.getElementById('emailValidation').style.display = 'none';
    
    // Salva dados iniciais
    await salvarDadosIniciais();
    
    alert('Email validado com sucesso! Você receberá um link para recuperar seu cálculo.');
  } else {
    alert('Código inválido. Tente novamente.');
  }
}

function generateAccessCode() {
  return 'REST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function salvarDadosIniciais() {
  const dados = {
    accessCode: state.accessCode,
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    cpf: document.getElementById('cpf').value,
    dataNascimento: document.getElementById('dataNascimento').value
  };
  
  state.dadosFormulario = dados;
  
  // Em produção, salvar no backend
  console.log('Dados salvos:', dados);
}

// Alvarás Dinâmicos
function addAlvara() {
  const container = document.getElementById('alvarasContainer');
  const index = state.alvaras.length;
  
  const row = document.createElement('div');
  row.className = 'item-row';
  row.dataset.index = index;
  row.innerHTML = `
    <div class="form-group">
      <label>Valor do Alvará:</label>
      <input type="text" class="alvara-valor money-input" placeholder="R$ 0,00">
    </div>
    <div class="form-group">
      <label>Data do Alvará:</label>
      <input type="text" class="alvara-data date-input" placeholder="DD/MM/AAAA" maxlength="10">
    </div>
    <button type="button" class="btn-remove" onclick="removeAlvara(${index})">✕</button>
  `;
  
  container.appendChild(row);
  
  // Aplica máscara de dinheiro
  const moneyInput = row.querySelector('.money-input');
  moneyInput.addEventListener('input', function(e) {
    e.target.value = window.masks.money(e.target.value);
  });
  
  // Aplica máscara de data
  const dateInput = row.querySelector('.date-input');
  dateInput.addEventListener('input', function(e) {
    e.target.value = window.masks.date(e.target.value);
  });
  
  state.alvaras.push({ valor: 0, data: '' });
}

function removeAlvara(index) {
  if (state.alvaras.length <= 1) {
    alert('Você precisa ter pelo menos um alvará.');
    return;
  }
  
  const container = document.getElementById('alvarasContainer');
  const rows = container.querySelectorAll('.item-row');
  
  rows[index].remove();
  state.alvaras.splice(index, 1);
  
  // Reindexar
  reindexItems('alvarasContainer', 'removeAlvara');
}

// DARFs Dinâmicos
function addDarf() {
  const container = document.getElementById('darfsContainer');
  const index = state.darfs.length;
  
  const row = document.createElement('div');
  row.className = 'item-row';
  row.dataset.index = index;
  row.innerHTML = `
    <div class="form-group">
      <label>Valor do DARF:</label>
      <input type="text" class="darf-valor money-input" placeholder="R$ 0,00">
    </div>
    <div class="form-group">
      <label>Data do DARF:</label>
      <input type="text" class="darf-data date-input" placeholder="DD/MM/AAAA" maxlength="10">
    </div>
    <button type="button" class="btn-remove" onclick="removeDarf(${index})">✕</button>
  `;
  
  container.appendChild(row);
  
  // Aplica máscara de dinheiro
  const moneyInput = row.querySelector('.money-input');
  moneyInput.addEventListener('input', function(e) {
    e.target.value = window.masks.money(e.target.value);
  });
  
  // Aplica máscara de data
  const dateInput = row.querySelector('.date-input');
  dateInput.addEventListener('input', function(e) {
    e.target.value = window.masks.date(e.target.value);
  });
  
  state.darfs.push({ valor: 0, data: '' });
}

function removeDarf(index) {
  if (state.darfs.length <= 1) {
    alert('Você precisa ter pelo menos um DARF.');
    return;
  }
  
  const container = document.getElementById('darfsContainer');
  const rows = container.querySelectorAll('.item-row');
  
  rows[index].remove();
  state.darfs.splice(index, 1);
  
  // Reindexar
  reindexItems('darfsContainer', 'removeDarf');
}

// Honorários Dinâmicos
function addHonorario() {
  const container = document.getElementById('honorariosContainer');
  const index = state.honorarios.length;
  
  const currentYear = new Date().getFullYear();
  let yearOptions = '';
  for (let year = 2015; year <= currentYear; year++) {
    yearOptions += `<option value="${year}">${year}</option>`;
  }
  
  const row = document.createElement('div');
  row.className = 'item-row honorario-row';
  row.dataset.index = index;
  row.innerHTML = `
    <div class="form-group">
      <label>Valor do Honorário:</label>
      <input type="text" class="honorario-valor money-input" placeholder="R$ 0,00">
    </div>
    <div class="form-group">
      <label>Ano Pago:</label>
      <select class="honorario-ano">
        <option value="">Selecione o ano</option>
        ${yearOptions}
      </select>
    </div>
    <button type="button" class="btn-remove" onclick="removeHonorario(${index})">✕</button>
  `;
  
  container.appendChild(row);
  
  // Aplica máscara de dinheiro
  const moneyInput = row.querySelector('.money-input');
  moneyInput.addEventListener('input', function(e) {
    e.target.value = window.masks.money(e.target.value);
  });
  
  state.honorarios.push({ valor: 0, anoPago: '' });
}

function removeHonorario(index) {
  const container = document.getElementById('honorariosContainer');
  const rows = container.querySelectorAll('.item-row');
  
  if (rows.length <= 1) {
    // Pode ter zero honorários
    rows[index].remove();
    state.honorarios = [];
    return;
  }
  
  rows[index].remove();
  state.honorarios.splice(index, 1);
  
  // Reindexar
  reindexItems('honorariosContainer', 'removeHonorario');
}

function reindexItems(containerId, removeFunction) {
  const container = document.getElementById(containerId);
  const rows = container.querySelectorAll('.item-row');
  
  rows.forEach((row, index) => {
    row.dataset.index = index;
    const removeBtn = row.querySelector('.btn-remove');
    removeBtn.setAttribute('onclick', `${removeFunction}(${index})`);
  });
}

// Coleta dados dos campos dinâmicos
function coletarAlvaras() {
  const alvaras = [];
  const rows = document.querySelectorAll('#alvarasContainer .item-row');
  
  rows.forEach(row => {
    const valor = window.masks.moneyToNumber(row.querySelector('.alvara-valor').value);
    const dataInput = row.querySelector('.alvara-data').value;
    // Converte DD/MM/AAAA para YYYY-MM-DD (ISO)
    const data = window.masks.dateToISO(dataInput);
    
    if (valor > 0 && data) {
      alvaras.push({ valor, data });
    }
  });
  
  return alvaras;
}

function coletarDarfs() {
  const darfs = [];
  const rows = document.querySelectorAll('#darfsContainer .item-row');
  
  rows.forEach(row => {
    const valor = window.masks.moneyToNumber(row.querySelector('.darf-valor').value);
    const dataInput = row.querySelector('.darf-data').value;
    // Converte DD/MM/AAAA para YYYY-MM-DD (ISO)
    const data = window.masks.dateToISO(dataInput);
    
    if (valor > 0 && data) {
      darfs.push({ valor, data });
    }
  });
  
  return darfs;
}

function coletarHonorarios() {
  const honorarios = [];
  const rows = document.querySelectorAll('#honorariosContainer .item-row');
  
  rows.forEach(row => {
    const valor = window.masks.moneyToNumber(row.querySelector('.honorario-valor').value);
    const anoPago = parseInt(row.querySelector('.honorario-ano').value);
    
    if (valor > 0 && anoPago) {
      honorarios.push({ valor, anoPago });
    }
  });
  
  return honorarios;
}

// Calcular
async function calcular() {
  // Coleta dados
  const alvaras = coletarAlvaras();
  const darfs = coletarDarfs();
  const honorarios = coletarHonorarios();
  
  // Validações
  if (alvaras.length === 0) {
    alert('Por favor, adicione pelo menos um alvará com valor e data.');
    return;
  }
  
  if (darfs.length === 0) {
    alert('Por favor, adicione pelo menos um DARF com valor e data.');
    return;
  }
  
  const dados = {
    accessCode: state.accessCode,
    nome: document.getElementById('nome').value,
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    processo: document.getElementById('processo')?.value || '',
    brutoHomologado: window.masks.moneyToNumber(document.getElementById('brutoHomologado').value),
    tributavelHomologado: window.masks.moneyToNumber(document.getElementById('tributavelHomologado').value),
    numeroMeses: parseFloat(document.getElementById('numeroMeses').value),
    alvaras: alvaras,
    darfs: darfs,
    honorarios: honorarios
  };
  
  console.log('Dados para cálculo:', dados);
  
  // Mostra loading
  const btnCalcular = document.getElementById('btnCalcular');
  const originalText = btnCalcular.innerHTML;
  btnCalcular.innerHTML = '<span class="loading"></span> Calculando...';
  btnCalcular.disabled = true;
  
  try {
    // Cálculo LOCAL usando o motor irpf-calculator.js (BLINDADO)
    if (!window.IRPFCalculator || !window.IRPFCalculator.calcular) {
      throw new Error('Motor de cálculo não carregado. Recarregue a página.');
    }
    
    // Chama o motor de cálculo local
    const resultadoCalculo = window.IRPFCalculator.calcular(dados);
    
    // Formata o resultado no padrão esperado
    const resultado = {
      sucesso: true,
      totalIrpf: resultadoCalculo.totalIrpf,
      descricaoTotal: resultadoCalculo.descricaoTotal,
      exercicios: resultadoCalculo.exercicios,
      proporcaoTributavel: resultadoCalculo.proporcaoTributavel,
      tipoCalculo: resultadoCalculo.tipoCalculo,
      _interno: resultadoCalculo
    };
    
    // Salva os dados do formulário no state para uso posterior
    state.dadosFormulario = dados;
    state.resultado = resultado;
    
    // Salva no Firebase (se disponível)
    if (window.FirebaseService && window.FirebaseService.salvarCalculo) {
      try {
        await window.FirebaseService.salvarCalculo(dados, resultado);
        console.log('✅ Cálculo salvo no Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Erro ao salvar no Firebase:', firebaseError);
      }
    }
    
    exibirResultado(resultado);
    goToStep(4);
    
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao calcular: ' + error.message);
  } finally {
    btnCalcular.innerHTML = originalText;
    btnCalcular.disabled = false;
  }
}

// Exibir Resultado - Usa o novo módulo resultado.js
function exibirResultado(resultado) {
  // Chama a função do módulo resultado.js
  // Mostra a tela inicial (sem valor, com botão DESCUBRA SEU VALOR)
  if (window.exibirResultadoInicial) {
    window.exibirResultadoInicial(resultado);
  } else {
    // Fallback caso o módulo não carregue
    console.error('Módulo resultado.js não carregado');
    const container = document.getElementById('resultadoContainer');
    container.innerHTML = '<p>Erro ao carregar resultado. Recarregue a página.</p>';
  }
}

function renderPlanosPagamento() {
  return `
    <h3 style="margin-top: 30px;">Escolha seu plano para acessar o relatório completo</h3>
    <div class="planos-container">
      <div class="plano-card">
        <h4 class="plano-titulo">Plano Básico</h4>
        <div class="plano-preco">R$ 29,90</div>
        <p class="plano-descricao">
          Acesso ao resultado do cálculo e relatório básico.
        </p>
        <button class="btn-plano" data-plano="basico">Escolher Plano</button>
      </div>
      
      <div class="plano-card destaque">
        <h4 class="plano-titulo">Plano Completo</h4>
        <div class="plano-preco">R$ 2.500,00</div>
        <p class="plano-descricao">
          Relatório completo + Declaração retificadora + Acompanhamento.
          <br><small>(Valor do Plano Básico é abatido)</small>
        </p>
        <button class="btn-plano" data-plano="completo">Escolher Plano</button>
      </div>
    </div>
  `;
}

async function processarPagamento(plano) {
  const valor = plano === 'basico' ? 29.90 : 2500.00;
  const descricao = plano === 'basico' 
    ? 'e-Restituição - Plano Básico' 
    : 'e-Restituição - Plano Completo';
  
  try {
    // Chama API do Asaas no Render
    const response = await fetch(ASAAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: state.dadosFormulario.nome || 'Cliente',
        email: state.dadosFormulario.email || 'cliente@email.com',
        cpfCnpj: state.dadosFormulario.cpf?.replace(/\D/g, '') || '00000000000',
        value: valor,
        description: descricao,
        accessCode: state.accessCode
      })
    });
    
    const data = await response.json();
    
    if (data.paymentLink) {
      // Redireciona para o link de pagamento
      window.location.href = data.paymentLink;
    } else {
      alert('Erro ao gerar link de pagamento. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao processar pagamento. Tente novamente.');
  }
}

// Recuperação de Cálculo
async function recuperarCalculo() {
  const email = document.getElementById('emailRecuperacao').value.trim();
  
  if (!email) {
    alert('Por favor, digite seu email.');
    return;
  }
  
  // Em produção, chamar API para enviar link de recuperação
  alert(`Link de recuperação enviado para ${email}!`);
  document.getElementById('modalRecuperacao').style.display = 'none';
}

// Expõe funções globais para os botões de remover
window.removeAlvara = removeAlvara;
window.removeDarf = removeDarf;
window.removeHonorario = removeHonorario;


// ==========================================
// TERMOS DE USO E POLÍTICA DE PRIVACIDADE
// ==========================================

function abrirTermosUso() {
  const modal = criarModalLegal('Termos de Uso', getTermosUso());
  document.body.appendChild(modal);
}

function abrirPoliticaPrivacidade() {
  const modal = criarModalLegal('Política de Privacidade', getPoliticaPrivacidade());
  document.body.appendChild(modal);
}

function criarModalLegal(titulo, conteudo) {
  const modal = document.createElement('div');
  modal.className = 'modal-legal';
  modal.innerHTML = `
    <div class="modal-legal-content">
      <div class="modal-legal-header">
        <h2>${titulo}</h2>
        <button class="modal-legal-close" onclick="this.closest('.modal-legal').remove()">×</button>
      </div>
      <div class="modal-legal-body">
        ${conteudo}
      </div>
      <div class="modal-legal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-legal').remove()">Fechar</button>
      </div>
    </div>
  `;
  return modal;
}

function getTermosUso() {
  return `
    <h3>1. Aceitação dos Termos</h3>
    <p>Ao utilizar os serviços da e-Restituição, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.</p>
    
    <h3>2. Descrição do Serviço</h3>
    <p>A e-Restituição oferece serviços de cálculo e orientação para restituição de Imposto de Renda Retido na Fonte (IRRF) sobre Rendimentos Recebidos Acumuladamente (RRA) em ações trabalhistas.</p>
    
    <h3>3. Uso do Serviço</h3>
    <p>O usuário se compromete a fornecer informações verdadeiras, precisas e completas. A e-Restituição não se responsabiliza por cálculos baseados em informações incorretas fornecidas pelo usuário.</p>
    
    <h3>4. Pagamentos</h3>
    <p>Os valores cobrados pelos serviços estão claramente indicados antes da confirmação do pagamento. Todos os pagamentos são processados de forma segura através de nossos parceiros de pagamento.</p>
    
    <h3>5. Propriedade Intelectual</h3>
    <p>Todo o conteúdo, incluindo textos, gráficos, logos, ícones e software, são propriedade da e-Restituição e estão protegidos pelas leis de propriedade intelectual.</p>
    
    <h3>6. Limitação de Responsabilidade</h3>
    <p>A e-Restituição fornece orientações e cálculos com base nas informações fornecidas pelo usuário. Não garantimos resultados específicos junto à Receita Federal, pois cada caso está sujeito à análise do órgão competente.</p>
    
    <h3>7. Modificações</h3>
    <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após sua publicação.</p>
    
    <h3>8. Contato</h3>
    <p>Para dúvidas sobre estes Termos de Uso, entre em contato através do email: suporte@e-restituicao.com.br</p>
    
    <p class="legal-date"><em>Última atualização: Janeiro de 2026</em></p>
  `;
}

function getPoliticaPrivacidade() {
  return `
    <h3>1. Informações Coletadas</h3>
    <p>Coletamos informações pessoais que você nos fornece diretamente, incluindo: nome completo, CPF, email, telefone, data de nascimento e dados relacionados ao seu processo trabalhista.</p>
    
    <h3>2. Uso das Informações</h3>
    <p>Utilizamos suas informações para:</p>
    <ul>
      <li>Realizar os cálculos de restituição de imposto</li>
      <li>Gerar documentos necessários para sua declaração</li>
      <li>Entrar em contato sobre o andamento do seu processo</li>
      <li>Enviar informações relevantes sobre nossos serviços</li>
    </ul>
    
    <h3>3. Proteção de Dados</h3>
    <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>
    
    <h3>4. Compartilhamento de Dados</h3>
    <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Podemos compartilhar dados apenas com:</p>
    <ul>
      <li>Processadores de pagamento para completar transações</li>
      <li>Autoridades legais quando exigido por lei</li>
    </ul>
    
    <h3>5. Seus Direitos (LGPD)</h3>
    <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
    <ul>
      <li>Acessar seus dados pessoais</li>
      <li>Corrigir dados incompletos ou desatualizados</li>
      <li>Solicitar a exclusão de seus dados</li>
      <li>Revogar o consentimento a qualquer momento</li>
    </ul>
    
    <h3>6. Cookies</h3>
    <p>Utilizamos cookies para melhorar sua experiência em nosso site. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades.</p>
    
    <h3>7. Retenção de Dados</h3>
    <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei.</p>
    
    <h3>8. Contato do Encarregado (DPO)</h3>
    <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato: suporte@e-restituicao.com.br</p>
    
    <p class="legal-date"><em>Última atualização: Janeiro de 2026</em></p>
  `;
}
