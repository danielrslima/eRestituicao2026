/**
 * Validações e Formatações de Campos
 * e-Restituição
 */

// ============================================================================
// 1. VALIDAÇÃO DE CPF
// ============================================================================

function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Cálculo do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  // Cálculo do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// ============================================================================
// 2. VALIDAÇÃO DE CNPJ
// ============================================================================

function validarCNPJ(cnpj) {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Cálculo do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Cálculo do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

// ============================================================================
// 3. FORMATAÇÃO DE TEXTO (Iniciais Maiúsculas, Preposições Minúsculas)
// ============================================================================

function formatarNomeProprio(texto) {
  if (!texto) return '';
  
  // Lista de preposições e artigos em português
  const preposicoes = [
    'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos',
    'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'para', 'por', 'com'
  ];
  
  // Divide o texto em palavras
  const palavras = texto.toLowerCase().trim().split(/\s+/);
  
  // Formata cada palavra
  const formatadas = palavras.map((palavra, index) => {
    // Primeira palavra sempre com inicial maiúscula
    if (index === 0) {
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }
    
    // Preposições em minúsculo
    if (preposicoes.includes(palavra)) {
      return palavra;
    }
    
    // Demais palavras com inicial maiúscula
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
  });
  
  return formatadas.join(' ');
}

// ============================================================================
// 4. FORMATAÇÃO DE FONTE PAGADORA (S/A sempre maiúsculo)
// ============================================================================

function formatarFontePagadora(texto) {
  if (!texto) return '';
  
  // Primeiro aplica formatação de nome próprio
  let formatado = formatarNomeProprio(texto);
  
  // Corrige S/A, S.A., SA para S/A
  formatado = formatado.replace(/\bS\/a\b/gi, 'S/A');
  formatado = formatado.replace(/\bS\.a\b/gi, 'S/A');
  formatado = formatado.replace(/\bS\.A\b/gi, 'S/A');
  formatado = formatado.replace(/\bSa\b/g, 'S/A');
  formatado = formatado.replace(/\bs\/a\b/gi, 'S/A');
  
  // Corrige LTDA, Ltda para Ltda.
  formatado = formatado.replace(/\bLtda\.?\b/gi, 'Ltda.');
  
  // Corrige ME, EPP
  formatado = formatado.replace(/\bMe\b/g, 'ME');
  formatado = formatado.replace(/\bEpp\b/g, 'EPP');
  formatado = formatado.replace(/\bEireli\b/gi, 'EIRELI');
  
  return formatado;
}

// ============================================================================
// 5. MÁSCARA DE NÚMERO DE PROCESSO
// ============================================================================

function maskProcesso(value) {
  // Remove tudo que não é número
  let numeros = value.replace(/\D/g, '');
  
  // Limita a 20 dígitos
  numeros = numeros.substring(0, 20);
  
  // Aplica máscara: XXXXXXX-XX.XXXX.X.XX.XXXX
  let formatado = '';
  
  if (numeros.length > 0) {
    formatado = numeros.substring(0, 7);
  }
  if (numeros.length > 7) {
    formatado += '-' + numeros.substring(7, 9);
  }
  if (numeros.length > 9) {
    formatado += '.' + numeros.substring(9, 13);
  }
  if (numeros.length > 13) {
    formatado += '.' + numeros.substring(13, 14);
  }
  if (numeros.length > 14) {
    formatado += '.' + numeros.substring(14, 16);
  }
  if (numeros.length > 16) {
    formatado += '.' + numeros.substring(16, 20);
  }
  
  return formatado;
}

// ============================================================================
// 6. VALIDAÇÃO E FORMATAÇÃO DE ANO
// ============================================================================

function validarAno(ano) {
  // Remove não numéricos
  ano = ano.replace(/\D/g, '');
  
  // Verifica se tem 4 dígitos
  if (ano.length !== 4) return false;
  
  const anoNum = parseInt(ano);
  
  // Verifica se está entre 2020 e 2100
  return anoNum >= 2020 && anoNum <= 2100;
}

function maskAno(value) {
  // Remove tudo que não é número
  let numeros = value.replace(/\D/g, '');
  
  // Limita a 4 dígitos
  return numeros.substring(0, 4);
}

// ============================================================================
// 7. FORMATAÇÃO DE VARA (1-2 dígitos + ª)
// ============================================================================

function formatarVara(texto) {
  if (!texto) return '';
  
  // Extrai apenas os números do início
  const match = texto.match(/^(\d{1,2})/);
  
  if (match) {
    const numero = match[1];
    // Remove o número do início e pega o resto
    let resto = texto.substring(match[0].length).trim();
    
    // Remove qualquer "ª", "a", "º" existente no início do resto
    resto = resto.replace(/^[ªaº]+\s*/i, '');
    
    // Se não tem resto ou é muito curto, assume "Vara do Trabalho"
    if (!resto || resto.length < 3) {
      resto = 'Vara do Trabalho';
    } else {
      // Verifica se começa com "Vara" ou "vara"
      if (resto.toLowerCase().startsWith('vara')) {
        // Se não tem "do" ou "da" depois de "Vara", adiciona
        if (!resto.toLowerCase().match(/^vara\s+(do|da)\s+/i)) {
          resto = resto.replace(/^vara\s*/i, 'Vara do ');
        }
      }
      // Formata o resto como nome próprio
      resto = formatarNomeProprio(resto);
    }
    
    return numero + 'ª ' + resto;
  }
  
  return texto;
}

function maskVara(value) {
  // Permite apenas números no início (1-2 dígitos) seguido de texto
  let resultado = value;
  
  // Se começa com número, formata
  const match = value.match(/^(\d{1,2})(.*)/);
  if (match) {
    const numero = match[1];
    let resto = match[2];
    
    // Remove "ª" ou "a" duplicados
    resto = resto.replace(/^[ªaº]+\s*/i, '');
    
    resultado = numero + 'ª ' + resto;
  }
  
  return resultado;
}

// ============================================================================
// 8. VALIDAÇÃO DE DATA
// ============================================================================

function validarData(data) {
  // Formato esperado: DD/MM/AAAA
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = data.match(regex);
  
  if (!match) return false;
  
  const dia = parseInt(match[1]);
  const mes = parseInt(match[2]);
  const ano = parseInt(match[3]);
  
  // Verifica mês válido
  if (mes < 1 || mes > 12) return false;
  
  // Verifica dia válido
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) return false;
  
  // Verifica ano razoável (2000 a 2100)
  if (ano < 2000 || ano > 2100) return false;
  
  return true;
}

// ============================================================================
// 9. INICIALIZAÇÃO DAS VALIDAÇÕES
// ============================================================================

function initValidations() {
  // CPF - validação e formatação
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('blur', function() {
      if (this.value && !validarCPF(this.value)) {
        this.classList.add('invalid');
        mostrarErro(this, 'CPF inválido');
      } else {
        this.classList.remove('invalid');
        removerErro(this);
      }
    });
  }
  
  // CNPJ da Fonte Pagadora - validação
  const cnpjInputs = document.querySelectorAll('.cnpj-input');
  cnpjInputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value && !validarCNPJ(this.value)) {
        this.classList.add('invalid');
        mostrarErro(this, 'CNPJ inválido');
      } else {
        this.classList.remove('invalid');
        removerErro(this);
      }
    });
  });
  
  // Nome - formatação
  const nomeInput = document.getElementById('nome');
  if (nomeInput) {
    nomeInput.addEventListener('blur', function() {
      this.value = formatarNomeProprio(this.value);
    });
  }
  
  // Comarca - formatação
  const comarcaInput = document.getElementById('comarca');
  if (comarcaInput) {
    comarcaInput.addEventListener('blur', function() {
      this.value = formatarNomeProprio(this.value);
    });
  }
  
  // Fonte Pagadora - formatação
  const fontePagadoraInputs = document.querySelectorAll('.fonte-pagadora-input');
  fontePagadoraInputs.forEach(input => {
    input.addEventListener('blur', function() {
      this.value = formatarFontePagadora(this.value);
    });
  });
  
  // Número do Processo - máscara
  const processoInput = document.getElementById('numeroProcesso');
  if (processoInput) {
    processoInput.addEventListener('input', function() {
      this.value = maskProcesso(this.value);
    });
  }
  
  // Vara - formatação
  const varaInput = document.getElementById('vara');
  if (varaInput) {
    varaInput.addEventListener('blur', function() {
      this.value = formatarVara(this.value);
    });
    varaInput.addEventListener('input', function() {
      // Permite apenas números no início
      const match = this.value.match(/^(\d{0,2})(.*)/);
      if (match && match[1].length > 0) {
        // Mantém o valor como está durante digitação
      }
    });
  }
  
  // Anos - validação
  const anoInputs = document.querySelectorAll('.ano-input');
  anoInputs.forEach(input => {
    input.addEventListener('input', function() {
      this.value = maskAno(this.value);
    });
    input.addEventListener('blur', function() {
      if (this.value && !validarAno(this.value)) {
        this.classList.add('invalid');
        mostrarErro(this, 'Ano deve estar entre 2020 e 2100');
      } else {
        this.classList.remove('invalid');
        removerErro(this);
      }
    });
  });
}

// Função auxiliar para mostrar erro
function mostrarErro(input, mensagem) {
  // Remove erro anterior se existir
  removerErro(input);
  
  // Cria elemento de erro
  const erro = document.createElement('span');
  erro.className = 'error-message';
  erro.textContent = mensagem;
  erro.style.color = '#dc3545';
  erro.style.fontSize = '12px';
  erro.style.display = 'block';
  erro.style.marginTop = '4px';
  
  // Insere após o input
  input.parentNode.insertBefore(erro, input.nextSibling);
}

// Função auxiliar para remover erro
function removerErro(input) {
  const erro = input.parentNode.querySelector('.error-message');
  if (erro) {
    erro.remove();
  }
}

// ============================================================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ============================================================================

window.validations = {
  cpf: validarCPF,
  cnpj: validarCNPJ,
  data: validarData,
  ano: validarAno,
  formatarNome: formatarNomeProprio,
  formatarFontePagadora: formatarFontePagadora,
  formatarVara: formatarVara,
  maskProcesso: maskProcesso,
  maskAno: maskAno,
  maskVara: maskVara,
  init: initValidations,
  mostrarErro: mostrarErro,
  removerErro: removerErro
};
