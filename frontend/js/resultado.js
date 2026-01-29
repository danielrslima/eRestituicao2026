/**
 * e-Restituição - Módulo de Resultado
 * Gerencia a exibição do resultado e fluxo de pagamento
 * Versão: 2.3.0 - QR Code PIX na Tela + Copia-Cola
 */

// Estado do resultado
const resultadoState = {
  etapa: 'inicial', // inicial, apos_basico, apos_completo
  resultado: null,
  planoBasicoPago: false,
  planoCompletoPago: false,
  paymentId: null
};

// Preços (TESTE)
const PRECOS = {
  basico: {
    teste: 5.99,
    producao: 29.90 // pode variar entre 29.90 e 49.90
  },
  completo: {
    teste: 15.99,
    producao: 2500.00
  }
};

// Usar preço de teste
const MODO_TESTE = true;
const PRECO_BASICO = MODO_TESTE ? PRECOS.basico.teste : PRECOS.basico.producao;
const PRECO_COMPLETO = MODO_TESTE ? PRECOS.completo.teste : PRECOS.completo.producao;

/**
 * Calcula o preço do Kit IR com abatimento do valor já pago no plano básico
 * Se o cliente já pagou o plano básico, o valor é abatido do Kit IR
 */
function calcularPrecoComAbatimento() {
  if (resultadoState.planoBasicoPago) {
    // Abate o valor já pago no plano básico
    return Math.max(0, PRECO_COMPLETO - PRECO_BASICO);
  }
  return PRECO_COMPLETO;
}

/**
 * Gera o HTML do preço com ou sem abatimento
 * Mostra o preço original riscado e o novo preço quando há abatimento
 */
function gerarHTMLPrecoComAbatimento() {
  const precoFinal = calcularPrecoComAbatimento();
  
  if (resultadoState.planoBasicoPago && precoFinal < PRECO_COMPLETO) {
    // Mostra preço original riscado + preço com desconto
    return `
      <div class="preco-com-abatimento">
        <div class="preco-original-riscado">
          <span class="de">De:</span>
          <span class="valor-riscado">R$ ${PRECO_COMPLETO.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="preco-abatimento-info">
          <span class="abatimento-texto">🎁 Você já pagou R$ ${PRECO_BASICO.toFixed(2).replace('.', ',')} - Desconto aplicado!</span>
        </div>
        <div class="plano-destaque-preco preco-final">
          <span class="por">Por apenas:</span>
          R$ ${precoFinal.toFixed(2).replace('.', ',')}
        </div>
      </div>
    `;
  }
  
  // Preço normal sem abatimento
  return `
    <div class="plano-destaque-preco">
      R$ ${PRECO_COMPLETO.toFixed(2).replace('.', ',')}
    </div>
  `;
}

// WhatsApp do Especialista
const WHATSAPP_ESPECIALISTA = '5511941139391';

// URL da API de Pagamento
// No Manus: usa proxy local para contornar CORS
// Em produção: usa a API do Render diretamente
const API_URL = 'https://api.restituicaoia.com.br/api';

/**
 * Exibe o resultado inicial (ANTES do pagamento do Plano Básico)
 * - Mostra mensagem de parabéns
 * - NÃO mostra o valor
 * - Mostra quadrado "DESCUBRA SEU VALOR"
 */
function exibirResultadoInicial(resultado) {
  resultadoState.resultado = resultado;
  resultadoState.etapa = 'inicial';
  
  const container = document.getElementById('resultadoContainer');
  const dados = resultado._interno || resultado;
  const totalIrpf = dados.totalIrpf;
  const isRestituicao = totalIrpf > 0;
  
  // Mensagem baseada no resultado (sem mostrar valor)
  const mensagemPrincipal = isRestituicao 
    ? 'Parabéns! Você tem valor a restituir!'
    : 'Ah! Que chato. Você não tem valor a Restituir!';
  
  const mensagemSecundaria = isRestituicao 
    ? ''
    : '<p class="mensagem-secundaria-destaque">Mas pode ter pago a mais que o devido</p>';
  
  // Descrição do card baseada no resultado
  const descricaoCard = isRestituicao 
    ? 'Descubra agora quanto você pode recuperar de imposto de renda retido na fonte!'
    : 'Descubra se, ainda, pode recuperar algum valor, por ter pago a mais na sua Declaração!';
  
  // Ícones: 3 confetes para positivo, 2 lupas para negativo
  const icones = isRestituicao 
    ? '<span>🎉</span><span>🎉</span><span>🎉</span>'
    : '<span>🔎</span><span>🔎</span>';
  
  container.innerHTML = `
    <div class="resultado-card resultado-inicial">
      <div class="resultado-icon-grande ${isRestituicao ? 'confetes' : 'atencao-icon'}">
        ${icones}
      </div>
      
      <h2 class="resultado-mensagem-principal ${isRestituicao ? 'sucesso' : 'atencao'}">
        ${mensagemPrincipal}
      </h2>
      ${mensagemSecundaria}
      
      <div class="plano-destaque-card">
        <div class="plano-destaque-icone">🔍</div>
        <h3 class="plano-destaque-titulo">DESCUBRA SEU VALOR</h3>
        <p class="plano-destaque-descricao">
          ${descricaoCard}
        </p>
        <div class="plano-destaque-preco">
          R$ ${PRECO_BASICO.toFixed(2).replace('.', ',')}
        </div>
        ${MODO_TESTE ? '<span class="badge-teste">Preço de Teste</span>' : ''}
        <button type="button" class="btn-descobrir" onclick="iniciarPagamentoBasico()">
          👉 DESCOBRIR AGORA
        </button>
      </div>
    </div>
  `;
}

/**
 * Exibe o resultado após pagamento do Plano Básico
 * - Mostra o valor total
 * - Mostra detalhamento por exercício (apenas valores a restituir/pagar)
 * - Mostra quadrado "FAÇA VOCÊ MESMO" (Kit IR)
 */
function exibirResultadoAposBasico() {
  resultadoState.etapa = 'apos_basico';
  resultadoState.planoBasicoPago = true;
  
  const container = document.getElementById('resultadoContainer');
  const dados = resultadoState.resultado._interno || resultadoState.resultado;
  const totalIrpf = dados.totalIrpf;
  const isRestituicao = totalIrpf > 0;
  
  // Gerar detalhamento por exercício (apenas valores a restituir/pagar)
  let exerciciosHTML = '';
  (dados.exercicios || []).forEach(ex => {
    const valorClass = ex.irpf >= 0 ? 'valor-positivo' : 'valor-negativo';
    const valorFormatado = formatarMoeda(Math.abs(ex.irpf));
    const tipo = ex.irpf >= 0 ? 'Restituir' : 'Pagar';
    const sinal = ex.irpf >= 0 ? '+' : '-';
    
    exerciciosHTML += `
      <div class="exercicio-item">
        <span class="exercicio-ano">Exercício ${ex.exercicio}:</span>
        <span class="${valorClass}">${sinal} R$ ${valorFormatado} (${tipo})</span>
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="resultado-card resultado-completo">
      <div class="resultado-icon-grande confetes">
        <span>🎉</span><span>🎉</span><span>🎉</span>
      </div>
      
      <h2 class="resultado-mensagem-principal sucesso">
        Parabéns! Você possui valor à restituir!
      </h2>
      
      <div class="valor-total-card">
        <span class="valor-total-label">Total a restituir:</span>
        <div class="valor-total-numero ${isRestituicao ? 'positivo' : 'negativo'}">
          ${isRestituicao ? '+' : '-'} R$ ${formatarMoeda(Math.abs(totalIrpf))}
        </div>
      </div>
      
      <div class="detalhamento-section">
        <h3 class="detalhamento-titulo">Detalhamento por Exercício</h3>
        <div class="exercicios-lista">
          ${exerciciosHTML}
        </div>
      </div>
      
      <div class="plano-destaque-card kit-ir">
        <div class="plano-destaque-icone">📦</div>
        <h3 class="plano-destaque-titulo">FAÇA VOCÊ MESMO</h3>
        <p class="plano-destaque-descricao">
          Você receberá os documentos necessários e as orientações para restituir o valor pago indevidamente.
        </p>
        ${gerarHTMLPrecoComAbatimento()}
        ${MODO_TESTE ? '<span class="badge-teste">Preço de Teste</span>' : ''}
        <button type="button" class="btn-descobrir btn-kit" onclick="iniciarPagamentoCompleto()">
          👉 QUERO O KIT IR
        </button>
      </div>
      
      <div class="observacao-box">
        <strong>OBS:</strong> Você receberá em até 08 dias o link para baixar o KIT IR completo, 
        com todos os documentos devidamente pronto para lhe auxiliar no ajuste/retificação da 
        Declaração do Imposto de Renda e para o protocolo junto à Receita Federal, além de um 
        Link para assistir um vídeo de como deve protocolar essa documentação.
      </div>
    </div>
  `;
}

/**
 * Exibe o resultado após pagamento do Kit IR (Plano Completo)
 * - Mostra mensagem de confirmação do Kit IR
 * - Mostra quadrado "Especialista" centralizado
 * - Mostra observação abaixo
 * - SEM confetes, parabéns e valor (conforme solicitado)
 */
function exibirResultadoAposCompleto() {
  resultadoState.etapa = 'apos_completo';
  resultadoState.planoCompletoPago = true;
  
  const container = document.getElementById('resultadoContainer');
  
  container.innerHTML = `
    <div class="resultado-card resultado-final">
      <div class="mensagem-kit-enviado">
        <span class="icone-email">📧</span>
        <p>Você receberá por e-mail o <strong>KIT IR</strong> em até <strong>08 dias</strong>.</p>
        <p class="sub-mensagem">Fique atento à sua caixa de entrada!</p>
        <p class="aviso-spam">⚠️ <strong>IMPORTANTE:</strong> Verifique também sua caixa de <strong>SPAM</strong> ou <strong>Lixo Eletrônico</strong>.</p>
      </div>
      
      <div class="plano-destaque-card especialista">
        <div class="plano-destaque-icone">🤝</div>
        <h3 class="plano-destaque-titulo">Quer Ter um Especialista Para Cuidar de Tudo?</h3>
        <button type="button" class="btn-descobrir btn-especialista" onclick="contatarEspecialista()">
          👉 CLIQUE AQUI
        </button>
      </div>
      
      <div class="observacao-box especialista-obs">
        <strong>OBS:</strong> Aqui cuidamos de tudo para você: Desde a apresentação ou retificação 
        da Declaração, do Protocolo da documentação na Malha e acompanhamento até final resolução, 
        com a regularização e/ou restituição. Clique no botão acima e será direcionado(a) para um 
        atendimento especializado.
      </div>
    </div>
  `;
}

/**
 * Inicia o processo de pagamento do Plano Básico
 */
function iniciarPagamentoBasico() {
  mostrarModalPagamento('basico', PRECO_BASICO, 'DESCUBRA SEU VALOR');
}

/**
 * Inicia o processo de pagamento do Plano Completo (Kit IR)
 * Usa o preço com abatimento se o plano básico já foi pago
 */
function iniciarPagamentoCompleto() {
  const precoFinal = calcularPrecoComAbatimento();
  const temAbatimento = resultadoState.planoBasicoPago && precoFinal < PRECO_COMPLETO;
  const nomePlano = temAbatimento 
    ? 'FAÇA VOCÊ MESMO (Kit IR) - COM DESCONTO' 
    : 'FAÇA VOCÊ MESMO (Kit IR)';
  mostrarModalPagamento('completo', precoFinal, nomePlano);
}

/**
 * Mostra modal de pagamento com opções PIX e Cartão
 */
function mostrarModalPagamento(plano, valor, nomePlano) {
  // Remover modal existente se houver
  fecharModalPagamento();
  
  // Criar modal de pagamento
  const modalHTML = `
    <div class="modal-pagamento" id="modalPagamento">
      <div class="modal-pagamento-content">
        <span class="modal-close" onclick="fecharModalPagamento()">&times;</span>
        
        <h3>Escolha o método de pagamento:</h3>
        <p class="plano-selecionado">Plano selecionado: <strong>${nomePlano}</strong></p>
        <p class="checkout-valor">Valor: <strong>R$ ${valor.toFixed(2).replace('.', ',')}</strong></p>
        
        <div class="metodos-pagamento">
          <button class="btn-metodo ativo" data-metodo="pix" onclick="selecionarMetodo('pix')">
            <span class="metodo-icone">◆</span>
            <span>PIX</span>
          </button>
          <button class="btn-metodo" data-metodo="cartao" onclick="selecionarMetodo('cartao')">
            <span class="metodo-icone">💳</span>
            <span>Cartão</span>
          </button>
        </div>
        
        <button class="btn-pagar" id="btnPagar" onclick="processarPagamento('${plano}')">
          Pagar →
        </button>
      </div>
    </div>
  `;
  
  // Adicionar modal ao body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Fecha o modal de pagamento
 */
function fecharModalPagamento() {
  const modal = document.getElementById('modalPagamento');
  if (modal) {
    modal.remove();
  }
}

/**
 * Seleciona método de pagamento
 */
function selecionarMetodo(metodo) {
  document.querySelectorAll('.btn-metodo').forEach(btn => {
    btn.classList.remove('ativo');
  });
  document.querySelector(`[data-metodo="${metodo}"]`).classList.add('ativo');
}

/**
 * Obtém o método de pagamento selecionado
 */
function getMetodoSelecionado() {
  const btnAtivo = document.querySelector('.btn-metodo.ativo');
  return btnAtivo ? btnAtivo.dataset.metodo : 'pix';
}

/**
 * Processa o pagamento via Asaas
 */
async function processarPagamento(plano) {
  const metodoPagamento = getMetodoSelecionado();
  const btnPagar = document.getElementById('btnPagar');
  
  try {
    // Mostrar loading
    btnPagar.innerHTML = '<span class="loading-spinner"></span> Processando...';
    btnPagar.disabled = true;
    
    // Obter dados do formulário do state global
    const dadosFormulario = window.state?.dadosFormulario || {};
    
    // Calcular valor do pagamento
    let valorPagamento = plano === 'basico' ? PRECO_BASICO : PRECO_COMPLETO;
    
    // Se for plano completo e já pagou básico, aplica abatimento
    if (plano === 'completo' && resultadoState.planoBasicoPago) {
      valorPagamento = PRECO_COMPLETO - PRECO_BASICO;
    }
    
    // Descrição do pagamento
    const descricaoPagamento = plano === 'basico' 
      ? 'e-Restituicao - Descubra seu Valor' 
      : 'e-Restituicao - Kit IR Completo';
    
    // Tipo de pagamento para Asaas
    const billingType = metodoPagamento === 'pix' ? 'PIX' : 'CREDIT_CARD';
    
    // Chamar API de pagamento com campos corretos
    const response = await fetch(`${API_URL}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: dadosFormulario.nome || 'Cliente',
        email: dadosFormulario.email || 'cliente@email.com',
        cpfCnpj: (dadosFormulario.cpf || '00000000000').replace(/\D/g, ''),
        phone: (dadosFormulario.telefone || '').replace(/\D/g, ''),
        value: valorPagamento,
        description: descricaoPagamento,
        billingType: billingType,
        accessCode: window.state?.accessCode || ''
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.paymentId) {
      // Salvar ID do pagamento
      resultadoState.paymentId = data.paymentId;
      
      // Fechar modal de seleção de método
      fecharModalPagamento();
      
      // Se tiver dados do PIX, mostrar QR Code diretamente
      if (data.pix && data.pix.qrCodeImage) {
        mostrarQRCodePIX(plano, data.paymentId, data.pix, data.value);
      } else if (data.invoiceUrl) {
        // Fallback: abrir link do Asaas
        window.open(data.invoiceUrl, '_blank');
        mostrarAreaConfirmacaoPagamento(plano, data.paymentId);
      } else {
        // Construir link manualmente
        const paymentIdClean = data.paymentId.replace('pay_', '');
        const invoiceLink = `https://www.asaas.com/i/${paymentIdClean}`;
        window.open(invoiceLink, '_blank');
        mostrarAreaConfirmacaoPagamento(plano, data.paymentId);
      }
      
    } else {
      throw new Error(data.error || 'Erro ao criar pagamento');
    }
    
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    alert('Erro ao gerar link de pagamento. Tente novamente.');
    btnPagar.innerHTML = 'Pagar →';
    btnPagar.disabled = false;
  }
}

/**
 * Mostra área para confirmar pagamento após abrir link do Asaas
 */
function mostrarAreaConfirmacaoPagamento(plano, paymentId) {
  const container = document.getElementById('resultadoContainer');
  
  // Adicionar seção de confirmação
  const confirmacaoHTML = `
    <div class="confirmacao-pagamento-section" id="confirmacaoSection">
      <div class="confirmacao-card">
        <div class="confirmacao-icone">💳</div>
        <h3>Pagamento em Andamento</h3>
        <p>Uma nova aba foi aberta para você realizar o pagamento.</p>
        <p class="confirmacao-instrucao">Após concluir o pagamento, clique no botão abaixo:</p>
        
        <button class="btn-verificar-pagamento" onclick="verificarPagamento('${plano}', '${paymentId}')">
          🔄 Verificar Pagamento
        </button>
        
        <p class="confirmacao-obs">
          <small>O sistema verificará automaticamente se o pagamento foi confirmado.</small>
        </p>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', confirmacaoHTML);
}

/**
 * Verifica o status do pagamento no Asaas
 */
async function verificarPagamento(plano, paymentId) {
  const btnVerificar = document.querySelector('.btn-verificar-pagamento');
  
  try {
    btnVerificar.innerHTML = '<span class="loading-spinner"></span> Verificando...';
    btnVerificar.disabled = true;
    
    const response = await fetch(`${API_URL}/payment-status/${paymentId}`);
    const data = await response.json();
    
    if (data.sucesso && data.pagamento.pago) {
      // Pagamento confirmado!
      removerSecaoConfirmacao();
      
      if (plano === 'basico') {
        alert('✅ Pagamento Confirmado! Seu valor será revelado.');
        exibirResultadoAposBasico();
      } else if (plano === 'completo') {
        alert('✅ Pagamento Confirmado! Você receberá o KIT IR em até 08 dias no seu e-mail.');
        exibirResultadoAposCompleto();
      }
    } else {
      // Pagamento ainda não confirmado
      alert('⏳ Pagamento ainda não confirmado. Aguarde alguns instantes e tente novamente.');
      btnVerificar.innerHTML = '🔄 Verificar Pagamento';
      btnVerificar.disabled = false;
    }
    
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    alert('Erro ao verificar pagamento. Tente novamente.');
    btnVerificar.innerHTML = '🔄 Verificar Pagamento';
    btnVerificar.disabled = false;
  }
}

/**
 * Remove a seção de confirmação de pagamento
 */
function removerSecaoConfirmacao() {
  const secao = document.getElementById('confirmacaoSection');
  if (secao) {
    secao.remove();
  }
}

/**
 * Direciona para WhatsApp do Especialista
 */
function contatarEspecialista() {
  const mensagem = encodeURIComponent('Olá! Gostaria de contratar um Especialista para cuidar da minha restituição de IR. Aguardo retorno.');
  const url = `https://api.whatsapp.com/send/?phone=${WHATSAPP_ESPECIALISTA}&text=${mensagem}&type=phone_number&app_absent=0`;
  window.open(url, '_blank');
}

/**
 * Formata valor para moeda brasileira
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Mostra o QR Code PIX diretamente na tela
 */
function mostrarQRCodePIX(plano, paymentId, pixData, valor) {
  const container = document.getElementById('resultadoContainer');
  
  // Formatar valor
  const valorFormatado = typeof valor === 'number' 
    ? valor.toFixed(2).replace('.', ',') 
    : valor;
  
  const pixHTML = `
    <div class="pix-pagamento-section" id="pixSection">
      <div class="pix-card">
        <div class="pix-header">
          <span class="pix-icone">◆</span>
          <h3>Pagamento via PIX</h3>
        </div>
        
        <p class="pix-valor">Valor: <strong>R$ ${valorFormatado}</strong></p>
        
        <div class="pix-qrcode-container">
          <img src="data:image/png;base64,${pixData.qrCodeImage}" alt="QR Code PIX" class="pix-qrcode-img" />
        </div>
        
        <p class="pix-instrucao">Escaneie o QR Code acima com o app do seu banco</p>
        
        <div class="pix-copiacola">
          <p class="pix-copiacola-label">Ou copie o código PIX:</p>
          <div class="pix-codigo-container">
            <input type="text" id="codigoPix" value="${pixData.qrCodePayload}" readonly class="pix-codigo-input" />
            <button type="button" class="btn-copiar-pix" onclick="copiarCodigoPIX()">
              📋 Copiar
            </button>
          </div>
        </div>
        
        <div class="pix-timer">
          <p>⏱️ Este código expira em <strong>30 minutos</strong></p>
        </div>
        
        <button class="btn-verificar-pagamento" onclick="verificarPagamento('${plano}', '${paymentId}')">
          ✅ Já paguei - Verificar Pagamento
        </button>
        
        <p class="pix-obs">
          <small>Após o pagamento, clique no botão acima para liberar seu acesso.</small>
        </p>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', pixHTML);
  
  // Scroll para a seção do PIX
  document.getElementById('pixSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Copia o código PIX para a área de transferência
 */
function copiarCodigoPIX() {
  const codigoInput = document.getElementById('codigoPix');
  codigoInput.select();
  codigoInput.setSelectionRange(0, 99999); // Para mobile
  
  try {
    navigator.clipboard.writeText(codigoInput.value);
    
    // Feedback visual
    const btnCopiar = document.querySelector('.btn-copiar-pix');
    const textoOriginal = btnCopiar.innerHTML;
    btnCopiar.innerHTML = '✅ Copiado!';
    btnCopiar.style.background = '#28a745';
    
    setTimeout(() => {
      btnCopiar.innerHTML = textoOriginal;
      btnCopiar.style.background = '';
    }, 2000);
  } catch (err) {
    alert('Código PIX copiado!');
  }
}

// Expor funções globais
window.exibirResultadoInicial = exibirResultadoInicial;
window.exibirResultadoAposBasico = exibirResultadoAposBasico;
window.exibirResultadoAposCompleto = exibirResultadoAposCompleto;
window.iniciarPagamentoBasico = iniciarPagamentoBasico;
window.iniciarPagamentoCompleto = iniciarPagamentoCompleto;
window.fecharModalPagamento = fecharModalPagamento;
window.selecionarMetodo = selecionarMetodo;
window.processarPagamento = processarPagamento;
window.verificarPagamento = verificarPagamento;
window.contatarEspecialista = contatarEspecialista;
window.mostrarQRCodePIX = mostrarQRCodePIX;
window.copiarCodigoPIX = copiarCodigoPIX;