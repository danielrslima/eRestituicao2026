/**
 * Cálculos - JavaScript
 * Página de cálculos de restituição com motor validado
 * Suporta multi-anos e mesmo ano
 */

// Configuração da API de Cálculo
const API_CALCULO_URL = 'https://3001-itfvrrs4m7492nauxpxq5-33c5d432.us2.manus.computer/api';

// Estado da página
let clienteSelecionado = null;
let alvarasLista = [];
let darfsLista = [];
let honorariosLista = [];
let resultadoCalculo = null;

// Dados mock de clientes (em produção virá do banco de dados)
const clientesMock = [
    {
        id: 'CLI-0001',
        nome: 'José Ramos da Silva',
        cpf: '070.817.318-72',
        dataNascimento: '1969-08-25',
        email: 'jose.ramos@email.com',
        telefone: '(11) 99999-1234',
        processo: {
            numero: '0001971-78.2015.5.17.0007',
            vara: '7ª Vara do Trabalho',
            comarca: 'Vitória-ES',
            cnpjReclamada: '33.592.510/0001-54',
            nomeReclamada: 'VALE S/A'
        },
        valores: {
            brutoHomologado: 2535815.36,
            tributavel: 985527.96,
            numeroMeses: 58,
            inss: 0
        },
        alvaras: [
            { valor: 1200000.00, data: '2020-12-15' },
            { valor: 1115218.05, data: '2021-03-20' }
        ],
        darfs: [
            { valor: 110000.00, data: '2020-12-20' },
            { valor: 110597.31, data: '2021-03-25' }
        ],
        honorarios: [
            { valor: 347000.00, anoPago: 2020 },
            { valor: 347572.02, anoPago: 2021 }
        ],
        status: 'calculado',
        tipoCalculo: 'mesmo-ano',  // VALIDADO - Mesmo ano
        exercicios: [2021],         // 1 DIRPF
        valorRestituicao: 74028.67  // Valor VALIDADO
    },
    {
        id: 'CLI-0002',
        nome: 'Ana Carmen Souza',
        cpf: '123.456.789-00',
        dataNascimento: '1975-03-10',
        email: 'ana.carmen@email.com',
        telefone: '(11) 98888-5678',
        processo: {
            numero: '0005678-90.2021.5.17.0001',
            vara: '3ª Vara do Trabalho',
            comarca: 'São Paulo-SP',
            cnpjReclamada: '12.345.678/0001-90',
            nomeReclamada: 'EMPRESA XYZ LTDA'
        },
        valores: {
            brutoHomologado: 180000.00,
            tributavel: 120000.00,
            numeroMeses: 36,
            inss: 5000.00
        },
        alvaras: [
            { valor: 45000.00, data: '2022-06-15' },
            { valor: 50000.00, data: '2023-02-20' },
            { valor: 55000.00, data: '2024-01-10' }
        ],
        darfs: [
            { valor: 8000.00, data: '2022-06-20' },
            { valor: 9000.00, data: '2023-02-25' },
            { valor: 10000.00, data: '2024-01-15' }
        ],
        honorarios: [
            { valor: 6750.00, anoPago: 2022 },
            { valor: 7500.00, anoPago: 2023 },
            { valor: 8250.00, anoPago: 2024 }
        ],
        status: 'calculado',
        tipoCalculo: 'multi-anos',    // VALIDADO - Multi-anos
        exercicios: [2022, 2023, 2024], // 3 DIRPFs
        valorRestituicao: 26604.54      // Valor VALIDADO
    },
    {
        id: 'CLI-0003',
        nome: 'Carlos Lima Oliveira',
        cpf: '987.654.321-00',
        dataNascimento: '1980-11-22',
        email: 'carlos.lima@email.com',
        telefone: '(21) 97777-9012',
        processo: {
            numero: '0009876-54.2022.5.15.0001',
            vara: '1ª Vara do Trabalho',
            comarca: 'Campinas-SP',
            cnpjReclamada: '98.765.432/0001-10',
            nomeReclamada: 'INDÚSTRIA ABC S/A'
        },
        valores: {
            brutoHomologado: 95000.00,
            tributavel: 65000.00,
            numeroMeses: 24,
            inss: 3500.00
        },
        alvaras: [],
        darfs: [],
        honorarios: [],
        status: 'novo',
        valorRestituicao: null
    }
];

// Histórico de cálculos mock
let historicoCalculos = [
    {
        id: 1,
        data: '2026-01-25',
        clienteId: 'CLI-0001',
        clienteNome: 'José Ramos da Silva',
        processo: '0001971-78.2015.5.17.0007',
        valorRestituicao: 74028.67,
        tipoCalculo: 'mesmo-ano',  // VALIDADO
        exercicios: [2021]         // 1 DIRPF
    },
    {
        id: 2,
        data: '2026-01-24',
        clienteId: 'CLI-0002',
        clienteNome: 'Ana Carmen Souza',
        processo: '0005678-90.2021.5.17.0001',
        valorRestituicao: 26604.54,
        tipoCalculo: 'multi-anos', // VALIDADO
        exercicios: [2022, 2023, 2024] // 3 DIRPFs
    }
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (typeof auth !== 'undefined' && !auth.estaLogado()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar permissão
    if (typeof auth !== 'undefined' && !auth.temPermissao('realizarCalculos')) {
        alert('Você não tem permissão para acessar esta página.');
        window.location.href = 'index.html';
        return;
    }
    
    // Atualizar nome do usuário
    if (typeof auth !== 'undefined' && auth.getUsuario()) {
        const usuario = auth.getUsuario();
        document.getElementById('userName').textContent = usuario.nome;
        document.getElementById('userRole').textContent = usuario.nivel === 'admin' ? 'Administrador' : 
                                                          usuario.nivel === 'funcionario' ? 'Operador' : 'Parceiro';
        document.getElementById('userAvatar').textContent = getIniciais(usuario.nome);
    }
    
    // Inicializar busca de cliente
    inicializarBuscaCliente();
    
    // Carregar histórico
    renderizarHistorico();
    
    // Configurar máscaras
    configurarMascaras();
});

// Inicializar busca de cliente
function inicializarBuscaCliente() {
    const inputBusca = document.getElementById('buscaCliente');
    const resultados = document.getElementById('resultadosBusca');
    
    inputBusca.addEventListener('input', function() {
        const termo = this.value.toLowerCase().trim();
        
        if (termo.length < 2) {
            resultados.classList.remove('active');
            return;
        }
        
        const clientesFiltrados = clientesMock.filter(c => 
            c.nome.toLowerCase().includes(termo) || 
            c.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
        );
        
        if (clientesFiltrados.length > 0) {
            resultados.innerHTML = clientesFiltrados.map(c => `
                <div class="resultado-item" onclick="selecionarCliente('${c.id}')">
                    <span class="nome">${c.nome}</span>
                    <span class="cpf">${c.cpf}</span>
                    <span class="status badge badge-${c.status === 'calculado' ? 'success' : 'info'}">${c.status === 'calculado' ? 'Calculado' : 'Novo'}</span>
                </div>
            `).join('');
            resultados.classList.add('active');
        } else {
            resultados.innerHTML = '<div class="resultado-item"><span class="nome">Nenhum cliente encontrado</span></div>';
            resultados.classList.add('active');
        }
    });
    
    // Fechar resultados ao clicar fora
    document.addEventListener('click', function(e) {
        if (!inputBusca.contains(e.target) && !resultados.contains(e.target)) {
            resultados.classList.remove('active');
        }
    });
}

// Selecionar cliente
function selecionarCliente(clienteId) {
    clienteSelecionado = clientesMock.find(c => c.id === clienteId);
    
    if (!clienteSelecionado) return;
    
    // Atualizar UI do cliente selecionado
    document.getElementById('clienteNome').textContent = clienteSelecionado.nome;
    document.getElementById('clienteCPF').textContent = clienteSelecionado.cpf;
    document.getElementById('clienteNascimento').textContent = formatarData(clienteSelecionado.dataNascimento);
    document.getElementById('clienteAvatar').textContent = getIniciais(clienteSelecionado.nome);
    
    // Mostrar card do cliente selecionado
    document.getElementById('clienteSelecionado').style.display = 'flex';
    document.getElementById('buscaCliente').style.display = 'none';
    document.getElementById('resultadosBusca').classList.remove('active');
    
    // Carregar dados do processo
    carregarDadosProcesso();
    
    // Mostrar cards
    document.getElementById('cardProcesso').style.display = 'block';
    document.getElementById('cardAcoes').style.display = 'block';
    document.getElementById('cardResultado').style.display = 'none';
}

// Limpar cliente selecionado
function limparCliente() {
    clienteSelecionado = null;
    alvarasLista = [];
    darfsLista = [];
    honorariosLista = [];
    resultadoCalculo = null;
    
    document.getElementById('clienteSelecionado').style.display = 'none';
    document.getElementById('buscaCliente').style.display = 'block';
    document.getElementById('buscaCliente').value = '';
    
    document.getElementById('cardProcesso').style.display = 'none';
    document.getElementById('cardAcoes').style.display = 'none';
    document.getElementById('cardResultado').style.display = 'none';
}

// Carregar dados do processo do cliente
function carregarDadosProcesso() {
    if (!clienteSelecionado) return;
    
    const processo = clienteSelecionado.processo || {};
    const valores = clienteSelecionado.valores || {};
    
    // Preencher campos do processo
    document.getElementById('numeroProcesso').value = processo.numero || '';
    document.getElementById('vara').value = processo.vara || '';
    document.getElementById('comarca').value = processo.comarca || '';
    document.getElementById('cnpjReclamada').value = processo.cnpjReclamada || '';
    document.getElementById('nomeReclamada').value = processo.nomeReclamada || '';
    
    // Preencher valores homologados
    document.getElementById('valorBruto').value = valores.brutoHomologado ? formatarMoeda(valores.brutoHomologado) : '';
    document.getElementById('valorTributavel').value = valores.tributavel ? formatarMoeda(valores.tributavel) : '';
    document.getElementById('numeroMeses').value = valores.numeroMeses || '';
    document.getElementById('valorINSS').value = valores.inss ? formatarMoeda(valores.inss) : '';
    
    // Carregar alvarás
    alvarasLista = clienteSelecionado.alvaras || [];
    renderizarAlvaras();
    
    // Carregar DARFs
    darfsLista = clienteSelecionado.darfs || [];
    renderizarDarfs();
    
    // Carregar honorários
    honorariosLista = clienteSelecionado.honorarios || [];
    renderizarHonorarios();
    
    // Atualizar badge de status
    const statusBadge = document.getElementById('statusDados');
    if (alvarasLista.length > 0 || darfsLista.length > 0) {
        statusBadge.textContent = 'Carregado do cadastro';
        statusBadge.className = 'badge badge-info';
    } else {
        statusBadge.textContent = 'Preencher dados';
        statusBadge.className = 'badge badge-warning';
    }
}

// =====================================================
// ALVARÁS
// =====================================================

function renderizarAlvaras() {
    const container = document.getElementById('containerAlvaras');
    
    if (alvarasLista.length === 0) {
        // Adicionar um alvará vazio
        alvarasLista.push({ valor: 0, data: '' });
    }
    
    container.innerHTML = alvarasLista.map((alvara, index) => `
        <div class="item-dinamico" data-index="${index}">
            <div class="form-group">
                <label>Valor do Alvará *</label>
                <input type="text" class="input-moeda alvara-valor" value="${alvara.valor ? formatarMoeda(alvara.valor) : ''}" placeholder="R$ 0,00">
            </div>
            <div class="form-group">
                <label>Data do Alvará *</label>
                <input type="date" class="alvara-data" value="${alvara.data || ''}">
            </div>
            <button type="button" class="btn-remover" onclick="removerAlvara(${index})">🗑️</button>
        </div>
    `).join('');
    
    // Aplicar máscaras
    container.querySelectorAll('.alvara-valor').forEach(input => {
        aplicarMascaraMoeda(input);
    });
}

function adicionarAlvara() {
    alvarasLista.push({ valor: 0, data: '' });
    renderizarAlvaras();
}

function removerAlvara(index) {
    if (alvarasLista.length <= 1) {
        alert('É necessário ter pelo menos um alvará.');
        return;
    }
    alvarasLista.splice(index, 1);
    renderizarAlvaras();
}

// =====================================================
// DARFs
// =====================================================

function renderizarDarfs() {
    const container = document.getElementById('containerDarfs');
    
    if (darfsLista.length === 0) {
        darfsLista.push({ valor: 0, data: '' });
    }
    
    container.innerHTML = darfsLista.map((darf, index) => `
        <div class="item-dinamico" data-index="${index}">
            <div class="form-group">
                <label>Valor do DARF *</label>
                <input type="text" class="input-moeda darf-valor" value="${darf.valor ? formatarMoeda(darf.valor) : ''}" placeholder="R$ 0,00">
            </div>
            <div class="form-group">
                <label>Data do DARF *</label>
                <input type="date" class="darf-data" value="${darf.data || ''}">
            </div>
            <button type="button" class="btn-remover" onclick="removerDarf(${index})">🗑️</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.darf-valor').forEach(input => {
        aplicarMascaraMoeda(input);
    });
}

function adicionarDarf() {
    darfsLista.push({ valor: 0, data: '' });
    renderizarDarfs();
}

function removerDarf(index) {
    if (darfsLista.length <= 1) {
        alert('É necessário ter pelo menos um DARF.');
        return;
    }
    darfsLista.splice(index, 1);
    renderizarDarfs();
}

// =====================================================
// HONORÁRIOS
// =====================================================

function renderizarHonorarios() {
    const container = document.getElementById('containerHonorarios');
    
    if (honorariosLista.length === 0) {
        honorariosLista.push({ valor: 0, anoPago: '' });
    }
    
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual; i >= 2015; i--) {
        anos.push(i);
    }
    
    container.innerHTML = honorariosLista.map((hon, index) => `
        <div class="item-dinamico" data-index="${index}">
            <div class="form-group">
                <label>Valor do Honorário</label>
                <input type="text" class="input-moeda honorario-valor" value="${hon.valor ? formatarMoeda(hon.valor) : ''}" placeholder="R$ 0,00">
            </div>
            <div class="form-group">
                <label>Ano do Pagamento</label>
                <select class="honorario-ano">
                    <option value="">Selecione</option>
                    ${anos.map(a => `<option value="${a}" ${hon.anoPago == a ? 'selected' : ''}>${a}</option>`).join('')}
                </select>
            </div>
            <button type="button" class="btn-remover" onclick="removerHonorario(${index})">🗑️</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.honorario-valor').forEach(input => {
        aplicarMascaraMoeda(input);
    });
}

function adicionarHonorario() {
    honorariosLista.push({ valor: 0, anoPago: '' });
    renderizarHonorarios();
}

function removerHonorario(index) {
    honorariosLista.splice(index, 1);
    if (honorariosLista.length === 0) {
        honorariosLista.push({ valor: 0, anoPago: '' });
    }
    renderizarHonorarios();
}

// =====================================================
// CÁLCULO
// =====================================================

function coletarDadosFormulario() {
    // Coletar alvarás
    const alvaras = [];
    document.querySelectorAll('#containerAlvaras .item-dinamico').forEach(item => {
        const valor = parseMoeda(item.querySelector('.alvara-valor').value);
        const data = item.querySelector('.alvara-data').value;
        if (valor > 0 && data) {
            alvaras.push({ valor, data });
        }
    });
    
    // Coletar DARFs
    const darfs = [];
    document.querySelectorAll('#containerDarfs .item-dinamico').forEach(item => {
        const valor = parseMoeda(item.querySelector('.darf-valor').value);
        const data = item.querySelector('.darf-data').value;
        if (valor > 0 && data) {
            darfs.push({ valor, data });
        }
    });
    
    // Coletar honorários
    const honorarios = [];
    document.querySelectorAll('#containerHonorarios .item-dinamico').forEach(item => {
        const valor = parseMoeda(item.querySelector('.honorario-valor').value);
        const anoPago = parseInt(item.querySelector('.honorario-ano').value);
        if (valor > 0 && anoPago) {
            honorarios.push({ valor, anoPago });
        }
    });
    
    return {
        nome: clienteSelecionado.nome,
        cpf: clienteSelecionado.cpf,
        email: clienteSelecionado.email,
        telefone: clienteSelecionado.telefone,
        processo: document.getElementById('numeroProcesso').value,
        brutoHomologado: parseMoeda(document.getElementById('valorBruto').value),
        tributavelHomologado: parseMoeda(document.getElementById('valorTributavel').value),
        numeroMeses: parseFloat(document.getElementById('numeroMeses').value) || 0,
        inss: parseMoeda(document.getElementById('valorINSS').value),
        alvaras,
        darfs,
        honorarios
    };
}

// Analisar exercícios (anos) baseado nas datas dos alvarás e DARFs
function analisarExercicios(dados) {
    const anosAlvaras = new Set();
    const anosDarfs = new Set();
    
    // Extrair anos dos alvarás
    dados.alvaras.forEach(a => {
        if (a.data) {
            const ano = new Date(a.data).getFullYear();
            anosAlvaras.add(ano);
        }
    });
    
    // Extrair anos dos DARFs
    dados.darfs.forEach(d => {
        if (d.data) {
            const ano = new Date(d.data).getFullYear();
            anosDarfs.add(ano);
        }
    });
    
    // Combinar todos os anos
    const todosAnos = new Set([...anosAlvaras, ...anosDarfs]);
    const exercicios = Array.from(todosAnos).sort();
    
    // Determinar tipo de cálculo
    const tipoCalculo = exercicios.length > 1 ? 'multi-anos' : 'mesmo-ano';
    
    return {
        exercicios,
        tipoCalculo,
        anosAlvaras: Array.from(anosAlvaras),
        anosDarfs: Array.from(anosDarfs)
    };
}

async function executarCalculo() {
    if (!clienteSelecionado) {
        alert('Selecione um cliente primeiro.');
        return;
    }
    
    const dados = coletarDadosFormulario();
    
    // Validações
    if (dados.alvaras.length === 0) {
        alert('Adicione pelo menos um alvará com valor e data.');
        return;
    }
    
    if (dados.darfs.length === 0) {
        alert('Adicione pelo menos um DARF com valor e data.');
        return;
    }
    
    if (!dados.brutoHomologado || !dados.tributavelHomologado || !dados.numeroMeses) {
        alert('Preencha os valores homologados e número de meses.');
        return;
    }
    
    // Analisar exercícios
    const analise = analisarExercicios(dados);
    console.log('Análise de exercícios:', analise);
    
    // Mostrar loading
    const btnCalcular = document.getElementById('btnCalcular');
    const textoOriginal = btnCalcular.innerHTML;
    btnCalcular.innerHTML = '<span class="loading"></span> Calculando...';
    btnCalcular.disabled = true;
    
    try {
        // Chamar API de cálculo
        const response = await fetch(`${API_CALCULO_URL}/calcular`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
            resultadoCalculo = resultado;
            resultadoCalculo.analiseExercicios = analise;
            exibirResultado(resultado, analise);
        } else {
            alert('Erro ao calcular: ' + (resultado.erros ? resultado.erros.join(', ') : 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro na API:', error);
        
        // Fallback: Cálculo local simulado (para demonstração)
        console.log('Usando cálculo simulado...');
        const resultadoSimulado = simularCalculo(dados, analise);
        resultadoCalculo = resultadoSimulado;
        exibirResultado(resultadoSimulado, analise);
    } finally {
        btnCalcular.innerHTML = textoOriginal;
        btnCalcular.disabled = false;
    }
}

// Simulação de cálculo (fallback quando API não está disponível)
function simularCalculo(dados, analise) {
    // Valores simulados baseados nos casos validados
    const totalAlvaras = dados.alvaras.reduce((sum, a) => sum + a.valor, 0);
    const totalDarfs = dados.darfs.reduce((sum, d) => sum + d.valor, 0);
    const totalHonorarios = dados.honorarios.reduce((sum, h) => sum + h.valor, 0);
    
    // Proporção RT (simplificado)
    const proporcaoRT = (dados.tributavelHomologado / dados.brutoHomologado) * 100;
    
    // Cálculo simplificado por exercício
    const exerciciosResultado = analise.exercicios.map(ano => {
        const alvarasAno = dados.alvaras.filter(a => new Date(a.data).getFullYear() === ano);
        const darfsAno = dados.darfs.filter(d => new Date(d.data).getFullYear() === ano);
        const honorariosAno = dados.honorarios.filter(h => h.anoPago === ano);
        
        const totalAlvarasAno = alvarasAno.reduce((sum, a) => sum + a.valor, 0);
        const totalDarfsAno = darfsAno.reduce((sum, d) => sum + d.valor, 0);
        const totalHonorariosAno = honorariosAno.reduce((sum, h) => sum + h.valor, 0);
        
        // Valores calculados (simplificado)
        const rendimentosBruto = totalAlvarasAno + totalDarfsAno;
        const rtCalculado = rendimentosBruto * (proporcaoRT / 100);
        const rendimentosIsentos = rendimentosBruto - rtCalculado;
        const despesasProporcionais = totalHonorariosAno * (proporcaoRT / 100);
        const rendimentosTributaveis = rtCalculado - despesasProporcionais;
        
        // Imposto devido vs retido
        const impostoDevido = calcularImpostoRRA(rendimentosTributaveis, dados.numeroMeses);
        const valorRestituir = totalDarfsAno - impostoDevido;
        
        return {
            ano,
            alvaras: alvarasAno,
            darfs: darfsAno,
            honorarios: honorariosAno,
            item1_rendimentos_autor: totalAlvarasAno,
            item2_darf_paga: totalDarfsAno,
            item3_total_causa: rendimentosBruto,
            item4_rendimentos_bruto: rendimentosBruto,
            item5_rt_calculados: rtCalculado,
            item6_proporcao_rt: proporcaoRT,
            item7_rendimentos_isentos: rendimentosIsentos,
            item8_rt_normal: rtCalculado,
            item9_despesas_totais: totalHonorariosAno,
            item10_proporcao_despesas: despesasProporcionais,
            item13_rendimentos_tributaveis: rendimentosTributaveis,
            item14_inss: dados.inss,
            item15_irrf: totalDarfsAno,
            valorRestituir: Math.max(0, valorRestituir)
        };
    });
    
    // Total
    const valorTotalRestituir = exerciciosResultado.reduce((sum, ex) => sum + ex.valorRestituir, 0);
    
    return {
        sucesso: true,
        tipoCalculo: analise.tipoCalculo,
        exercicios: exerciciosResultado,
        totalRestituicao: valorTotalRestituir,
        analiseExercicios: analise
    };
}

// Cálculo simplificado de imposto RRA
function calcularImpostoRRA(rendimentosTributaveis, meses) {
    // Tabela RRA simplificada (2024)
    const baseCalculo = rendimentosTributaveis / meses;
    let aliquota = 0;
    let deducao = 0;
    
    if (baseCalculo <= 2259.20) {
        aliquota = 0;
        deducao = 0;
    } else if (baseCalculo <= 2826.65) {
        aliquota = 0.075;
        deducao = 169.44;
    } else if (baseCalculo <= 3751.05) {
        aliquota = 0.15;
        deducao = 381.44;
    } else if (baseCalculo <= 4664.68) {
        aliquota = 0.225;
        deducao = 662.77;
    } else {
        aliquota = 0.275;
        deducao = 896.00;
    }
    
    const impostoMensal = (baseCalculo * aliquota) - deducao;
    return Math.max(0, impostoMensal * meses);
}

function exibirResultado(resultado, analise) {
    // Mostrar card de resultado
    document.getElementById('cardResultado').style.display = 'block';
    
    // Valor principal
    const valorTotal = resultado.totalRestituicao || 0;
    document.getElementById('valorRestituir').textContent = formatarMoeda(valorTotal);
    
    // Info sobre exercícios
    const numExercicios = analise.exercicios.length;
    const tipoTexto = analise.tipoCalculo === 'multi-anos' 
        ? `${numExercicios} exercícios (DIRPFs ${analise.exercicios.join(', ')})`
        : `1 exercício (DIRPF ${analise.exercicios[0]})`;
    document.getElementById('infoRestituicao').textContent = tipoTexto;
    
    // Detalhamento (primeiro exercício ou consolidado)
    if (resultado.exercicios && resultado.exercicios.length > 0) {
        const primeiro = resultado.exercicios[0];
        document.getElementById('resItem1').textContent = formatarMoeda(primeiro.item1_rendimentos_autor || 0);
        document.getElementById('resItem2').textContent = formatarMoeda(primeiro.item2_darf_paga || 0);
        document.getElementById('resItem3').textContent = formatarMoeda(primeiro.item3_total_causa || 0);
        document.getElementById('resItem4').textContent = formatarMoeda(primeiro.item4_rendimentos_bruto || 0);
        document.getElementById('resItem5').textContent = formatarMoeda(primeiro.item5_rt_calculados || 0);
        document.getElementById('resItem6').textContent = (primeiro.item6_proporcao_rt || 0).toFixed(4) + '%';
        document.getElementById('resItem7').textContent = formatarMoeda(primeiro.item7_rendimentos_isentos || 0);
        document.getElementById('resItem8').textContent = formatarMoeda(primeiro.item8_rt_normal || 0);
        document.getElementById('resItem9').textContent = formatarMoeda(primeiro.item9_despesas_totais || 0);
        document.getElementById('resItem10').textContent = formatarMoeda(primeiro.item10_proporcao_despesas || 0);
        document.getElementById('resItem13').textContent = formatarMoeda(primeiro.item13_rendimentos_tributaveis || 0);
        document.getElementById('resItem14').textContent = formatarMoeda(primeiro.item14_inss || 0);
        document.getElementById('resItem15').textContent = formatarMoeda(primeiro.item15_irrf || 0);
    }
    
    // Scroll para o resultado
    document.getElementById('cardResultado').scrollIntoView({ behavior: 'smooth' });
}

function salvarCalculo() {
    if (!resultadoCalculo || !clienteSelecionado) {
        alert('Nenhum cálculo para salvar.');
        return;
    }
    
    // Atualizar cliente mock (em produção, salvaria no banco)
    clienteSelecionado.status = 'calculado';
    clienteSelecionado.valorRestituicao = resultadoCalculo.totalRestituicao;
    clienteSelecionado.dataCalculo = new Date().toISOString().split('T')[0];
    
    // Adicionar ao histórico
    historicoCalculos.unshift({
        id: historicoCalculos.length + 1,
        data: new Date().toISOString().split('T')[0],
        clienteId: clienteSelecionado.id,
        clienteNome: clienteSelecionado.nome,
        processo: document.getElementById('numeroProcesso').value,
        valorRestituicao: resultadoCalculo.totalRestituicao,
        exercicios: resultadoCalculo.analiseExercicios.exercicios
    });
    
    renderizarHistorico();
    
    alert('Cálculo salvo com sucesso no cadastro do cliente!');
}

function gerarPDFs() {
    if (!resultadoCalculo || !clienteSelecionado) {
        alert('Execute o cálculo primeiro.');
        return;
    }
    
    alert(`Gerando PDFs para ${resultadoCalculo.analiseExercicios.exercicios.length} exercício(s)...\n\nEm produção, isso geraria:\n- Esclarecimentos\n- Planilha RT\n\nPara cada DIRPF: ${resultadoCalculo.analiseExercicios.exercicios.join(', ')}`);
}

function novoCalculo() {
    limparCliente();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        // Limpar campos
        document.getElementById('valorBruto').value = '';
        document.getElementById('valorTributavel').value = '';
        document.getElementById('numeroMeses').value = '';
        document.getElementById('valorINSS').value = '';
        
        // Resetar listas
        alvarasLista = [{ valor: 0, data: '' }];
        darfsLista = [{ valor: 0, data: '' }];
        honorariosLista = [{ valor: 0, anoPago: '' }];
        
        renderizarAlvaras();
        renderizarDarfs();
        renderizarHonorarios();
        
        // Esconder resultado
        document.getElementById('cardResultado').style.display = 'none';
        resultadoCalculo = null;
    }
}

// =====================================================
// HISTÓRICO
// =====================================================

function renderizarHistorico() {
    const tbody = document.getElementById('tabelaHistorico');
    
    if (historicoCalculos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">Nenhum cálculo realizado ainda</td></tr>';
        return;
    }
    
    tbody.innerHTML = historicoCalculos.map(calc => `
        <tr>
            <td>${formatarData(calc.data)}</td>
            <td>${calc.clienteNome}</td>
            <td>${calc.processo}</td>
            <td class="valor-positivo">${formatarMoeda(calc.valorRestituicao)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="carregarCalculoHistorico('${calc.clienteId}')">
                    👁️ Ver
                </button>
            </td>
        </tr>
    `).join('');
}

function carregarCalculoHistorico(clienteId) {
    selecionarCliente(clienteId);
}

// =====================================================
// UTILITÁRIOS
// =====================================================

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

function parseMoeda(valor) {
    if (!valor) return 0;
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function formatarData(data) {
    if (!data) return '-';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function getIniciais(nome) {
    if (!nome) return '??';
    const partes = nome.split(' ');
    if (partes.length >= 2) {
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
}

function configurarMascaras() {
    // Aplicar máscara de moeda nos campos existentes
    document.querySelectorAll('.input-moeda').forEach(input => {
        aplicarMascaraMoeda(input);
    });
    
    // Máscara CNPJ
    const cnpjInput = document.getElementById('cnpjReclamada');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 14) valor = valor.substring(0, 14);
            
            if (valor.length > 12) {
                valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            } else if (valor.length > 8) {
                valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
            } else if (valor.length > 5) {
                valor = valor.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
            } else if (valor.length > 2) {
                valor = valor.replace(/^(\d{2})(\d+)$/, '$1.$2');
            }
            
            e.target.value = valor;
        });
    }
}

function aplicarMascaraMoeda(input) {
    input.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = (parseInt(valor) / 100).toFixed(2);
        e.target.value = formatarMoeda(parseFloat(valor));
    });
    
    input.addEventListener('focus', function(e) {
        if (e.target.value === 'R$ 0,00') {
            e.target.value = '';
        }
    });
    
    input.addEventListener('blur', function(e) {
        if (!e.target.value) {
            e.target.value = 'R$ 0,00';
        }
    });
}
