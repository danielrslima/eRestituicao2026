/**
 * COMISSÕES - JavaScript
 * Tela de comissões para parceiros
 */

// Dados do parceiro (em produção, vem do backend)
const PARCEIRO = {
    id: 'PARC-001',
    nome: 'João Silva',
    codigo: 'JOAO2026',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-1234',
    cpfCnpj: '123.456.789-00',
    chavePix: 'joao.silva@email.com',
    taxaComissao: 10,
    dataCadastro: '2026-01-15',
    status: 'ativo'
};

// Dados de comissões (em produção, vem do backend)
const COMISSOES = [
    {
        id: 'COM-001',
        clienteNome: 'Carlos Eduardo Lima',
        clienteCpf: '987.654.321-00',
        dataIndicacao: '2026-01-20',
        produto: 'Contrato 15%',
        valorPago: 11100.00,
        comissao: 1110.00,
        status: 'pago',
        dataPagamento: '2026-01-25'
    },
    {
        id: 'COM-002',
        clienteNome: 'Maria Fernanda Costa',
        clienteCpf: '456.789.123-00',
        dataIndicacao: '2026-01-18',
        produto: 'Kit IR',
        valorPago: 10.00,
        comissao: 1.00,
        status: 'pago',
        dataPagamento: '2026-01-22'
    },
    {
        id: 'COM-003',
        clienteNome: 'Roberto Almeida Santos',
        clienteCpf: '789.123.456-00',
        dataIndicacao: '2026-01-15',
        produto: 'Descubra Seu Valor',
        valorPago: 5.99,
        comissao: 0.60,
        status: 'pago',
        dataPagamento: '2026-01-20'
    },
    {
        id: 'COM-004',
        clienteNome: 'Fernanda Silva Oliveira',
        clienteCpf: '321.654.987-00',
        dataIndicacao: '2026-01-22',
        produto: 'Faça Você Mesmo',
        valorPago: 15.99,
        comissao: 1.60,
        status: 'pendente',
        dataPagamento: null
    },
    {
        id: 'COM-005',
        clienteNome: 'Paulo Henrique Mendes',
        clienteCpf: '654.321.987-00',
        dataIndicacao: '2026-01-24',
        produto: 'Kit IR',
        valorPago: 10.00,
        comissao: 1.00,
        status: 'pendente',
        dataPagamento: null
    },
    {
        id: 'COM-006',
        clienteNome: 'Juliana Pereira Santos',
        clienteCpf: '147.258.369-00',
        dataIndicacao: '2026-01-25',
        produto: 'Contrato 15%',
        valorPago: 4500.00,
        comissao: 450.00,
        status: 'processando',
        dataPagamento: null
    }
];

// Histórico de pagamentos ao parceiro
const PAGAMENTOS_PARCEIRO = [
    {
        id: 'PAG-001',
        data: '2026-01-25',
        periodoReferencia: 'Janeiro/2026 (1ª quinzena)',
        valor: 1111.60,
        formaPagamento: 'PIX',
        comprovante: 'comprovante_001.pdf'
    },
    {
        id: 'PAG-002',
        data: '2026-01-10',
        periodoReferencia: 'Dezembro/2025 (2ª quinzena)',
        valor: 138.40,
        formaPagamento: 'PIX',
        comprovante: 'comprovante_002.pdf'
    }
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar data
    atualizarData();
    
    // Carregar parceiros que têm clientes vinculados
    carregarParceirosComClientes();
    
    // Carregar informações do parceiro
    carregarInfoParceiro();
    
    // Carregar estatísticas
    carregarEstatisticas();
    
    // Carregar tabela de comissões
    carregarComissoes();
    
    // Carregar histórico de pagamentos
    carregarPagamentos();
    
    console.log('Página de Comissões carregada');
});

// Carregar parceiros que têm clientes vinculados
function carregarParceirosComClientes() {
    // Buscar clientes do localStorage
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    
    // Filtrar clientes que têm indicado_por preenchido
    const clientesIndicados = clientes.filter(c => c.indicado_por && c.indicado_por.trim() !== '');
    
    // Agrupar por parceiro
    const parceirosComClientes = {};
    
    clientesIndicados.forEach(cliente => {
        const parceiro = cliente.indicado_por;
        if (!parceirosComClientes[parceiro]) {
            parceirosComClientes[parceiro] = {
                nome: parceiro,
                clientes: [],
                totalComissao: 0
            };
        }
        parceirosComClientes[parceiro].clientes.push(cliente);
        
        // Calcular comissão (10% do valor de restituição)
        const valorRestituicao = parseFloat(cliente.valor_restituicao) || 0;
        parceirosComClientes[parceiro].totalComissao += valorRestituicao * 0.10;
    });
    
    // Atualizar COMISSOES com dados reais dos clientes
    if (clientesIndicados.length > 0) {
        // Limpar comissões mock e adicionar reais
        COMISSOES.length = 0;
        
        clientesIndicados.forEach((cliente, index) => {
            const valorRestituicao = parseFloat(cliente.valor_restituicao) || 0;
            const comissao = valorRestituicao * 0.10;
            
            COMISSOES.push({
                id: `COM-${String(index + 1).padStart(3, '0')}`,
                clienteNome: cliente.nome,
                clienteCpf: cliente.cpf,
                dataIndicacao: cliente.data_inclusao?.split(' ')[0] || new Date().toISOString().split('T')[0],
                produto: cliente.status === 'Pago Kit IR' ? 'Kit IR' : (cliente.status === 'Concluído' ? 'Contrato 15%' : 'Descubra Seu Valor'),
                valorPago: valorRestituicao,
                comissao: comissao,
                status: cliente.status === 'Concluído' ? 'pago' : (cliente.status === 'Em Análise' ? 'processando' : 'pendente'),
                dataPagamento: cliente.status === 'Concluído' ? new Date().toISOString().split('T')[0] : null
            });
        });
    }
    
    // Atualizar lista de parceiros disponíveis
    const selectParceiro = document.getElementById('selectParceiro');
    if (selectParceiro) {
        selectParceiro.innerHTML = '<option value="">Selecione um parceiro...</option>';
        
        Object.keys(parceirosComClientes).forEach(parceiro => {
            const option = document.createElement('option');
            option.value = parceiro;
            option.textContent = `${parceiro} (${parceirosComClientes[parceiro].clientes.length} clientes)`;
            selectParceiro.appendChild(option);
        });
        
        // Se houver parceiros, selecionar o primeiro
        if (Object.keys(parceirosComClientes).length > 0) {
            const primeiroParceiro = Object.keys(parceirosComClientes)[0];
            selectParceiro.value = primeiroParceiro;
            selecionarParceiro(primeiroParceiro);
        }
    }
    
    // Mostrar mensagem se não houver parceiros com clientes
    if (clientesIndicados.length === 0) {
        const containerComissoes = document.querySelector('.comissoes-container');
        if (containerComissoes) {
            const aviso = document.createElement('div');
            aviso.className = 'aviso-sem-parceiros';
            aviso.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                    <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Nenhum parceiro com clientes</h4>
                    <p style="color: #856404; margin: 0;">Para gerar o link de indicação de um parceiro, primeiro cadastre um cliente e preencha o campo "Indicado por" com o nome do parceiro.</p>
                </div>
            `;
            containerComissoes.insertBefore(aviso, containerComissoes.firstChild);
        }
    }
    
    return parceirosComClientes;
}

// Selecionar parceiro
function selecionarParceiro(nomeParceiro) {
    if (!nomeParceiro) return;
    
    // Atualizar dados do parceiro selecionado
    PARCEIRO.nome = nomeParceiro;
    PARCEIRO.codigo = nomeParceiro.replace(/\s+/g, '').toUpperCase().substring(0, 8) + '2026';
    
    // Recarregar informações
    carregarInfoParceiro();
    carregarEstatisticas();
    carregarComissoes();
}

// Atualizar data no header
function atualizarData() {
    const dataAtual = document.getElementById('dataAtual');
    if (dataAtual) {
        const hoje = new Date();
        const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dataAtual.textContent = hoje.toLocaleDateString('pt-BR', opcoes);
    }
}

// Carregar informações do parceiro
function carregarInfoParceiro() {
    document.getElementById('parceiroNome').textContent = PARCEIRO.nome;
    document.getElementById('parceiroCodigo').textContent = PARCEIRO.codigo;
    document.getElementById('parceiroTaxa').textContent = PARCEIRO.taxaComissao + '%';
    document.getElementById('linkIndicacao').value = `https://erestituicao.com.br/?ref=${PARCEIRO.codigo}`;
    
    // Atualizar header
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    if (userName) userName.textContent = PARCEIRO.nome;
    if (userAvatar) userAvatar.textContent = PARCEIRO.nome.charAt(0);
}

// Carregar estatísticas
function carregarEstatisticas() {
    const totalComissoes = COMISSOES.reduce((sum, c) => sum + c.comissao, 0);
    const comissoesPagas = COMISSOES.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.comissao, 0);
    const comissoesPendentes = COMISSOES.filter(c => c.status === 'pendente' || c.status === 'processando').reduce((sum, c) => sum + c.comissao, 0);
    const totalIndicados = COMISSOES.length;
    
    document.getElementById('totalComissoes').textContent = formatarMoeda(totalComissoes);
    document.getElementById('comissoesPagas').textContent = formatarMoeda(comissoesPagas);
    document.getElementById('comissoesPendentes').textContent = formatarMoeda(comissoesPendentes);
    document.getElementById('totalIndicados').textContent = totalIndicados;
}

// Carregar tabela de comissões
function carregarComissoes(filtros = {}) {
    const tbody = document.getElementById('listaComissoes');
    if (!tbody) return;
    
    let comissoesFiltradas = [...COMISSOES];
    
    // Aplicar filtros
    if (filtros.status) {
        comissoesFiltradas = comissoesFiltradas.filter(c => c.status === filtros.status);
    }
    if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        comissoesFiltradas = comissoesFiltradas.filter(c => 
            c.clienteNome.toLowerCase().includes(busca) ||
            c.clienteCpf.includes(busca)
        );
    }
    
    tbody.innerHTML = '';
    
    if (comissoesFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Nenhuma comissão encontrada</td>
            </tr>
        `;
        return;
    }
    
    let totalPeriodo = 0;
    
    comissoesFiltradas.forEach(comissao => {
        totalPeriodo += comissao.comissao;
        
        const statusBadge = getStatusBadge(comissao.status);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(comissao.dataIndicacao)}</td>
            <td>
                <strong>${comissao.clienteNome}</strong>
                <br><small class="text-muted">${comissao.clienteCpf}</small>
            </td>
            <td>${comissao.produto}</td>
            <td>${formatarMoeda(comissao.valorPago)}</td>
            <td><strong>${formatarMoeda(comissao.comissao)}</strong></td>
            <td>${statusBadge}</td>
            <td>${comissao.dataPagamento ? formatarData(comissao.dataPagamento) : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Atualizar total do período
    document.getElementById('totalPeriodo').textContent = formatarMoeda(totalPeriodo);
}

// Carregar histórico de pagamentos
function carregarPagamentos() {
    const tbody = document.getElementById('listaPagamentos');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (PAGAMENTOS_PARCEIRO.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhum pagamento realizado ainda</td>
            </tr>
        `;
        return;
    }
    
    PAGAMENTOS_PARCEIRO.forEach(pagamento => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(pagamento.data)}</td>
            <td>${pagamento.periodoReferencia}</td>
            <td><strong>${formatarMoeda(pagamento.valor)}</strong></td>
            <td>${pagamento.formaPagamento}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="verComprovante('${pagamento.comprovante}')">
                    📄 Ver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções auxiliares
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataStr) {
    if (!dataStr) return '-';
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

function getStatusBadge(status) {
    const badges = {
        pago: '<span class="status-badge status-pago">✅ Pago</span>',
        pendente: '<span class="status-badge status-pendente">⏳ Pendente</span>',
        processando: '<span class="status-badge status-processando">🔄 Processando</span>'
    };
    return badges[status] || status;
}

// Ações
function aplicarFiltros() {
    const status = document.getElementById('filtroStatus').value;
    const busca = document.getElementById('buscaCliente').value;
    
    carregarComissoes({ status, busca });
}

function limparFiltros() {
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroPeriodo').value = 'ano';
    document.getElementById('buscaCliente').value = '';
    
    carregarComissoes();
}

function copiarLink() {
    const input = document.getElementById('linkIndicacao');
    input.select();
    document.execCommand('copy');
    
    // Feedback visual
    const btn = event.target;
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '✅ Copiado!';
    btn.style.background = '#10b981';
    
    setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.style.background = '';
    }, 2000);
}

// Gerar novo link de indicação
function gerarNovoLink() {
    // Gerar código único baseado no código do parceiro + timestamp
    const timestamp = Date.now().toString(36).toUpperCase();
    const novoLink = `https://erestituicao.com.br/?ref=${PARCEIRO.codigo}&t=${timestamp}`;
    
    document.getElementById('linkIndicacao').value = novoLink;
    
    alert(`✅ Novo link gerado!\n\n${novoLink}\n\nEste link é exclusivo e rastreará suas indicações.`);
}

// Compartilhar link via WhatsApp
function compartilharWhatsApp() {
    const link = document.getElementById('linkIndicacao').value;
    const mensagem = encodeURIComponent(`Olá! Descubra se você tem direito à restituição de Imposto de Renda sobre ações trabalhistas. Acesse: ${link}`);
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
}

// Compartilhar link via Email
function compartilharEmail() {
    const link = document.getElementById('linkIndicacao').value;
    const assunto = encodeURIComponent('Descubra sua Restituição de IR');
    const corpo = encodeURIComponent(`Olá!\n\nVocê sabia que pode ter direito à restituição de Imposto de Renda sobre ações trabalhistas?\n\nDescubra agora acessando: ${link}\n\nAtenciosamente,\n${PARCEIRO.nome}`);
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
}

function exportarComissoes() {
    // Criar CSV
    let csv = 'Data Indicação,Cliente,CPF,Produto,Valor Pago,Comissão,Status,Data Pagamento\n';
    
    COMISSOES.forEach(c => {
        csv += `${c.dataIndicacao},"${c.clienteNome}",${c.clienteCpf},${c.produto},${c.valorPago},${c.comissao},${c.status},${c.dataPagamento || ''}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comissoes_${PARCEIRO.codigo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function verComprovante(arquivo) {
    alert(`Abrindo comprovante: ${arquivo}`);
    // Em produção, abrir o PDF do comprovante
}
