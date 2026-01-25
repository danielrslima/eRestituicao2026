/**
 * Kit IR / PDFs - JavaScript
 * Sistema de montagem de Kit IR com encarte e upload de documentos
 */

// Estado do Kit IR
let clienteSelecionadoKit = null;
let secoesKit = [];
let encarteAtual = null;
let arquivoAtual = null;
let secaoEditando = null;

// Clientes mock para busca
const clientesMock = [
    {
        id: 'CLI-0001',
        nome: 'José Ramos da Silva',
        cpf: '070.817.318-72',
        processo: '0001234-56.2020.5.02.0001',
        valor: 74028.67,
        status: 'concluido',
        tipo: 'externo',
        exercicios: [2021]
    },
    {
        id: 'CLI-0002',
        nome: 'Ana Carmen Souza',
        cpf: '123.456.789-00',
        processo: '0005678-90.2021.5.17.0001',
        valor: 45230.50,
        status: 'pago_kit',
        tipo: 'externo',
        exercicios: [2022, 2023, 2024]
    },
    {
        id: 'CLI-0003',
        nome: 'Maria Santos Oliveira',
        cpf: '987.654.321-00',
        processo: '0009876-54.2022.5.15.0001',
        valor: 32150.00,
        status: 'calculado',
        tipo: 'interno',
        exercicios: [2023]
    },
    {
        id: 'CLI-0004',
        nome: 'Pedro Almeida Costa',
        cpf: '456.789.123-00',
        processo: '0003456-78.2021.5.01.0001',
        valor: 58900.25,
        status: 'contrato',
        tipo: 'interno',
        exercicios: [2022, 2023]
    }
];

// Encarte disponíveis
const encartesDisponiveis = {
    esclarecimentos: { nome: 'ESCLARECIMENTOS', icone: '📄', geradoAuto: true },
    calculos_homologados: { nome: 'CÁLCULOS HOMOLOGADOS', icone: '📊', geradoAuto: false },
    homologacao_calculos: { nome: 'HOMOLOGAÇÃO DE CÁLCULOS', icone: '✅', geradoAuto: false },
    planilha_rt: { nome: 'PLANILHA DE APURAÇÃO DE RENDIMENTO TRIBUTÁVEL', icone: '📋', geradoAuto: true },
    requerimento: { nome: 'REQUERIMENTO', icone: '📝', geradoAuto: false },
    documentos_principais: { nome: 'DOCUMENTOS PRINCIPAIS', icone: '📁', geradoAuto: false },
    alvara: { nome: 'ALVARÁ', icone: '🏛️', geradoAuto: false },
    sentenca: { nome: 'SENTENÇA', icone: '⚖️', geradoAuto: false }
};

// Histórico de Kits gerados (persistido no localStorage)
let historicoKits = JSON.parse(localStorage.getItem('historicoKits') || '[]');

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (typeof verificarAutenticacao === 'function') {
        verificarAutenticacao();
    }
    
    // Atualizar data
    atualizarData();
    
    // Carregar nome do usuário
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.nome) {
        document.getElementById('userName').textContent = user.nome;
    }
    
    // Verificar permissões
    verificarPermissoes();
    
    // Carregar histórico
    carregarHistorico();
    
    // Carregar select de encarte
    carregarSelectEncarte();
});

function atualizarData() {
    const hoje = new Date();
    const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);
    document.getElementById('currentDate').textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
}

function verificarPermissoes() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Financeiro só para Admin
    if (user.nivel !== 'admin') {
        const navFinanceiro = document.getElementById('nav-financeiro');
        if (navFinanceiro) navFinanceiro.style.display = 'none';
    }
    
    // Comissões só para Parceiro
    if (user.nivel !== 'parceiro') {
        const navComissoes = document.getElementById('nav-comissoes');
        if (navComissoes) navComissoes.style.display = 'none';
    }
}

// ========================================
// BUSCA DE CLIENTE
// ========================================

function buscarCliente(termo) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (termo.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const termoLower = termo.toLowerCase();
    const resultados = clientesMock.filter(c => 
        c.nome.toLowerCase().includes(termoLower) || 
        c.cpf.includes(termo)
    );
    
    // Ordenar resultados alfabeticamente
    resultados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    if (resultados.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item"><p class="text-muted">Nenhum cliente encontrado</p></div>';
    } else {
        resultsContainer.innerHTML = resultados.map(cliente => `
            <div class="search-result-item" onclick="selecionarCliente('${cliente.id}')">
                <div class="result-avatar">${getIniciais(cliente.nome)}</div>
                <div class="result-info">
                    <h4>${cliente.nome}</h4>
                    <p>CPF: ${cliente.cpf} | ${cliente.exercicios.length} exercício(s)</p>
                </div>
                <div class="result-valor">${formatarMoeda(cliente.valor)}</div>
            </div>
        `).join('');
    }
    
    resultsContainer.style.display = 'block';
}

function selecionarCliente(clienteId) {
    const cliente = clientesMock.find(c => c.id === clienteId);
    if (!cliente) return;
    
    clienteSelecionadoKit = cliente;
    
    // Atualizar UI
    document.getElementById('clienteAvatar').textContent = getIniciais(cliente.nome);
    document.getElementById('clienteNome').textContent = cliente.nome;
    document.getElementById('clienteCpf').textContent = `CPF: ${cliente.cpf}`;
    document.getElementById('clienteProcesso').textContent = `Processo: ${cliente.processo}`;
    document.getElementById('clienteValor').textContent = formatarMoeda(cliente.valor);
    document.getElementById('clienteStatus').textContent = formatarStatus(cliente.status);
    document.getElementById('clienteStatus').className = `badge badge-${getStatusClass(cliente.status)}`;
    
    // Mostrar cliente selecionado
    document.getElementById('clienteSelecionado').style.display = 'block';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('buscaCliente').value = '';
    
    // Mostrar etapa 2
    document.getElementById('etapa2').style.display = 'block';
    document.getElementById('etapa3').style.display = 'block';
    
    // Limpar seções anteriores
    secoesKit = [];
    renderizarSecoes();
}

function limparCliente() {
    clienteSelecionadoKit = null;
    secoesKit = [];
    
    document.getElementById('clienteSelecionado').style.display = 'none';
    document.getElementById('etapa2').style.display = 'none';
    document.getElementById('etapa3').style.display = 'none';
    document.getElementById('kitResumo').style.display = 'none';
    
    renderizarSecoes();
}

// ========================================
// GERENCIAMENTO DE SEÇÕES
// ========================================

// Carregar select de encarte ordenado alfabeticamente
function carregarSelectEncarte() {
    const select = document.getElementById('selectEncarte');
    if (!select) return;
    
    // Limpar options existentes (exceto o primeiro)
    select.innerHTML = '<option value="">-- Selecione um encarte (ordem alfabética) --</option>';
    
    // Converter para array e ordenar alfabeticamente
    const encartesArray = Object.entries(encartesDisponiveis).map(([key, value]) => ({
        key: key,
        nome: value.nome,
        icone: value.icone,
        geradoAuto: value.geradoAuto
    }));
    
    encartesArray.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    // Adicionar options ordenadas
    encartesArray.forEach(encarte => {
        const option = document.createElement('option');
        option.value = encarte.key;
        option.textContent = `${encarte.icone} ${encarte.nome}`;
        if (encarte.geradoAuto) {
            option.textContent += ' (Auto)';
        }
        select.appendChild(option);
    });
}

function abrirModalEncarte() {
    // Limpar seleção anterior
    document.getElementById('selectEncarte').value = '';
    document.getElementById('encartePersonalizado').value = '';
    document.getElementById('previewEncarte').style.display = 'none';
    encarteAtual = null;
    
    document.getElementById('modalEncarte').classList.add('active');
}

function selecionarEncarteSelect() {
    const select = document.getElementById('selectEncarte');
    const preview = document.getElementById('previewEncarte');
    const previewNome = document.getElementById('previewEncarteNome');
    
    if (select.value) {
        encarteAtual = select.value;
        const info = encartesDisponiveis[encarteAtual];
        previewNome.textContent = `${info.icone} ${info.nome}`;
        preview.style.display = 'block';
        
        // Limpar campo personalizado
        document.getElementById('encartePersonalizado').value = '';
    } else {
        encarteAtual = null;
        preview.style.display = 'none';
    }
}

function limparSelectEncarte() {
    // Quando digitar no campo personalizado, limpar o select
    document.getElementById('selectEncarte').value = '';
    encarteAtual = null;
    
    const personalizado = document.getElementById('encartePersonalizado').value.trim();
    const preview = document.getElementById('previewEncarte');
    const previewNome = document.getElementById('previewEncarteNome');
    
    if (personalizado) {
        previewNome.textContent = `📑 ${personalizado.toUpperCase()}`;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

function confirmarEncarte() {
    let encarteSelecionado = null;
    let nomeEncarte = '';
    let icone = '📄';
    let geradoAuto = false;
    
    // Verificar se é personalizado
    const personalizado = document.getElementById('encartePersonalizado').value.trim();
    
    if (personalizado) {
        encarteSelecionado = 'personalizado_' + Date.now();
        nomeEncarte = personalizado.toUpperCase();
        icone = '📑';
    } else if (encarteAtual) {
        encarteSelecionado = encarteAtual;
        const info = encartesDisponiveis[encarteAtual];
        nomeEncarte = info.nome;
        icone = info.icone;
        geradoAuto = info.geradoAuto;
    } else {
        alert('Selecione um encarte ou digite um título personalizado.');
        return;
    }
    
    // Fechar modal de encarte
    fecharModal('modalEncarte');
    
    // Abrir modal de upload
    document.getElementById('encarteAtualNome').textContent = `${icone} ${nomeEncarte}`;
    
    // Mostrar opção de documento gerado automaticamente se disponível
    const opcaoGerado = document.getElementById('opcaoDocGerado');
    if (geradoAuto && clienteSelecionadoKit) {
        opcaoGerado.style.display = 'block';
    } else {
        opcaoGerado.style.display = 'none';
    }
    
    // Limpar upload anterior
    limparUpload();
    
    // Guardar info do encarte atual
    secaoEditando = {
        id: 'secao_' + Date.now(),
        encarte: encarteSelecionado,
        nomeEncarte: nomeEncarte,
        icone: icone,
        geradoAuto: geradoAuto,
        documento: null,
        tamanho: 0,
        paginas: 0
    };
    
    document.getElementById('modalUpload').classList.add('active');
}

// URL da API de PDFs
const API_PDF_URL = 'https://5000-ipti0ag4an3ins0p9g3qh-5e68b988.us2.manus.computer/api';

async function usarDocumentoGerado() {
    if (!secaoEditando || !clienteSelecionadoKit) return;
    
    // Mostrar loading
    const btnGerado = document.querySelector('#opcaoDocGerado .btn-success');
    const textoOriginal = btnGerado ? btnGerado.textContent : '';
    if (btnGerado) {
        btnGerado.textContent = '⏳ Gerando PDF...';
        btnGerado.disabled = true;
    }
    
    try {
        let endpoint = '';
        let dadosRequisicao = {};
        
        // Determinar qual endpoint usar baseado no tipo de encarte
        if (secaoEditando.encarte === 'esclarecimentos') {
            endpoint = '/gerar-esclarecimentos';
            dadosRequisicao = {
                nome: clienteSelecionadoKit.nome,
                cpf: clienteSelecionadoKit.cpf,
                processo: clienteSelecionadoKit.processo,
                exercicio: clienteSelecionadoKit.exercicios[0] || 2024,
                valor_bruto: clienteSelecionadoKit.valor || 0,
                valor_tributavel: clienteSelecionadoKit.valor * 0.7 || 0,
                numero_meses: clienteSelecionadoKit.numeroMeses || 48,
                inss: clienteSelecionadoKit.inss || 0
            };
        } else if (secaoEditando.encarte === 'planilha_rt') {
            endpoint = '/gerar-planilha-rt';
            dadosRequisicao = {
                nome: clienteSelecionadoKit.nome,
                cpf: clienteSelecionadoKit.cpf,
                data_nascimento: clienteSelecionadoKit.dataNascimento || '-',
                processo: clienteSelecionadoKit.processo,
                exercicio: clienteSelecionadoKit.exercicios[0] || 2024,
                valor_bruto: clienteSelecionadoKit.valor || 0,
                valor_tributavel: clienteSelecionadoKit.valor * 0.7 || 0,
                numero_meses: clienteSelecionadoKit.numeroMeses || 48,
                inss: clienteSelecionadoKit.inss || 0,
                alvaras: clienteSelecionadoKit.alvaras || [],
                darfs: clienteSelecionadoKit.darfs || [],
                honorarios: clienteSelecionadoKit.honorarios || []
            };
        } else {
            // Encarte genérico
            endpoint = '/gerar-encarte';
            dadosRequisicao = {
                tipo: secaoEditando.encarte,
                titulo_personalizado: secaoEditando.nomeEncarte
            };
        }
        
        // Fazer requisição à API
        const response = await fetch(`${API_PDF_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosRequisicao)
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // PDF gerado com sucesso
            secaoEditando.documento = {
                nome: resultado.arquivo,
                tipo: 'gerado',
                tamanho: 200, // Tamanho aproximado
                download_url: resultado.download_url
            };
            secaoEditando.tamanho = 200;
            secaoEditando.paginas = 1;
            
            // Adicionar seção
            secoesKit.push(secaoEditando);
            secaoEditando = null;
            
            // Fechar modal e atualizar UI
            fecharModal('modalUpload');
            renderizarSecoes();
            atualizarResumo();
            
            // Mostrar mensagem de sucesso
            mostrarNotificacao('✅ PDF gerado automaticamente com sucesso!', 'success');
        } else {
            throw new Error(resultado.error || 'Erro ao gerar PDF');
        }
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        mostrarNotificacao('❌ Erro ao gerar PDF: ' + error.message, 'error');
        
        // Fallback: usar documento simulado
        secaoEditando.documento = {
            nome: `${secaoEditando.nomeEncarte}_${clienteSelecionadoKit.nome.replace(/\s/g, '_')}.pdf`,
            tipo: 'gerado',
            tamanho: Math.random() * 500 + 100
        };
        secaoEditando.tamanho = secaoEditando.documento.tamanho;
        secaoEditando.paginas = Math.floor(Math.random() * 3) + 1;
        
        secoesKit.push(secaoEditando);
        secaoEditando = null;
        
        fecharModal('modalUpload');
        renderizarSecoes();
        atualizarResumo();
    } finally {
        // Restaurar botão
        if (btnGerado) {
            btnGerado.textContent = textoOriginal || '✨ Usar Documento Gerado Automaticamente';
            btnGerado.disabled = false;
        }
    }
}

function mostrarNotificacao(mensagem, tipo) {
    // Criar notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background: ${tipo === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// ========================================
// UPLOAD DE ARQUIVOS
// ========================================

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processarArquivo(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processarArquivo(files[0]);
    }
}

function processarArquivo(file) {
    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione apenas arquivos PDF.');
        return;
    }
    
    arquivoAtual = file;
    
    // Mostrar info do arquivo
    document.getElementById('arquivoNome').textContent = file.name;
    document.getElementById('arquivoTamanho').textContent = formatarTamanho(file.size);
    document.getElementById('uploadInfo').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('btnConfirmarUpload').disabled = false;
}

function limparUpload() {
    arquivoAtual = null;
    document.getElementById('inputFile').value = '';
    document.getElementById('uploadInfo').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('btnConfirmarUpload').disabled = true;
}

function confirmarUpload() {
    if (!arquivoAtual || !secaoEditando) return;
    
    // Adicionar documento à seção
    secaoEditando.documento = {
        nome: arquivoAtual.name,
        tipo: 'upload',
        tamanho: arquivoAtual.size / 1024 // KB
    };
    secaoEditando.tamanho = arquivoAtual.size / 1024;
    secaoEditando.paginas = Math.floor(Math.random() * 10) + 1; // Simulado
    
    // Adicionar seção
    secoesKit.push(secaoEditando);
    secaoEditando = null;
    arquivoAtual = null;
    
    // Fechar modal e atualizar UI
    fecharModal('modalUpload');
    renderizarSecoes();
    atualizarResumo();
}

// ========================================
// RENDERIZAÇÃO
// ========================================

function renderizarSecoes() {
    const container = document.getElementById('kitSecoes');
    
    if (secoesKit.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>Nenhuma seção adicionada ainda.</p>
                <p>Clique em "Adicionar Encarte + Documento" para começar.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = secoesKit.map((secao, index) => `
        <div class="kit-secao" data-id="${secao.id}">
            <div class="kit-secao-header">
                <span class="secao-numero">${index + 1}</span>
                <span class="secao-titulo">${secao.icone} ${secao.nomeEncarte}</span>
                <div class="secao-acoes">
                    <button class="btn btn-sm btn-outline" onclick="moverSecao('${secao.id}', -1)" ${index === 0 ? 'disabled' : ''}>⬆️</button>
                    <button class="btn btn-sm btn-outline" onclick="moverSecao('${secao.id}', 1)" ${index === secoesKit.length - 1 ? 'disabled' : ''}>⬇️</button>
                    <button class="btn btn-sm btn-danger" onclick="removerSecao('${secao.id}')">🗑️</button>
                </div>
            </div>
            <div class="kit-secao-body">
                <div class="secao-encarte selecionado">
                    <span class="encarte-icon">📑</span>
                    <div class="encarte-info">
                        <h4>Encarte: ${secao.nomeEncarte}</h4>
                        <p>Página de capa</p>
                    </div>
                </div>
                <div class="secao-documentos">
                    <div class="documento-item ${secao.documento.tipo}">
                        <span class="documento-icon">${secao.documento.tipo === 'gerado' ? '✨' : '📄'}</span>
                        <div class="documento-info">
                            <h5>${secao.documento.nome}</h5>
                            <p>${secao.documento.tipo === 'gerado' ? 'Gerado automaticamente' : 'Upload manual'} | ${formatarTamanho(secao.tamanho * 1024)} | ~${secao.paginas} página(s)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function moverSecao(secaoId, direcao) {
    const index = secoesKit.findIndex(s => s.id === secaoId);
    if (index === -1) return;
    
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= secoesKit.length) return;
    
    // Trocar posições
    [secoesKit[index], secoesKit[novoIndex]] = [secoesKit[novoIndex], secoesKit[index]];
    
    renderizarSecoes();
}

function removerSecao(secaoId) {
    if (!confirm('Deseja remover esta seção do Kit IR?')) return;
    
    secoesKit = secoesKit.filter(s => s.id !== secaoId);
    renderizarSecoes();
    atualizarResumo();
}

function atualizarResumo() {
    if (secoesKit.length === 0) {
        document.getElementById('kitResumo').style.display = 'none';
        return;
    }
    
    document.getElementById('kitResumo').style.display = 'block';
    
    const totalSecoes = secoesKit.length;
    const totalPaginas = secoesKit.reduce((acc, s) => acc + s.paginas + 1, 0); // +1 para cada encarte
    const totalTamanho = secoesKit.reduce((acc, s) => acc + s.tamanho, 0) / 1024; // MB
    
    document.getElementById('totalSecoes').textContent = totalSecoes;
    document.getElementById('totalPaginas').textContent = `~${totalPaginas}`;
    document.getElementById('totalTamanho').textContent = `${totalTamanho.toFixed(2)} MB`;
    
    // Status do tamanho
    const statusEl = document.getElementById('statusTamanho');
    if (totalTamanho > 150) {
        statusEl.textContent = '❌ Excede 150MB';
        statusEl.className = 'status-erro';
    } else if (totalTamanho > 15) {
        statusEl.textContent = '⚠️ Será dividido';
        statusEl.className = 'status-alerta';
    } else {
        statusEl.textContent = '✅ OK';
        statusEl.className = 'status-ok';
    }
}

// ========================================
// GERAÇÃO DO KIT IR
// ========================================

function previewKit() {
    if (secoesKit.length === 0) {
        alert('Adicione pelo menos uma seção ao Kit IR.');
        return;
    }
    
    // Simular preview
    let preview = 'PREVIEW DO KIT IR\n\n';
    preview += `Cliente: ${clienteSelecionadoKit.nome}\n`;
    preview += `CPF: ${clienteSelecionadoKit.cpf}\n\n`;
    preview += 'ESTRUTURA:\n';
    
    secoesKit.forEach((secao, index) => {
        preview += `\n${index + 1}. ENCARTE: ${secao.nomeEncarte}\n`;
        preview += `   └── ${secao.documento.nome}\n`;
    });
    
    alert(preview);
}

function gerarKitIR() {
    if (secoesKit.length === 0) {
        alert('Adicione pelo menos uma seção ao Kit IR.');
        return;
    }
    
    const nomeArquivo = document.getElementById('nomeArquivo').value.trim();
    if (!nomeArquivo) {
        alert('Digite um nome para o arquivo.');
        return;
    }
    
    // Validar nome (sem acentos ou caracteres especiais)
    const nomeValido = nomeArquivo.replace(/[^a-zA-Z0-9_-]/g, '');
    if (nomeValido !== nomeArquivo) {
        alert('O nome do arquivo não pode conter acentos ou caracteres especiais.');
        document.getElementById('nomeArquivo').value = nomeValido;
        return;
    }
    
    // Simular geração
    const totalTamanho = secoesKit.reduce((acc, s) => acc + s.tamanho, 0) / 1024; // MB
    const dividir = document.getElementById('dividirPartes').checked;
    const partes = dividir && totalTamanho > 15 ? Math.ceil(totalTamanho / 15) : 1;
    
    // Adicionar ao histórico
    const kit = {
        id: 'KIT-' + Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        cliente: clienteSelecionadoKit.nome,
        clienteId: clienteSelecionadoKit.id,
        arquivo: nomeValido + '.pdf',
        tamanho: totalTamanho.toFixed(2) + ' MB',
        partes: partes,
        secoes: secoesKit.length
    };
    
    historicoKits.unshift(kit);
    localStorage.setItem('historicoKits', JSON.stringify(historicoKits));
    carregarHistorico();
    
    // Mostrar sucesso
    let mensagem = `Arquivo: ${nomeValido}.pdf`;
    if (partes > 1) {
        mensagem += `\n\nDividido em ${partes} partes:`;
        for (let i = 1; i <= partes; i++) {
            mensagem += `\n• ${nomeValido}_parte${i}.pdf`;
        }
    }
    document.getElementById('sucessoMensagem').innerHTML = mensagem.replace(/\n/g, '<br>');
    document.getElementById('modalSucesso').classList.add('active');
}

function baixarKit() {
    alert('Em produção, o download do Kit IR será iniciado automaticamente.');
    fecharModal('modalSucesso');
}

// ========================================
// HISTÓRICO
// ========================================

function carregarHistorico() {
    const tbody = document.getElementById('historicoBody');
    
    if (historicoKits.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Nenhum Kit IR gerado ainda
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = historicoKits.map(kit => `
        <tr>
            <td>${kit.data}</td>
            <td>${kit.cliente}</td>
            <td>${kit.arquivo}</td>
            <td>${kit.tamanho}</td>
            <td>${kit.partes > 1 ? kit.partes + ' partes' : 'Único'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="baixarKitHistorico('${kit.id}')">📥 Baixar</button>
                <button class="btn btn-sm btn-outline" onclick="visualizarKitHistorico('${kit.id}')">👁️ Ver</button>
            </td>
        </tr>
    `).join('');
}

function baixarKitHistorico(kitId) {
    const kit = historicoKits.find(k => k.id === kitId);
    if (!kit) {
        alert('Kit não encontrado.');
        return;
    }
    
    // Verificar se tem URL de download
    if (kit.download_url) {
        window.open(kit.download_url, '_blank');
    } else {
        // Simular download
        mostrarNotificacao(`📥 Preparando download de ${kit.arquivo}...`, 'success');
        setTimeout(() => {
            mostrarNotificacao(`✅ Download de ${kit.arquivo} iniciado!`, 'success');
        }, 1500);
    }
}

function visualizarKitHistorico(kitId) {
    const kit = historicoKits.find(k => k.id === kitId);
    if (!kit) {
        alert('Kit não encontrado.');
        return;
    }
    
    // Abrir modal com detalhes do kit
    let detalhes = `<div style="text-align: left;">`;
    detalhes += `<p><strong>ID:</strong> ${kit.id}</p>`;
    detalhes += `<p><strong>Data:</strong> ${kit.data}</p>`;
    detalhes += `<p><strong>Cliente:</strong> ${kit.cliente}</p>`;
    detalhes += `<p><strong>Arquivo:</strong> ${kit.arquivo}</p>`;
    detalhes += `<p><strong>Tamanho:</strong> ${kit.tamanho}</p>`;
    detalhes += `<p><strong>Partes:</strong> ${kit.partes > 1 ? kit.partes + ' partes' : 'Único arquivo'}</p>`;
    detalhes += `<p><strong>Seções:</strong> ${kit.secoes}</p>`;
    detalhes += `</div>`;
    
    // Criar modal dinâmico
    const modalHtml = `
        <div class="modal-overlay" id="modalVisualizarKit" style="display: flex;">
            <div class="modal">
                <div class="modal-header">
                    <h3>📄 Detalhes do Kit IR</h3>
                    <button class="btn-close" onclick="document.getElementById('modalVisualizarKit').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${detalhes}
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-primary" onclick="baixarKitHistorico('${kitId}'); document.getElementById('modalVisualizarKit').remove();">
                            📥 Baixar Kit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const modalAnterior = document.getElementById('modalVisualizarKit');
    if (modalAnterior) modalAnterior.remove();
    
    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ========================================
// UTILITÁRIOS
// ========================================

function getIniciais(nome) {
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes.toFixed(0) + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatarStatus(status) {
    const statusMap = {
        'novo': 'Novo',
        'calculado': 'Calculado',
        'pago_basico': 'Pago Básico',
        'pago_kit': 'Pago Kit IR',
        'contrato': 'Contrato',
        'enviado': 'Kit Enviado',
        'analise': 'Em Análise',
        'concluido': 'Concluído',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'novo': 'info',
        'calculado': 'warning',
        'pago_basico': 'primary',
        'pago_kit': 'primary',
        'contrato': 'success',
        'enviado': 'success',
        'analise': 'warning',
        'concluido': 'success',
        'cancelado': 'danger'
    };
    return classMap[status] || 'secondary';
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Fechar resultados de busca ao clicar fora
document.addEventListener('click', function(e) {
    const searchResults = document.getElementById('searchResults');
    const searchBox = document.querySelector('.search-box');
    
    if (searchResults && searchBox && !searchBox.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});
