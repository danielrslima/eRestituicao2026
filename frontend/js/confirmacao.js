/**
 * Modal de Confirmação antes de Calcular
 * e-Restituição
 * 
 * Mostra um resumo dos dados preenchidos para o usuário conferir antes de calcular
 */

// ============================================================================
// CRIAR MODAL DE CONFIRMAÇÃO
// ============================================================================

function criarModalConfirmacao() {
  // Verifica se já existe
  if (document.getElementById('modalConfirmacao')) return;
  
  const modal = document.createElement('div');
  modal.id = 'modalConfirmacao';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content modal-confirmacao">
      <div class="modal-header">
        <h3>📋 Confira seus dados antes de calcular</h3>
        <button type="button" class="modal-close" id="fecharModalConfirmacao">&times;</button>
      </div>
      <div class="modal-body" id="resumoDados">
        <!-- Conteúdo será preenchido dinamicamente -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="btnRevisarDados">
          ← Revisar Dados
        </button>
        <button type="button" class="btn btn-primary" id="btnConfirmarCalculo">
          Calcular Agora →
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Adiciona estilos do modal
  adicionarEstilosModal();
  
  // Event listeners
  document.getElementById('fecharModalConfirmacao').addEventListener('click', fecharModalConfirmacao);
  document.getElementById('btnRevisarDados').addEventListener('click', fecharModalConfirmacao);
  document.getElementById('btnConfirmarCalculo').addEventListener('click', confirmarECalcular);
  
  // Fecha ao clicar fora
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      fecharModalConfirmacao();
    }
  });
}

// ============================================================================
// ESTILOS DO MODAL
// ============================================================================

function adicionarEstilosModal() {
  if (document.getElementById('estilosModalConfirmacao')) return;
  
  const style = document.createElement('style');
  style.id = 'estilosModalConfirmacao';
  style.textContent = `
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .modal-overlay.active {
      display: flex;
    }
    
    .modal-confirmacao {
      background: white;
      border-radius: 12px;
      max-width: 700px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
      background: linear-gradient(135deg, #00a651, #008c44);
      color: white;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
    }
    
    .modal-close {
      background: none;
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    
    .modal-body {
      padding: 24px;
      overflow-y: auto;
      max-height: 50vh;
    }
    
    .modal-footer {
      padding: 16px 24px;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    
    .resumo-secao {
      margin-bottom: 20px;
    }
    
    .resumo-secao h4 {
      color: #00a651;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e9ecef;
    }
    
    .resumo-tabela {
      width: 100%;
      border-collapse: collapse;
    }
    
    .resumo-tabela td {
      padding: 8px 12px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .resumo-tabela td:first-child {
      color: #6c757d;
      font-size: 13px;
      width: 40%;
    }
    
    .resumo-tabela td:last-child {
      font-weight: 500;
      color: #212529;
    }
    
    .resumo-lista {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .resumo-lista li {
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    
    .resumo-lista li span:first-child {
      color: #6c757d;
      font-size: 13px;
    }
    
    .resumo-lista li span:last-child {
      font-weight: 500;
      color: #212529;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #00a651, #008c44);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 166, 81, 0.4);
    }
  `;
  
  document.head.appendChild(style);
}

// ============================================================================
// COLETAR E FORMATAR DADOS
// ============================================================================

function coletarDadosParaResumo() {
  const dados = {
    pessoais: {
      nome: document.getElementById('nome')?.value || '',
      cpf: document.getElementById('cpf')?.value || '',
      email: document.getElementById('email')?.value || '',
      telefone: document.getElementById('telefone')?.value || ''
    },
    processo: {
      numero: document.getElementById('numeroProcesso')?.value || '',
      comarca: document.getElementById('comarca')?.value || '',
      vara: document.getElementById('vara')?.value || '',
      brutoHomologado: document.getElementById('brutoHomologado')?.value || '',
      tributavelHomologado: document.getElementById('tributavelHomologado')?.value || '',
      numeroMeses: document.getElementById('numeroMeses')?.value || ''
    },
    alvaras: [],
    darfs: [],
    honorarios: []
  };
  
  // Coleta alvarás
  const alvaraRows = document.querySelectorAll('#alvarasContainer .item-row');
  alvaraRows.forEach(row => {
    const valor = row.querySelector('.alvara-valor')?.value || '';
    const data = row.querySelector('.alvara-data')?.value || '';
    if (valor && valor !== 'R$ 0,00') {
      dados.alvaras.push({ valor, data: formatarDataExibicao(data) });
    }
  });
  
  // Coleta DARFs
  const darfRows = document.querySelectorAll('#darfsContainer .item-row');
  darfRows.forEach(row => {
    const valor = row.querySelector('.darf-valor')?.value || '';
    const data = row.querySelector('.darf-data')?.value || '';
    if (valor && valor !== 'R$ 0,00') {
      dados.darfs.push({ valor, data: formatarDataExibicao(data) });
    }
  });
  
  // Coleta Honorários
  const honorarioRows = document.querySelectorAll('#honorariosContainer .item-row');
  honorarioRows.forEach(row => {
    const valor = row.querySelector('.honorario-valor')?.value || '';
    const ano = row.querySelector('.honorario-ano')?.value || '';
    if (valor && valor !== 'R$ 0,00') {
      dados.honorarios.push({ valor, ano });
    }
  });
  
  return dados;
}

function formatarDataExibicao(dataISO) {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ============================================================================
// GERAR HTML DO RESUMO
// ============================================================================

function gerarHTMLResumo(dados) {
  let html = '';
  
  // Dados Pessoais
  html += `
    <div class="resumo-secao">
      <h4>👤 Dados Pessoais</h4>
      <table class="resumo-tabela">
        <tr><td>Nome:</td><td>${dados.pessoais.nome}</td></tr>
        <tr><td>CPF:</td><td>${dados.pessoais.cpf}</td></tr>
        <tr><td>Email:</td><td>${dados.pessoais.email}</td></tr>
        <tr><td>Telefone:</td><td>${dados.pessoais.telefone}</td></tr>
      </table>
    </div>
  `;
  
  // Dados do Processo
  html += `
    <div class="resumo-secao">
      <h4>📄 Dados do Processo</h4>
      <table class="resumo-tabela">
        <tr><td>Nº Processo:</td><td>${dados.processo.numero}</td></tr>
        <tr><td>Comarca:</td><td>${dados.processo.comarca}</td></tr>
        <tr><td>Vara:</td><td>${dados.processo.vara}</td></tr>
        <tr><td>Bruto Homologado:</td><td>${dados.processo.brutoHomologado}</td></tr>
        <tr><td>Tributável Homologado:</td><td>${dados.processo.tributavelHomologado}</td></tr>
        <tr><td>Nº de Meses:</td><td>${dados.processo.numeroMeses}</td></tr>
      </table>
    </div>
  `;
  
  // Alvarás
  if (dados.alvaras.length > 0) {
    html += `
      <div class="resumo-secao">
        <h4>💰 Alvarás (${dados.alvaras.length})</h4>
        <ul class="resumo-lista">
    `;
    dados.alvaras.forEach((alvara, i) => {
      html += `<li><span>Alvará ${i + 1} (${alvara.data}):</span><span>${alvara.valor}</span></li>`;
    });
    html += `</ul></div>`;
  }
  
  // DARFs
  if (dados.darfs.length > 0) {
    html += `
      <div class="resumo-secao">
        <h4>🏛️ DARFs (${dados.darfs.length})</h4>
        <ul class="resumo-lista">
    `;
    dados.darfs.forEach((darf, i) => {
      html += `<li><span>DARF ${i + 1} (${darf.data}):</span><span>${darf.valor}</span></li>`;
    });
    html += `</ul></div>`;
  }
  
  // Honorários
  if (dados.honorarios.length > 0) {
    html += `
      <div class="resumo-secao">
        <h4>⚖️ Honorários (${dados.honorarios.length})</h4>
        <ul class="resumo-lista">
    `;
    dados.honorarios.forEach((hon, i) => {
      html += `<li><span>Honorário ${i + 1} (${hon.ano}):</span><span>${hon.valor}</span></li>`;
    });
    html += `</ul></div>`;
  }
  
  return html;
}

// ============================================================================
// CONTROLE DO MODAL
// ============================================================================

function abrirModalConfirmacao() {
  criarModalConfirmacao();
  
  const dados = coletarDadosParaResumo();
  const html = gerarHTMLResumo(dados);
  
  document.getElementById('resumoDados').innerHTML = html;
  document.getElementById('modalConfirmacao').classList.add('active');
}

function fecharModalConfirmacao() {
  const modal = document.getElementById('modalConfirmacao');
  if (modal) {
    modal.classList.remove('active');
  }
}

function confirmarECalcular() {
  fecharModalConfirmacao();
  
  // Chama a função de cálculo original
  if (typeof window.executarCalculo === 'function') {
    window.executarCalculo();
  } else if (typeof calcularOriginal === 'function') {
    calcularOriginal();
  }
}

// ============================================================================
// INTERCEPTAR BOTÃO CALCULAR
// ============================================================================

function interceptarBotaoCalcular() {
  const btnCalcular = document.getElementById('btnCalcular');
  
  if (btnCalcular) {
    // Salva a função original
    const calcularOriginal = btnCalcular.onclick;
    
    // Remove listener antigo
    btnCalcular.removeEventListener('click', window.calcular);
    
    // Adiciona novo listener que abre o modal
    btnCalcular.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      abrirModalConfirmacao();
    });
    
    // Salva função original para chamar depois
    window.executarCalculo = window.calcular;
  }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

function initConfirmacao() {
  // Aguarda o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', interceptarBotaoCalcular);
  } else {
    // Aguarda um pouco para garantir que outros scripts carregaram
    setTimeout(interceptarBotaoCalcular, 100);
  }
  
  console.log('Modal de confirmação inicializado');
}

// ============================================================================
// EXPORTA PARA USO GLOBAL
// ============================================================================

window.confirmacao = {
  init: initConfirmacao,
  abrir: abrirModalConfirmacao,
  fechar: fecharModalConfirmacao
};
