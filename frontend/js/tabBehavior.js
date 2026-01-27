/**
 * Comportamento de Tab para Alvarás, DARFs e Honorários
 * e-Restituição
 * 
 * Regras:
 * 1. Tab em campo preenchido → Abre nova linha, cursor vai para primeiro campo da nova linha
 * 2. Tab em linha vazia → Exclui linha vazia, vai para próximo item (Alvarás → DARFs → Honorários → Calcular)
 */

// ============================================================================
// CONFIGURAÇÃO DOS CONTAINERS
// ============================================================================

const TAB_CONFIG = {
  alvaras: {
    containerId: 'alvarasContainer',
    addFunction: 'addAlvara',
    removeFunction: 'removeAlvara',
    valorClass: 'alvara-valor',
    dataClass: 'alvara-data',
    nextSection: 'darfsContainer',
    stateKey: 'alvaras'
  },
  darfs: {
    containerId: 'darfsContainer',
    addFunction: 'addDarf',
    removeFunction: 'removeDarf',
    valorClass: 'darf-valor',
    dataClass: 'darf-data',
    nextSection: 'honorariosContainer',
    stateKey: 'darfs'
  },
  honorarios: {
    containerId: 'honorariosContainer',
    addFunction: 'addHonorario',
    removeFunction: 'removeHonorario',
    valorClass: 'honorario-valor',
    dataClass: 'honorario-ano',
    nextSection: 'btnCalcular',
    stateKey: 'honorarios'
  }
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Verifica se uma linha está vazia (valor = 0 ou vazio)
 */
function isLinhaVazia(row, config) {
  const valorInput = row.querySelector('.' + config.valorClass);
  const dataInput = row.querySelector('.' + config.dataClass);
  
  if (!valorInput || !dataInput) return true;
  
  const valor = valorInput.value.trim();
  const data = dataInput.value;
  
  // Considera vazio se valor é R$ 0,00 ou vazio
  const valorVazio = !valor || valor === 'R$ 0,00' || valor === '';
  const dataVazia = !data || data === '';
  
  return valorVazio && dataVazia;
}

/**
 * Verifica se uma linha está parcialmente preenchida
 */
function isLinhaPreenchida(row, config) {
  const valorInput = row.querySelector('.' + config.valorClass);
  
  if (!valorInput) return false;
  
  const valor = valorInput.value.trim();
  
  // Considera preenchido se valor não é R$ 0,00 e não é vazio
  return valor && valor !== 'R$ 0,00' && valor !== '';
}

/**
 * Remove uma linha específica
 */
function removerLinha(row, config) {
  const container = document.getElementById(config.containerId);
  const rows = container.querySelectorAll('.item-row');
  
  // Não remove se for a única linha
  if (rows.length <= 1) return false;
  
  const index = parseInt(row.dataset.index);
  row.remove();
  
  // Remove do state
  if (window.state && window.state[config.stateKey]) {
    window.state[config.stateKey].splice(index, 1);
  }
  
  // Reindexa
  reindexarLinhas(config);
  
  return true;
}

/**
 * Reindexa as linhas após remoção
 */
function reindexarLinhas(config) {
  const container = document.getElementById(config.containerId);
  const rows = container.querySelectorAll('.item-row');
  
  rows.forEach((row, index) => {
    row.dataset.index = index;
    const btnRemove = row.querySelector('.btn-remove');
    if (btnRemove) {
      btnRemove.setAttribute('onclick', `${config.removeFunction}(${index})`);
    }
  });
}

/**
 * Adiciona nova linha e retorna o primeiro input
 */
function adicionarNovaLinha(config) {
  // Chama a função de adicionar correspondente
  if (config.addFunction === 'addAlvara') {
    window.addAlvara();
  } else if (config.addFunction === 'addDarf') {
    window.addDarf();
  } else if (config.addFunction === 'addHonorario') {
    window.addHonorario();
  }
  
  // Retorna o primeiro input da nova linha
  const container = document.getElementById(config.containerId);
  const rows = container.querySelectorAll('.item-row');
  const lastRow = rows[rows.length - 1];
  
  return lastRow.querySelector('.' + config.valorClass);
}

/**
 * Vai para o próximo item/seção
 */
function irParaProximoItem(config) {
  const nextSection = config.nextSection;
  
  if (nextSection === 'btnCalcular') {
    // Foca no botão calcular
    const btnCalcular = document.getElementById('btnCalcular');
    if (btnCalcular) {
      btnCalcular.focus();
    }
  } else {
    // Foca no primeiro input do próximo container
    const container = document.getElementById(nextSection);
    if (container) {
      const firstRow = container.querySelector('.item-row');
      if (firstRow) {
        const firstInput = firstRow.querySelector('input[type="text"], select');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }
  }
}

// ============================================================================
// HANDLER DE TAB
// ============================================================================

function handleTabKeydown(e, config) {
  // Só processa Tab (não Shift+Tab)
  if (e.key !== 'Tab' || e.shiftKey) return;
  
  const row = e.target.closest('.item-row');
  if (!row) return;
  
  const container = document.getElementById(config.containerId);
  const rows = container.querySelectorAll('.item-row');
  const currentIndex = parseInt(row.dataset.index);
  const isLastRow = currentIndex === rows.length - 1;
  
  // Verifica se estamos no último campo da linha (data/ano)
  const isLastField = e.target.classList.contains(config.dataClass);
  
  if (!isLastField) return; // Deixa o Tab normal funcionar entre campos da mesma linha
  
  e.preventDefault(); // Previne comportamento padrão do Tab
  
  if (isLinhaVazia(row, config)) {
    // Linha vazia: remove e vai para próximo item
    if (rows.length > 1) {
      removerLinha(row, config);
    }
    irParaProximoItem(config);
  } else if (isLinhaPreenchida(row, config)) {
    // Linha preenchida: adiciona nova linha e foca no primeiro campo
    const novoInput = adicionarNovaLinha(config);
    if (novoInput) {
      setTimeout(() => novoInput.focus(), 50);
    }
  }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

function initTabBehavior() {
  // Configura listeners para cada seção
  Object.keys(TAB_CONFIG).forEach(key => {
    const config = TAB_CONFIG[key];
    const container = document.getElementById(config.containerId);
    
    if (container) {
      // Usa delegação de eventos para capturar Tab em inputs dinâmicos
      container.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          handleTabKeydown(e, config);
        }
      });
    }
  });
  
  console.log('Tab behavior inicializado');
}

// ============================================================================
// EXPORTA PARA USO GLOBAL
// ============================================================================

window.tabBehavior = {
  init: initTabBehavior,
  isLinhaVazia: isLinhaVazia,
  isLinhaPreenchida: isLinhaPreenchida
};
