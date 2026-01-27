/**
 * Máscaras e Formatação de Campos
 * e-Restituição
 */

// Máscara de CPF: 000.000.000-00
function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

// Máscara de Telefone: (00) 00000-0000
function maskPhone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

// Máscara de CNPJ: 00.000.000/0000-00
function maskCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

// Máscara de Dinheiro: R$ 0,00
function maskMoney(value) {
  // Remove tudo que não é número
  let numericValue = value.replace(/\D/g, '');
  
  // Se vazio, retorna R$ 0,00
  if (!numericValue) {
    return 'R$ 0,00';
  }
  
  // Converte para número (centavos)
  let number = parseInt(numericValue, 10);
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number / 100);
}

// Converte valor formatado para número puro (para cálculos)
function moneyToNumber(value) {
  if (!value) return 0;
  // Remove R$, pontos e substitui vírgula por ponto
  return parseFloat(
    value
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  ) || 0;
}

// Formata número para moeda brasileira (para exibição)
function numberToMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Máscara de Data: DD/MM/AAAA (limita ano a 4 dígitos)
function maskDate(value) {
  // Remove tudo que não é número
  let numeros = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos (DDMMAAAA)
  numeros = numeros.substring(0, 8);
  
  // Aplica máscara
  let formatado = '';
  if (numeros.length > 0) {
    formatado = numeros.substring(0, 2);
  }
  if (numeros.length > 2) {
    formatado += '/' + numeros.substring(2, 4);
  }
  if (numeros.length > 4) {
    formatado += '/' + numeros.substring(4, 8);
  }
  
  return formatado;
}

// Converte data DD/MM/AAAA para AAAA-MM-DD (ISO)
function dateToISO(value) {
  if (!value || value.length < 10) return '';
  const parts = value.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Converte data ISO para DD/MM/AAAA
function isoToDate(value) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Aplica máscara em um campo
function applyMask(input, maskFunction) {
  input.addEventListener('input', function(e) {
    e.target.value = maskFunction(e.target.value);
  });
}

// Inicializa máscaras nos campos
function initMasks() {
  // CPF
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    applyMask(cpfInput, maskCPF);
  }

  // Telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    applyMask(telefoneInput, maskPhone);
  }

  // CNPJ (todos os campos com classe cnpj-input)
  const cnpjInputs = document.querySelectorAll('.cnpj-input, #cnpj');
  cnpjInputs.forEach(input => {
    applyMask(input, maskCNPJ);
  });

  // Campos de dinheiro
  const moneyInputs = document.querySelectorAll('.money-input');
  moneyInputs.forEach(input => {
    applyMask(input, maskMoney);
  });
}

// Exporta funções para uso global
window.masks = {
  cpf: maskCPF,
  phone: maskPhone,
  cnpj: maskCNPJ,
  money: maskMoney,
  date: maskDate,
  moneyToNumber: moneyToNumber,
  numberToMoney: numberToMoney,
  dateToISO: dateToISO,
  isoToDate: isoToDate,
  init: initMasks
};
