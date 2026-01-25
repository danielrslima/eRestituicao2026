/* ========================================
   UTILITÁRIOS - VALIDAÇÕES, MÁSCARAS E CEP
   e-Restituição Dashboard
   ======================================== */

// ========================================
// VALIDAÇÃO DE CPF
// ========================================

/**
 * Valida CPF com verificação de dígitos
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} - true se válido
 */
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 * @param {string} valor - Valor a ser formatado
 * @returns {string} - CPF formatado
 */
function mascaraCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return valor;
}

// ========================================
// VALIDAÇÃO DE CNPJ
// ========================================

/**
 * Valida CNPJ com verificação de dígitos
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean} - true se válido
 */
function validarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Validação do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 * @param {string} valor - Valor a ser formatado
 * @returns {string} - CNPJ formatado
 */
function mascaraCNPJ(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 14);
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    return valor;
}

// ========================================
// MÁSCARA DE CEP
// ========================================

/**
 * Aplica máscara de CEP (00000-000)
 * @param {string} valor - Valor a ser formatado
 * @returns {string} - CEP formatado
 */
function mascaraCEP(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 8);
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    return valor;
}

// ========================================
// BUSCA DE ENDEREÇO POR CEP (ViaCEP)
// ========================================

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 * @param {string} cep - CEP com ou sem formatação
 * @param {function} callback - Função chamada com o resultado
 */
async function buscarEnderecoPorCEP(cep) {
    // Remove caracteres não numéricos
    cep = cep.replace(/\D/g, '');
    
    // Verifica se tem 8 dígitos
    if (cep.length !== 8) {
        return { erro: true, mensagem: 'CEP deve ter 8 dígitos' };
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            return { erro: true, mensagem: 'CEP não encontrado' };
        }
        
        return {
            erro: false,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
            ibge: data.ibge || ''
        };
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        return { erro: true, mensagem: 'Erro ao buscar CEP. Tente novamente.' };
    }
}

// ========================================
// MÁSCARAS DE TELEFONE
// ========================================

/**
 * Aplica máscara de telefone (00) 00000-0000 ou (00) 0000-0000
 * @param {string} valor - Valor a ser formatado
 * @returns {string} - Telefone formatado
 */
function mascaraTelefone(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    
    if (valor.length > 10) {
        // Celular: (00) 00000-0000
        valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length > 6) {
        // Fixo: (00) 0000-0000
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else if (valor.length > 0) {
        valor = valor.replace(/(\d{0,2})/, '($1');
    }
    
    return valor;
}

// ========================================
// APLICAÇÃO AUTOMÁTICA DE MÁSCARAS E VALIDAÇÕES
// ========================================

/**
 * Configura campo de CPF com máscara e validação
 * @param {HTMLElement} input - Elemento input
 */
function configurarCampoCPF(input) {
    if (!input) return;
    
    // Aplicar máscara ao digitar
    input.addEventListener('input', function(e) {
        let valor = e.target.value;
        e.target.value = mascaraCPF(valor);
    });
    
    // Validar ao sair do campo
    input.addEventListener('blur', function(e) {
        const valor = e.target.value;
        if (valor.length > 0) {
            if (validarCPF(valor)) {
                e.target.classList.remove('input-invalido');
                e.target.classList.add('input-valido');
                e.target.setCustomValidity('');
            } else {
                e.target.classList.remove('input-valido');
                e.target.classList.add('input-invalido');
                e.target.setCustomValidity('CPF inválido');
            }
        } else {
            e.target.classList.remove('input-valido', 'input-invalido');
            e.target.setCustomValidity('');
        }
    });
    
    // Definir atributos
    input.setAttribute('maxlength', '14');
    input.setAttribute('placeholder', '000.000.000-00');
}

/**
 * Configura campo de CNPJ com máscara e validação
 * @param {HTMLElement} input - Elemento input
 */
function configurarCampoCNPJ(input) {
    if (!input) return;
    
    // Aplicar máscara ao digitar
    input.addEventListener('input', function(e) {
        let valor = e.target.value;
        e.target.value = mascaraCNPJ(valor);
    });
    
    // Validar ao sair do campo
    input.addEventListener('blur', function(e) {
        const valor = e.target.value;
        if (valor.length > 0) {
            if (validarCNPJ(valor)) {
                e.target.classList.remove('input-invalido');
                e.target.classList.add('input-valido');
                e.target.setCustomValidity('');
            } else {
                e.target.classList.remove('input-valido');
                e.target.classList.add('input-invalido');
                e.target.setCustomValidity('CNPJ inválido');
            }
        } else {
            e.target.classList.remove('input-valido', 'input-invalido');
            e.target.setCustomValidity('');
        }
    });
    
    // Definir atributos
    input.setAttribute('maxlength', '18');
    input.setAttribute('placeholder', '00.000.000/0000-00');
}

/**
 * Configura campo de CEP com máscara e busca automática
 * @param {HTMLElement} inputCEP - Elemento input do CEP
 * @param {object} camposEndereco - Objeto com os elementos dos campos de endereço
 */
function configurarCampoCEP(inputCEP, camposEndereco = {}) {
    if (!inputCEP) return;
    
    // Aplicar máscara ao digitar
    inputCEP.addEventListener('input', function(e) {
        let valor = e.target.value;
        e.target.value = mascaraCEP(valor);
    });
    
    // Buscar endereço ao completar o CEP
    inputCEP.addEventListener('blur', async function(e) {
        const cep = e.target.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            // Mostrar loading
            e.target.classList.add('input-loading');
            
            const endereco = await buscarEnderecoPorCEP(cep);
            
            // Remover loading
            e.target.classList.remove('input-loading');
            
            if (!endereco.erro) {
                // Preencher campos automaticamente
                if (camposEndereco.logradouro) {
                    camposEndereco.logradouro.value = endereco.logradouro;
                }
                if (camposEndereco.bairro) {
                    camposEndereco.bairro.value = endereco.bairro;
                }
                if (camposEndereco.cidade) {
                    camposEndereco.cidade.value = endereco.cidade;
                }
                if (camposEndereco.estado) {
                    camposEndereco.estado.value = endereco.estado;
                }
                
                e.target.classList.remove('input-invalido');
                e.target.classList.add('input-valido');
                
                // Focar no campo número após buscar
                if (camposEndereco.numero) {
                    camposEndereco.numero.focus();
                }
            } else {
                e.target.classList.remove('input-valido');
                e.target.classList.add('input-invalido');
                alert('⚠️ ' + endereco.mensagem);
            }
        }
    });
    
    // Definir atributos
    inputCEP.setAttribute('maxlength', '9');
    inputCEP.setAttribute('placeholder', '00000-000');
}

/**
 * Configura campo de telefone com máscara
 * @param {HTMLElement} input - Elemento input
 */
function configurarCampoTelefone(input) {
    if (!input) return;
    
    // Aplicar máscara ao digitar
    input.addEventListener('input', function(e) {
        let valor = e.target.value;
        e.target.value = mascaraTelefone(valor);
    });
    
    // Definir atributos
    input.setAttribute('maxlength', '15');
    input.setAttribute('placeholder', '(00) 00000-0000');
}

// ========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================================

/**
 * Inicializa todas as máscaras e validações automaticamente
 * Busca campos por ID ou classe ou data-mascara
 */
function inicializarValidacoes() {
    // Campos de CPF (por ID ou classe ou data-mascara)
    const camposCPF = document.querySelectorAll('#cpf, .campo-cpf, [data-mascara="cpf"]');
    camposCPF.forEach(campo => {
        if (!campo.dataset.validacaoConfigurada) {
            configurarCampoCPF(campo);
            campo.dataset.validacaoConfigurada = 'true';
        }
    });
    
    // Campos de CNPJ (por ID ou classe ou data-mascara)
    const camposCNPJ = document.querySelectorAll('#cnpj, #cnpjReclamada, #cnpjEmpresa, .campo-cnpj, [data-mascara="cnpj"]');
    camposCNPJ.forEach(campo => {
        if (!campo.dataset.validacaoConfigurada) {
            configurarCampoCNPJ(campo);
            campo.dataset.validacaoConfigurada = 'true';
        }
    });
    
    // Campos de CEP com endereço
    const campoCEP = document.getElementById('cep');
    if (campoCEP && !campoCEP.dataset.validacaoConfigurada) {
        configurarCampoCEP(campoCEP, {
            logradouro: document.getElementById('logradouro'),
            bairro: document.getElementById('bairro'),
            cidade: document.getElementById('cidade'),
            estado: document.getElementById('estado') || document.getElementById('uf'),
            numero: document.getElementById('numero')
        });
        campoCEP.dataset.validacaoConfigurada = 'true';
    }
    
    // Campos de telefone
    const camposTelefone = document.querySelectorAll('.campo-telefone, [data-mascara="telefone"], #telefoneEmpresa');
    camposTelefone.forEach(campo => {
        if (!campo.dataset.validacaoConfigurada) {
            configurarCampoTelefone(campo);
            campo.dataset.validacaoConfigurada = 'true';
        }
    });
    
    console.log('✅ Validações e máscaras inicializadas');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(inicializarValidacoes, 100);
});

// ========================================
// EXPORTAR FUNÇÕES GLOBAIS
// ========================================

window.validarCPF = validarCPF;
window.validarCNPJ = validarCNPJ;
window.mascaraCPF = mascaraCPF;
window.mascaraCNPJ = mascaraCNPJ;
window.mascaraCEP = mascaraCEP;
window.mascaraTelefone = mascaraTelefone;
window.buscarEnderecoPorCEP = buscarEnderecoPorCEP;
window.configurarCampoCPF = configurarCampoCPF;
window.configurarCampoCNPJ = configurarCampoCNPJ;
window.configurarCampoCEP = configurarCampoCEP;
window.configurarCampoTelefone = configurarCampoTelefone;
window.inicializarValidacoes = inicializarValidacoes;
