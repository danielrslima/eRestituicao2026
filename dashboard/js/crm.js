/* ========================================
   CRM - GESTÃO DE CLIENTES
   ======================================== */

// Verificar autenticação
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.verificarAcesso()) return;
    
    atualizarInterfaceUsuario();
    carregarClientes();
    configurarEventos();
});

// Dados mockados de clientes para CRM
let clientesCRM = [
    {
        id: 'CLI-0001',
        casoId: 'CLI-0001-0001234',
        nome: 'José Ramos da Silva',
        cpf: '070.817.318-72',
        email: 'jose.ramos@email.com',
        telefone: '(11) 99999-1234',
        tipo: 'interno',
        status: 'concluido',
        valorRestituicao: 74028.67,
        dataCalculo: '2026-01-25',
        parceiro: null,
        historico: [
            { status: 'novo', data: '2026-01-20 09:00', obs: 'Cliente cadastrado' },
            { status: 'calculado', data: '2026-01-20 09:15', obs: 'Cálculo realizado - 5 exercícios' },
            { status: 'contrato', data: '2026-01-21 14:30', obs: 'Contrato assinado' },
            { status: 'enviado', data: '2026-01-22 10:00', obs: 'Kit IR enviado por e-mail' },
            { status: 'analise', data: '2026-01-23 08:00', obs: 'Documentação enviada à Receita' },
            { status: 'concluido', data: '2026-01-25 11:00', obs: 'Restituição creditada na conta' }
        ]
    },
    {
        id: 'CLI-0002',
        casoId: 'CLI-0002-0007890',
        nome: 'Ana Carmen Souza',
        cpf: '123.456.789-00',
        email: 'ana.carmen@email.com',
        telefone: '(11) 98888-5678',
        tipo: 'externo',
        status: 'pago_kit',
        valorRestituicao: 26604.54,
        dataCalculo: '2026-01-24',
        parceiro: null,
        historico: [
            { status: 'novo', data: '2026-01-23 15:00', obs: 'Cliente via site' },
            { status: 'calculado', data: '2026-01-23 15:05', obs: 'Cálculo automático' },
            { status: 'pago_basico', data: '2026-01-23 15:10', obs: 'Pagamento R$ 5,99 - PIX' },
            { status: 'pago_kit', data: '2026-01-24 09:00', obs: 'Pagamento Kit IR R$ 4,01 - PIX' }
        ]
    },
    {
        id: 'CLI-0003',
        casoId: 'CLI-0003-0005555',
        nome: 'Carlos Eduardo Lima',
        cpf: '987.654.321-00',
        email: 'carlos.lima@email.com',
        telefone: '(21) 97777-9012',
        tipo: 'externo',
        status: 'calculado',
        valorRestituicao: 15320.00,
        dataCalculo: '2026-01-25',
        parceiro: 3,
        historico: [
            { status: 'novo', data: '2026-01-25 08:00', obs: 'Cliente indicado por parceiro' },
            { status: 'calculado', data: '2026-01-25 08:05', obs: 'Cálculo automático' }
        ]
    },
    {
        id: 'CLI-0004',
        nome: 'Maria Fernanda Costa',
        cpf: '456.789.123-00',
        email: 'maria.costa@email.com',
        telefone: '(31) 96666-3456',
        tipo: 'interno',
        status: 'novo',
        valorRestituicao: null,
        dataCalculo: null,
        parceiro: null,
        historico: [
            { status: 'novo', data: '2026-01-25 10:00', obs: 'Cliente cadastrado pelo funcionário' }
        ]
    },
    {
        id: 'CLI-0005',
        casoId: 'CLI-0005-0009999',
        nome: 'Roberto Almeida Santos',
        cpf: '789.123.456-00',
        email: 'roberto.santos@email.com',
        telefone: '(41) 95555-7890',
        tipo: 'interno',
        status: 'analise',
        valorRestituicao: 42150.33,
        dataCalculo: '2026-01-23',
        parceiro: null,
        historico: [
            { status: 'novo', data: '2026-01-20 11:00', obs: 'Cliente cadastrado' },
            { status: 'calculado', data: '2026-01-20 11:30', obs: 'Cálculo realizado' },
            { status: 'contrato', data: '2026-01-21 16:00', obs: 'Contrato assinado' },
            { status: 'enviado', data: '2026-01-22 09:00', obs: 'Kit enviado' },
            { status: 'analise', data: '2026-01-23 10:00', obs: 'Aguardando análise da Receita' }
        ]
    },
    {
        id: 'CLI-0006',
        nome: 'Fernanda Oliveira',
        cpf: '111.222.333-44',
        email: 'fernanda@email.com',
        telefone: '(51) 94444-1234',
        tipo: 'externo',
        status: 'pago_basico',
        valorRestituicao: 8750.00,
        dataCalculo: '2026-01-25',
        parceiro: 3,
        historico: [
            { status: 'novo', data: '2026-01-25 11:00', obs: 'Cliente via site' },
            { status: 'calculado', data: '2026-01-25 11:05', obs: 'Cálculo automático' },
            { status: 'pago_basico', data: '2026-01-25 11:10', obs: 'Pagamento R$ 5,99 - Cartão' }
        ]
    },
    {
        id: 'CLI-0007',
        casoId: 'CLI-0007-0003333',
        nome: 'Paulo Henrique Martins',
        cpf: '555.666.777-88',
        email: 'paulo.martins@email.com',
        telefone: '(61) 93333-5678',
        tipo: 'interno',
        status: 'enviado',
        valorRestituicao: 31200.00,
        dataCalculo: '2026-01-22',
        parceiro: null,
        historico: [
            { status: 'novo', data: '2026-01-19 14:00', obs: 'Cliente cadastrado' },
            { status: 'calculado', data: '2026-01-19 14:30', obs: 'Cálculo realizado' },
            { status: 'contrato', data: '2026-01-20 10:00', obs: 'Contrato assinado' },
            { status: 'enviado', data: '2026-01-22 08:00', obs: 'Kit IR enviado por e-mail' }
        ]
    }
];

// Cliente selecionado para alteração
let clienteSelecionado = null;

// Mapeamento de status
const STATUS_MAP = {
    'novo': { emoji: '🆕', nome: 'Novo', cor: '#2196f3' },
    'calculado': { emoji: '📊', nome: 'Calculado', cor: '#ff9800' },
    'pago_basico': { emoji: '💰', nome: 'Pago Básico', cor: '#4caf50' },
    'pago_kit': { emoji: '💰', nome: 'Pago Kit IR', cor: '#4caf50' },
    'pago': { emoji: '💰', nome: 'Pago', cor: '#4caf50' },
    'contrato': { emoji: '📝', nome: 'Contrato', cor: '#9c27b0' },
    'enviado': { emoji: '📧', nome: 'Kit Enviado', cor: '#00bcd4' },
    'analise': { emoji: '⏳', nome: 'Em Análise', cor: '#ffc107' },
    'concluido': { emoji: '✅', nome: 'Concluído', cor: '#1a7f37' },
    'cancelado': { emoji: '❌', nome: 'Cancelado', cor: '#d32f2f' }
};

// Atualizar interface do usuário
function atualizarInterfaceUsuario() {
    const usuario = auth.getUsuario();
    if (!usuario) return;
    
    document.getElementById('userName').textContent = usuario.nome;
    document.getElementById('userRole').textContent = auth.getNivelFormatado();
    document.getElementById('userAvatar').textContent = auth.getIniciais();
    
    // Aplicar permissões
    aplicarPermissoes();
}

// Aplicar permissões de acesso
function aplicarPermissoes() {
    // Ocultar seções baseado em permissões
    if (!auth.temPermissao('controleFinanceiro') && !auth.temPermissao('verRelatorios')) {
        const navFinanceiro = document.getElementById('navFinanceiro');
        if (navFinanceiro) navFinanceiro.style.display = 'none';
    }
    
    if (!auth.temPermissao('gerenciarUsuarios') && !auth.temPermissao('alterarConfiguracoes')) {
        const navAdmin = document.getElementById('navAdmin');
        if (navAdmin) navAdmin.style.display = 'none';
    }
    
    // Botões de alterar status
    if (!auth.temPermissao('crmAlterarStatus')) {
        document.querySelectorAll('.btn-status').forEach(btn => {
            btn.style.display = 'none';
        });
        const btnAlterarDetalhes = document.getElementById('btnAlterarStatusDetalhes');
        if (btnAlterarDetalhes) btnAlterarDetalhes.style.display = 'none';
    }
    
    // Botões de excluir
    if (!auth.temPermissao('crmExcluir')) {
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.style.display = 'none';
        });
    }
    
    // Botão gerar Kit IR
    if (!auth.temPermissao('gerarKitIR')) {
        const btnKit = document.getElementById('btnGerarKitDetalhes');
        if (btnKit) btnKit.style.display = 'none';
    }
}

// Carregar clientes no CRM
function carregarClientes() {
    let clientes = clientesCRM;
    
    // Filtrar por parceiro se for nível parceiro
    if (auth.getNivel() === 'parceiro') {
        const usuario = auth.getUsuario();
        clientes = clientes.filter(c => c.parceiro === usuario.id);
    }
    
    // Ordenar clientes alfabeticamente
    clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    // Atualizar métricas
    atualizarMetricas(clientes);
    
    // Renderizar Kanban
    renderizarKanban(clientes);
    
    // Renderizar Lista
    renderizarLista(clientes);
}

// Atualizar métricas
function atualizarMetricas(clientes) {
    const metricas = {
        novos: clientes.filter(c => c.status === 'novo').length,
        calculados: clientes.filter(c => c.status === 'calculado').length,
        pagos: clientes.filter(c => ['pago_basico', 'pago_kit', 'pago'].includes(c.status)).length,
        contratos: clientes.filter(c => c.status === 'contrato').length,
        analise: clientes.filter(c => c.status === 'analise').length,
        concluidos: clientes.filter(c => c.status === 'concluido').length
    };
    
    document.getElementById('metricaNovos').textContent = metricas.novos;
    document.getElementById('metricaCalculados').textContent = metricas.calculados;
    document.getElementById('metricaPagos').textContent = metricas.pagos;
    document.getElementById('metricaContratos').textContent = metricas.contratos;
    document.getElementById('metricaAnalise').textContent = metricas.analise;
    document.getElementById('metricaConcluidos').textContent = metricas.concluidos;
}

// Renderizar Kanban
function renderizarKanban(clientes) {
    // Limpar colunas
    const colunas = ['Novo', 'Calculado', 'Pago', 'Contrato', 'Enviado', 'Analise', 'Concluido'];
    colunas.forEach(col => {
        const container = document.getElementById(`cards${col}`);
        if (container) container.innerHTML = '';
    });
    
    // Mapear status para colunas
    const statusParaColuna = {
        'novo': 'Novo',
        'calculado': 'Calculado',
        'pago_basico': 'Pago',
        'pago_kit': 'Pago',
        'pago': 'Pago',
        'contrato': 'Contrato',
        'enviado': 'Enviado',
        'analise': 'Analise',
        'concluido': 'Concluido'
    };
    
    // Contadores
    const contadores = {
        'Novo': 0, 'Calculado': 0, 'Pago': 0, 'Contrato': 0, 
        'Enviado': 0, 'Analise': 0, 'Concluido': 0
    };
    
    // Adicionar cards
    clientes.forEach(cliente => {
        if (cliente.status === 'cancelado') return; // Não mostrar cancelados no Kanban
        
        const coluna = statusParaColuna[cliente.status];
        if (!coluna) return;
        
        const container = document.getElementById(`cards${coluna}`);
        if (!container) return;
        
        contadores[coluna]++;
        
        const card = criarCardKanban(cliente);
        container.appendChild(card);
    });
    
    // Atualizar contadores
    Object.keys(contadores).forEach(col => {
        const countEl = document.getElementById(`count${col}`);
        if (countEl) countEl.textContent = contadores[col];
    });
}

// Criar card do Kanban
function criarCardKanban(cliente) {
    const card = document.createElement('div');
    card.className = `kanban-card ${cliente.tipo}`;
    card.onclick = () => abrirModalDetalhes(cliente.id);
    
    const valor = cliente.valorRestituicao 
        ? `R$ ${cliente.valorRestituicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '-';
    
    const data = cliente.historico.length > 0 
        ? cliente.historico[cliente.historico.length - 1].data.split(' ')[0]
        : '-';
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-nome">${cliente.nome}</span>
            <span class="card-tipo ${cliente.tipo}">${cliente.tipo === 'externo' ? '🌐 Externo' : '🏢 Interno'}</span>
        </div>
        <div class="card-cpf">${cliente.cpf}</div>
        <div class="card-valor">${valor}</div>
        <div class="card-footer">
            <span class="card-data">📅 ${formatarData(data)}</span>
            <div class="card-acoes" onclick="event.stopPropagation()">
                <button class="btn-ver" onclick="abrirModalDetalhes('${cliente.id}')" title="Ver detalhes">👁️</button>
                ${auth.temPermissao('crmAlterarStatus') ? `<button class="btn-status" onclick="abrirModalStatus('${cliente.id}')" title="Alterar status">📋</button>` : ''}
                ${auth.temPermissao('crmExcluir') ? `<button class="btn-excluir" onclick="excluirCliente('${cliente.id}')" title="Excluir">🗑️</button>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Renderizar Lista
function renderizarLista(clientes) {
    const tbody = document.getElementById('tabelaCRM');
    if (!tbody) return;
    
    tbody.innerHTML = clientes.map(cliente => {
        const status = STATUS_MAP[cliente.status] || STATUS_MAP['novo'];
        const valor = cliente.valorRestituicao 
            ? `R$ ${cliente.valorRestituicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : '-';
        
        const ultimaAtualizacao = cliente.historico.length > 0 
            ? cliente.historico[cliente.historico.length - 1].data
            : '-';
        
        return `
            <tr>
                <td>
                    <strong>${cliente.nome}</strong><br>
                    <small class="text-muted">${cliente.id}</small>
                </td>
                <td>${cliente.cpf}</td>
                <td><span class="badge ${cliente.tipo}">${cliente.tipo === 'externo' ? '🌐 Externo' : '🏢 Interno'}</span></td>
                <td><span class="status-badge" style="background: ${status.cor}20; color: ${status.cor}">${status.emoji} ${status.nome}</span></td>
                <td class="valor">${valor}</td>
                <td>${ultimaAtualizacao}</td>
                <td>
                    <button class="btn-icon" onclick="abrirModalDetalhes('${cliente.id}')" title="Ver detalhes">👁️</button>
                    ${auth.temPermissao('crmAlterarStatus') ? `<button class="btn-icon" onclick="abrirModalStatus('${cliente.id}')" title="Alterar status">📋</button>` : ''}
                    ${auth.temPermissao('crmExcluir') ? `<button class="btn-icon btn-danger" onclick="excluirCliente('${cliente.id}')" title="Excluir">🗑️</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Configurar eventos
function configurarEventos() {
    // Busca
    const buscaInput = document.getElementById('buscaCRM');
    if (buscaInput) {
        buscaInput.addEventListener('input', filtrarClientes);
    }
    
    // Filtro tipo
    const filtroTipo = document.getElementById('filtroTipo');
    if (filtroTipo) {
        filtroTipo.addEventListener('change', filtrarClientes);
    }
}

// Filtrar clientes
function filtrarClientes() {
    const busca = document.getElementById('buscaCRM').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;
    
    let clientes = clientesCRM;
    
    // Filtrar por parceiro se for nível parceiro
    if (auth.getNivel() === 'parceiro') {
        const usuario = auth.getUsuario();
        clientes = clientes.filter(c => c.parceiro === usuario.id);
    }
    
    // Filtrar por busca
    if (busca) {
        clientes = clientes.filter(c => 
            c.nome.toLowerCase().includes(busca) ||
            c.cpf.includes(busca) ||
            c.email.toLowerCase().includes(busca)
        );
    }
    
    // Filtrar por tipo
    if (tipo) {
        clientes = clientes.filter(c => c.tipo === tipo);
    }
    
    // Ordenar clientes alfabeticamente
    clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    renderizarKanban(clientes);
    renderizarLista(clientes);
}

// Toggle visualização Kanban/Lista
function toggleVisualizacao() {
    const kanban = document.getElementById('kanbanView');
    const lista = document.getElementById('listaView');
    const icon = document.getElementById('toggleIcon');
    const text = document.getElementById('toggleText');
    
    if (kanban.style.display === 'none') {
        kanban.style.display = 'flex';
        lista.style.display = 'none';
        icon.textContent = '📊';
        text.textContent = 'Kanban';
    } else {
        kanban.style.display = 'none';
        lista.style.display = 'block';
        icon.textContent = '📋';
        text.textContent = 'Lista';
    }
}

// Abrir modal de status
function abrirModalStatus(clienteId) {
    const cliente = clientesCRM.find(c => c.id === clienteId);
    if (!cliente) return;
    
    clienteSelecionado = cliente;
    
    const status = STATUS_MAP[cliente.status] || STATUS_MAP['novo'];
    
    document.getElementById('modalClienteNome').textContent = cliente.nome;
    document.getElementById('modalClienteId').textContent = cliente.id;
    document.getElementById('modalStatusAtual').textContent = `${status.emoji} ${status.nome}`;
    document.getElementById('modalStatusAtual').style.background = `${status.cor}20`;
    document.getElementById('modalStatusAtual').style.color = status.cor;
    document.getElementById('novoStatus').value = cliente.status;
    document.getElementById('observacao').value = '';
    
    document.getElementById('modalStatus').classList.add('active');
}

// Fechar modal de status
function fecharModalStatus() {
    document.getElementById('modalStatus').classList.remove('active');
    clienteSelecionado = null;
}

// Salvar novo status
function salvarNovoStatus() {
    if (!clienteSelecionado) return;
    
    const novoStatus = document.getElementById('novoStatus').value;
    const observacao = document.getElementById('observacao').value;
    
    // Atualizar cliente
    const cliente = clientesCRM.find(c => c.id === clienteSelecionado.id);
    if (cliente) {
        cliente.status = novoStatus;
        cliente.historico.push({
            status: novoStatus,
            data: new Date().toLocaleString('pt-BR').replace(',', ''),
            obs: observacao || 'Status alterado'
        });
    }
    
    fecharModalStatus();
    carregarClientes();
    
    // Feedback
    alert(`✅ Status alterado para: ${STATUS_MAP[novoStatus].emoji} ${STATUS_MAP[novoStatus].nome}`);
}

// Abrir modal de detalhes
function abrirModalDetalhes(clienteId) {
    const cliente = clientesCRM.find(c => c.id === clienteId);
    if (!cliente) return;
    
    clienteSelecionado = cliente;
    
    const status = STATUS_MAP[cliente.status] || STATUS_MAP['novo'];
    
    document.getElementById('detalheNome').textContent = cliente.nome;
    document.getElementById('detalheCPF').textContent = cliente.cpf;
    document.getElementById('detalheEmail').textContent = cliente.email;
    document.getElementById('detalheTelefone').textContent = cliente.telefone;
    document.getElementById('detalheTipo').textContent = cliente.tipo === 'externo' ? '🌐 Externo (via site)' : '🏢 Interno (via dashboard)';
    
    document.getElementById('detalheCasoId').textContent = cliente.casoId || '-';
    document.getElementById('detalheProcesso').textContent = cliente.casoId ? 'Ativo' : 'Não iniciado';
    document.getElementById('detalheValor').textContent = cliente.valorRestituicao 
        ? `R$ ${cliente.valorRestituicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '-';
    document.getElementById('detalheStatus').innerHTML = `<span style="background: ${status.cor}20; color: ${status.cor}; padding: 3px 10px; border-radius: 15px;">${status.emoji} ${status.nome}</span>`;
    document.getElementById('detalheDataCalculo').textContent = cliente.dataCalculo ? formatarData(cliente.dataCalculo) : '-';
    
    // Renderizar timeline
    const timeline = document.getElementById('timelineHistorico');
    timeline.innerHTML = cliente.historico.map(h => {
        const st = STATUS_MAP[h.status] || STATUS_MAP['novo'];
        return `
            <div class="timeline-item">
                <div class="timeline-status">${st.emoji} ${st.nome}</div>
                <div class="timeline-data">${h.data}</div>
                ${h.obs ? `<div class="timeline-obs">"${h.obs}"</div>` : ''}
            </div>
        `;
    }).reverse().join('');
    
    document.getElementById('modalDetalhes').classList.add('active');
    
    // Aplicar permissões nos botões do modal
    if (!auth.temPermissao('crmAlterarStatus')) {
        document.getElementById('btnAlterarStatusDetalhes').style.display = 'none';
    }
    if (!auth.temPermissao('gerarKitIR')) {
        document.getElementById('btnGerarKitDetalhes').style.display = 'none';
    }
}

// Fechar modal de detalhes
function fecharModalDetalhes() {
    document.getElementById('modalDetalhes').classList.remove('active');
}

// Abrir modal status a partir dos detalhes
function abrirModalStatusFromDetalhes() {
    if (clienteSelecionado) {
        fecharModalDetalhes();
        setTimeout(() => abrirModalStatus(clienteSelecionado.id), 300);
    }
}

// Gerar Kit IR (placeholder)
function gerarKitIR() {
    if (!clienteSelecionado) return;
    alert(`📦 Gerando Kit IR para: ${clienteSelecionado.nome}\n\nEsta funcionalidade será implementada no módulo Kit IR / PDFs.`);
}

// Excluir cliente
function excluirCliente(clienteId) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este cliente?\n\nEsta ação não pode ser desfeita.')) {
        return;
    }
    
    const index = clientesCRM.findIndex(c => c.id === clienteId);
    if (index > -1) {
        clientesCRM.splice(index, 1);
        carregarClientes();
        alert('✅ Cliente excluído com sucesso!');
    }
}

// Formatar data
function formatarData(data) {
    if (!data) return '-';
    if (data.includes('/')) return data;
    
    const partes = data.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
}

// Adicionar classe active ao modal
const style = document.createElement('style');
style.textContent = `
    .modal-overlay.active {
        display: flex !important;
    }
`;
document.head.appendChild(style);
