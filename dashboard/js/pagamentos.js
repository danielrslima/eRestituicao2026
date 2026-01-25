/**
 * Pagamentos - JavaScript
 * Sistema de visualização e gestão de pagamentos
 */

// Estado da página
let pagamentos = [];
let paginaAtual = 1;
let totalPaginas = 1;
const itensPorPagina = 20;

// Dados mock de pagamentos (simulando dados do Asaas)
const pagamentosMock = [
    {
        id: 'pay_001',
        data: '2026-01-25T10:30:00',
        cliente: 'José Ramos da Silva',
        cpf: '070.817.318-72',
        email: 'jose.ramos@email.com',
        produto: 'Kit IR',
        descricao: 'Kit IR - Faça Você Mesmo',
        valor: 10.00,
        valorOriginal: 15.99,
        desconto: 5.99,
        tipo: 'PIX',
        status: 'CONFIRMED',
        asaasId: 'pay_abc123456',
        transactionId: 'E12345678901234567890123456789012'
    },
    {
        id: 'pay_002',
        data: '2026-01-25T09:15:00',
        cliente: 'Ana Carmen Souza',
        cpf: '123.456.789-00',
        email: 'ana.carmen@email.com',
        produto: 'Descubra Seu Valor',
        descricao: 'Descubra Seu Valor - Consulta',
        valor: 5.99,
        valorOriginal: 5.99,
        desconto: 0,
        tipo: 'CREDIT_CARD',
        status: 'CONFIRMED',
        asaasId: 'pay_def789012',
        transactionId: null
    },
    {
        id: 'pay_003',
        data: '2026-01-24T16:45:00',
        cliente: 'Carlos Eduardo Lima',
        cpf: '987.654.321-00',
        email: 'carlos.lima@email.com',
        produto: 'Faça Você Mesmo',
        descricao: 'Faça Você Mesmo - Completo',
        valor: 15.99,
        valorOriginal: 15.99,
        desconto: 0,
        tipo: 'PIX',
        status: 'RECEIVED',
        asaasId: 'pay_ghi345678',
        transactionId: 'E98765432109876543210987654321098'
    },
    {
        id: 'pay_004',
        data: '2026-01-24T14:20:00',
        cliente: 'Maria Fernanda Costa',
        cpf: '456.789.123-00',
        email: 'maria.costa@email.com',
        produto: 'Descubra Seu Valor',
        descricao: 'Descubra Seu Valor - Consulta',
        valor: 5.99,
        valorOriginal: 5.99,
        desconto: 0,
        tipo: 'PIX',
        status: 'PENDING',
        asaasId: 'pay_jkl901234',
        transactionId: null
    },
    {
        id: 'pay_005',
        data: '2026-01-23T11:00:00',
        cliente: 'Roberto Almeida Santos',
        cpf: '789.123.456-00',
        email: 'roberto.santos@email.com',
        produto: 'Kit IR',
        descricao: 'Kit IR - Faça Você Mesmo',
        valor: 10.00,
        valorOriginal: 15.99,
        desconto: 5.99,
        tipo: 'CREDIT_CARD',
        status: 'CONFIRMED',
        asaasId: 'pay_mno567890',
        transactionId: null
    },
    {
        id: 'pay_006',
        data: '2026-01-22T08:30:00',
        cliente: 'Fernanda Silva Oliveira',
        cpf: '321.654.987-00',
        email: 'fernanda.oliveira@email.com',
        produto: 'Descubra Seu Valor',
        descricao: 'Descubra Seu Valor - Consulta',
        valor: 5.99,
        valorOriginal: 5.99,
        desconto: 0,
        tipo: 'PIX',
        status: 'OVERDUE',
        asaasId: 'pay_pqr123456',
        transactionId: null
    },
    {
        id: 'pay_007',
        data: '2026-01-21T15:45:00',
        cliente: 'Paulo Henrique Mendes',
        cpf: '654.321.987-00',
        email: 'paulo.mendes@email.com',
        produto: 'Faça Você Mesmo',
        descricao: 'Faça Você Mesmo - Completo',
        valor: 15.99,
        valorOriginal: 15.99,
        desconto: 0,
        tipo: 'CREDIT_CARD',
        status: 'REFUNDED',
        asaasId: 'pay_stu789012',
        transactionId: null
    },
    {
        id: 'pay_008',
        data: '2026-01-20T10:00:00',
        cliente: 'Juliana Pereira Santos',
        cpf: '147.258.369-00',
        email: 'juliana.santos@email.com',
        produto: 'Kit IR',
        descricao: 'Kit IR - Faça Você Mesmo',
        valor: 10.00,
        valorOriginal: 15.99,
        desconto: 5.99,
        tipo: 'PIX',
        status: 'CONFIRMED',
        asaasId: 'pay_vwx345678',
        transactionId: 'E11111111111111111111111111111111'
    }
];

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
        document.getElementById('userAvatar').textContent = user.nome.charAt(0).toUpperCase();
    }
    
    // Configurar eventos
    configurarEventos();
    
    // Carregar pagamentos
    carregarPagamentos();
});

// ========================================
// FUNÇÕES DE INTERFACE
// ========================================

function atualizarData() {
    const dataAtual = document.getElementById('dataAtual');
    if (dataAtual) {
        const hoje = new Date();
        const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dataAtual.textContent = hoje.toLocaleDateString('pt-BR', opcoes);
    }
}

function configurarEventos() {
    // Filtro de período personalizado
    const filtroPeriodo = document.getElementById('filtroPeriodo');
    if (filtroPeriodo) {
        filtroPeriodo.addEventListener('change', function() {
            const personalizado = this.value === 'personalizado';
            document.getElementById('filtroDataInicio').style.display = personalizado ? 'flex' : 'none';
            document.getElementById('filtroDataFim').style.display = personalizado ? 'flex' : 'none';
        });
    }
}

// ========================================
// FUNÇÕES DE DADOS
// ========================================

function carregarPagamentos() {
    // Mostrar loading
    const lista = document.getElementById('listaPagamentos');
    lista.innerHTML = '<tr><td colspan="9" class="loading">Carregando pagamentos...</td></tr>';
    
    // Simular delay de API
    setTimeout(() => {
        pagamentos = [...pagamentosMock];
        atualizarEstatisticas();
        renderizarPagamentos();
    }, 500);
}

function atualizarEstatisticas() {
    // Filtrar pagamentos do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const pagamentosMes = pagamentos.filter(p => {
        const data = new Date(p.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });
    
    // Total recebido (apenas confirmados e recebidos)
    const totalRecebido = pagamentosMes
        .filter(p => ['CONFIRMED', 'RECEIVED'].includes(p.status))
        .reduce((sum, p) => sum + p.valor, 0);
    
    // Contagens
    const pendentes = pagamentosMes.filter(p => p.status === 'PENDING').length;
    const confirmados = pagamentosMes.filter(p => ['CONFIRMED', 'RECEIVED'].includes(p.status)).length;
    
    // Atualizar cards
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    document.getElementById('totalPagamentos').textContent = pagamentosMes.length;
    document.getElementById('pagamentosPendentes').textContent = pendentes;
    document.getElementById('pagamentosConfirmados').textContent = confirmados;
}

function renderizarPagamentos() {
    const lista = document.getElementById('listaPagamentos');
    
    // Aplicar filtros
    let pagamentosFiltrados = filtrarPagamentos();
    
    // Calcular paginação
    totalPaginas = Math.ceil(pagamentosFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const pagamentosPagina = pagamentosFiltrados.slice(inicio, fim);
    
    if (pagamentosPagina.length === 0) {
        lista.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <div class="empty-state-text">Nenhum pagamento encontrado</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        lista.innerHTML = pagamentosPagina.map(p => `
            <tr>
                <td><code>${p.id}</code></td>
                <td>${formatarData(p.data)}</td>
                <td><strong>${p.cliente}</strong></td>
                <td>${p.cpf}</td>
                <td>${p.produto}</td>
                <td class="valor-positivo">${formatarMoeda(p.valor)}</td>
                <td>${renderizarTipo(p.tipo)}</td>
                <td>${renderizarStatus(p.status)}</td>
                <td>
                    <button class="acoes-btn" onclick="verDetalhes('${p.id}')" title="Ver detalhes">👁️</button>
                </td>
            </tr>
        `).join('');
    }
    
    // Atualizar paginação
    atualizarPaginacao();
}

function filtrarPagamentos() {
    let resultado = [...pagamentos];
    
    // Filtro de período
    const periodo = document.getElementById('filtroPeriodo').value;
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    let dataInicio = null;
    
    switch (periodo) {
        case 'hoje':
            dataInicio = new Date(hoje);
            dataInicio.setHours(0, 0, 0, 0);
            break;
        case 'semana':
            dataInicio = new Date(hoje);
            dataInicio.setDate(hoje.getDate() - 7);
            break;
        case 'mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear(), 0, 1);
            break;
        case 'personalizado':
            const dataInicioInput = document.getElementById('dataInicio').value;
            const dataFimInput = document.getElementById('dataFim').value;
            if (dataInicioInput) dataInicio = new Date(dataInicioInput);
            if (dataFimInput) {
                hoje.setTime(new Date(dataFimInput).getTime());
                hoje.setHours(23, 59, 59, 999);
            }
            break;
    }
    
    if (dataInicio) {
        resultado = resultado.filter(p => {
            const dataPagamento = new Date(p.data);
            return dataPagamento >= dataInicio && dataPagamento <= hoje;
        });
    }
    
    // Filtro de status
    const status = document.getElementById('filtroStatus').value;
    if (status) {
        resultado = resultado.filter(p => p.status === status);
    }
    
    // Filtro de tipo
    const tipo = document.getElementById('filtroTipo').value;
    if (tipo) {
        resultado = resultado.filter(p => p.tipo === tipo);
    }
    
    // Filtro de produto
    const produto = document.getElementById('filtroProduto').value;
    if (produto) {
        const produtoMap = {
            'descubra': 'Descubra Seu Valor',
            'faca_voce': 'Faça Você Mesmo',
            'kit_ir': 'Kit IR'
        };
        resultado = resultado.filter(p => p.produto === produtoMap[produto]);
    }
    
    // Filtro de busca
    const busca = document.getElementById('buscaCliente').value.toLowerCase();
    if (busca) {
        resultado = resultado.filter(p => 
            p.cliente.toLowerCase().includes(busca) || 
            p.cpf.includes(busca)
        );
    }
    
    // Ordenar por data (mais recente primeiro)
    resultado.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    return resultado;
}

// ========================================
// FUNÇÕES DE RENDERIZAÇÃO
// ========================================

function renderizarStatus(status) {
    const statusMap = {
        'CONFIRMED': { label: '✅ Confirmado', class: 'status-confirmed' },
        'RECEIVED': { label: '💰 Recebido', class: 'status-received' },
        'PENDING': { label: '⏳ Pendente', class: 'status-pending' },
        'OVERDUE': { label: '⚠️ Vencido', class: 'status-overdue' },
        'REFUNDED': { label: '↩️ Estornado', class: 'status-refunded' }
    };
    
    const info = statusMap[status] || { label: status, class: '' };
    return `<span class="status-badge ${info.class}">${info.label}</span>`;
}

function renderizarTipo(tipo) {
    const tipoMap = {
        'PIX': { label: 'PIX', class: 'tipo-pix' },
        'CREDIT_CARD': { label: '💳 Cartão', class: 'tipo-cartao' },
        'BOLETO': { label: '📄 Boleto', class: 'tipo-boleto' }
    };
    
    const info = tipoMap[tipo] || { label: tipo, class: '' };
    return `<span class="tipo-badge ${info.class}">${info.label}</span>`;
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ========================================
// FUNÇÕES DE PAGINAÇÃO
// ========================================

function atualizarPaginacao() {
    document.getElementById('infoPagina').textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
    document.getElementById('btnAnterior').disabled = paginaAtual <= 1;
    document.getElementById('btnProximo').disabled = paginaAtual >= totalPaginas;
}

function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarPagamentos();
    }
}

function proximaPagina() {
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarPagamentos();
    }
}

// ========================================
// FUNÇÕES DE FILTRO
// ========================================

function aplicarFiltros() {
    paginaAtual = 1;
    renderizarPagamentos();
}

function limparFiltros() {
    document.getElementById('filtroPeriodo').value = 'mes';
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroProduto').value = '';
    document.getElementById('buscaCliente').value = '';
    document.getElementById('filtroDataInicio').style.display = 'none';
    document.getElementById('filtroDataFim').style.display = 'none';
    
    paginaAtual = 1;
    renderizarPagamentos();
}

function atualizarLista() {
    carregarPagamentos();
}

// ========================================
// FUNÇÕES DE MODAL
// ========================================

function verDetalhes(id) {
    const pagamento = pagamentos.find(p => p.id === id);
    if (!pagamento) return;
    
    const conteudo = document.getElementById('detalhesConteudo');
    conteudo.innerHTML = `
        <div class="detalhe-item">
            <span class="detalhe-label">ID do Pagamento</span>
            <span class="detalhe-valor"><code>${pagamento.id}</code></span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">ID Asaas</span>
            <span class="detalhe-valor"><code>${pagamento.asaasId}</code></span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Data/Hora</span>
            <span class="detalhe-valor">${formatarData(pagamento.data)}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Cliente</span>
            <span class="detalhe-valor">${pagamento.cliente}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">CPF</span>
            <span class="detalhe-valor">${pagamento.cpf}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">E-mail</span>
            <span class="detalhe-valor">${pagamento.email}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Produto</span>
            <span class="detalhe-valor">${pagamento.produto}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Descrição</span>
            <span class="detalhe-valor">${pagamento.descricao}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Valor Original</span>
            <span class="detalhe-valor">${formatarMoeda(pagamento.valorOriginal)}</span>
        </div>
        ${pagamento.desconto > 0 ? `
        <div class="detalhe-item">
            <span class="detalhe-label">Desconto</span>
            <span class="detalhe-valor" style="color: #2e7d32;">- ${formatarMoeda(pagamento.desconto)}</span>
        </div>
        ` : ''}
        <div class="detalhe-item">
            <span class="detalhe-label">Valor Pago</span>
            <span class="detalhe-valor valor-positivo">${formatarMoeda(pagamento.valor)}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Forma de Pagamento</span>
            <span class="detalhe-valor">${renderizarTipo(pagamento.tipo)}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Status</span>
            <span class="detalhe-valor">${renderizarStatus(pagamento.status)}</span>
        </div>
        ${pagamento.transactionId ? `
        <div class="detalhe-item">
            <span class="detalhe-label">ID da Transação PIX</span>
            <span class="detalhe-valor"><code style="font-size: 0.75rem;">${pagamento.transactionId}</code></span>
        </div>
        ` : ''}
    `;
    
    document.getElementById('modalDetalhes').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalDetalhes').classList.remove('active');
}

// ========================================
// FUNÇÕES DE EXPORTAÇÃO
// ========================================

function exportarPagamentos() {
    const pagamentosFiltrados = filtrarPagamentos();
    
    if (pagamentosFiltrados.length === 0) {
        alert('Nenhum pagamento para exportar.');
        return;
    }
    
    // Criar CSV
    const headers = ['ID', 'Data', 'Cliente', 'CPF', 'E-mail', 'Produto', 'Valor', 'Tipo', 'Status'];
    const rows = pagamentosFiltrados.map(p => [
        p.id,
        formatarData(p.data),
        p.cliente,
        p.cpf,
        p.email,
        p.produto,
        p.valor.toFixed(2).replace('.', ','),
        p.tipo,
        p.status
    ]);
    
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    
    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pagamentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Exportar funções globais
window.aplicarFiltros = aplicarFiltros;
window.limparFiltros = limparFiltros;
window.atualizarLista = atualizarLista;
window.verDetalhes = verDetalhes;
window.fecharModal = fecharModal;
window.exportarPagamentos = exportarPagamentos;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
