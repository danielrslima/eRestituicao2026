/* ========================================
   DASHBOARD PRINCIPAL - e-RESTITUIÇÃO
   ======================================== */

// Dados de exemplo (em produção, virão do banco de dados)
const CLIENTES_EXEMPLO = [
    {
        id: 1,
        nome: 'José Ramos da Silva',
        cpf: '070.817.318-72',
        email: 'jose.ramos@email.com',
        telefone: '(11) 99999-1234',
        status: 'concluido',
        valorRestituicao: 74028.67,
        dataCalculo: '2026-01-25',
        tipo: 'externo',
        parceiroId: null
    },
    {
        id: 2,
        nome: 'Ana Carmen Souza',
        cpf: '123.456.789-00',
        email: 'ana.carmen@email.com',
        telefone: '(11) 98888-5678',
        status: 'pago_kit',
        valorRestituicao: 26604.54,
        dataCalculo: '2026-01-24',
        tipo: 'externo',
        parceiroId: null
    },
    {
        id: 3,
        nome: 'Carlos Eduardo Lima',
        cpf: '987.654.321-00',
        email: 'carlos.lima@email.com',
        telefone: '(21) 97777-9012',
        status: 'calculado',
        valorRestituicao: 15320.00,
        dataCalculo: '2026-01-25',
        tipo: 'interno',
        parceiroId: 3
    },
    {
        id: 4,
        nome: 'Maria Fernanda Costa',
        cpf: '456.789.123-00',
        email: 'maria.costa@email.com',
        telefone: '(31) 96666-3456',
        status: 'novo',
        valorRestituicao: 0,
        dataCalculo: '2026-01-25',
        tipo: 'externo',
        parceiroId: null
    },
    {
        id: 5,
        nome: 'Roberto Almeida Santos',
        cpf: '789.123.456-00',
        email: 'roberto.santos@email.com',
        telefone: '(41) 95555-7890',
        status: 'analise',
        valorRestituicao: 42150.33,
        dataCalculo: '2026-01-23',
        tipo: 'interno',
        parceiroId: 3
    }
];

// Status disponíveis
const STATUS_LABELS = {
    novo: { texto: '🆕 Novo', classe: 'novo' },
    calculado: { texto: '📊 Calculado', classe: 'calculado' },
    pago_basico: { texto: '💰 Pago Básico', classe: 'pago' },
    pago_kit: { texto: '💰 Pago Kit IR', classe: 'pago' },
    contrato: { texto: '📝 Contrato', classe: 'contrato' },
    enviado: { texto: '📧 Kit Enviado', classe: 'enviado' },
    analise: { texto: '⏳ Em Análise', classe: 'analise' },
    concluido: { texto: '✅ Concluído', classe: 'concluido' },
    cancelado: { texto: '❌ Cancelado', classe: 'cancelado' }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!auth.verificarAcesso()) {
        return;
    }

    // Configurar interface baseada no nível de acesso
    configurarInterface();
    
    // Carregar dados
    carregarEstatisticas();
    carregarUltimosClientes();
    carregarNotificacoes();
    
    // Configurar menu do usuário
    configurarMenuUsuario();
});

// Configurar interface baseada nas permissões
function configurarInterface() {
    const usuario = auth.getUsuario();
    
    // Atualizar informações do usuário
    document.getElementById('userName').textContent = usuario.nome;
    document.getElementById('userRole').textContent = auth.getNivelFormatado();
    document.getElementById('userAvatar').textContent = auth.getIniciais();
    
    // Ocultar elementos sem permissão
    document.querySelectorAll('[data-permissao]').forEach(el => {
        const permissoes = el.dataset.permissao.split(',');
        const temAcesso = permissoes.some(p => auth.temPermissao(p.trim()));
        if (!temAcesso) {
            el.style.display = 'none';
        }
    });
    
    // Ocultar seções inteiras se necessário
    if (!auth.temPermissao('controleFinanceiro') && !auth.temPermissao('verRelatorios')) {
        document.getElementById('navFinanceiro').style.display = 'none';
    }
    
    if (!auth.temPermissao('gerenciarUsuarios') && !auth.temPermissao('alterarConfiguracoes')) {
        document.getElementById('navAdmin').style.display = 'none';
    }
    
    if (!auth.temPermissao('verComissoes')) {
        document.getElementById('navParceiro').style.display = 'none';
    }
    
    if (!auth.temPermissao('gerarKitIR') && !auth.temPermissao('verPagamentos') && !auth.temPermissao('criarContratos')) {
        document.getElementById('navOperacoes').style.display = 'none';
    }
    
    // Ocultar cards financeiros para não-admin
    if (!auth.temPermissao('verDadosFinanceiros')) {
        document.getElementById('cardPagamentos').style.display = 'none';
    }
}

// Carregar estatísticas
function carregarEstatisticas() {
    // Filtrar clientes baseado no nível de acesso
    let clientes = CLIENTES_EXEMPLO;
    
    if (auth.getNivel() === 'parceiro') {
        const usuario = auth.getUsuario();
        clientes = clientes.filter(c => c.parceiroId === usuario.id);
    }
    
    // Total de clientes
    document.getElementById('statTotalClientes').textContent = clientes.length;
    
    // Cálculos realizados
    const calculados = clientes.filter(c => c.status !== 'novo').length;
    document.getElementById('statCalculos').textContent = calculados;
    
    // Total a restituir
    const totalRestituicao = clientes.reduce((sum, c) => sum + c.valorRestituicao, 0);
    document.getElementById('statRestituicao').textContent = formatarMoeda(totalRestituicao);
    
    // Média
    const media = clientes.length > 0 ? totalRestituicao / clientes.length : 0;
    document.getElementById('statRestituicaoChange').textContent = 'Média: ' + formatarMoeda(media);
    
    // Pagamentos (apenas para admin/funcionário)
    if (auth.temPermissao('verDadosFinanceiros')) {
        const pagamentos = clientes.filter(c => c.status.includes('pago') || c.status === 'concluido').length;
        document.getElementById('statPagamentos').textContent = formatarMoeda(pagamentos * 21.98); // 5.99 + 15.99
    }
}

// Carregar últimos clientes
function carregarUltimosClientes() {
    const tbody = document.getElementById('tabelaClientes');
    
    // Filtrar clientes baseado no nível de acesso
    let clientes = CLIENTES_EXEMPLO;
    
    if (auth.getNivel() === 'parceiro') {
        const usuario = auth.getUsuario();
        clientes = clientes.filter(c => c.parceiroId === usuario.id);
    }
    
    // Ordenar por data (mais recentes primeiro)
    clientes.sort((a, b) => new Date(b.dataCalculo) - new Date(a.dataCalculo));
    
    // Pegar os 5 mais recentes
    const ultimos = clientes.slice(0, 5);
    
    if (ultimos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-600);">
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = ultimos.map(cliente => {
        const status = STATUS_LABELS[cliente.status] || { texto: cliente.status, classe: '' };
        const dataFormatada = new Date(cliente.dataCalculo).toLocaleDateString('pt-BR');
        
        return `
            <tr>
                <td><strong>${cliente.nome}</strong></td>
                <td>${cliente.cpf}</td>
                <td><span class="status-badge ${status.classe}">${status.texto}</span></td>
                <td>${cliente.valorRestituicao > 0 ? formatarMoeda(cliente.valorRestituicao) : '-'}</td>
                <td>${dataFormatada}</td>
                <td>
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="verCliente(${cliente.id})" title="Ver detalhes">
                        👁️
                    </button>
                    ${auth.temPermissao('crmAlterarStatus') ? `
                        <button class="btn btn-primary btn-sm btn-icon" onclick="editarCliente(${cliente.id})" title="Editar">
                            ✏️
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Carregar notificações
function carregarNotificacoes() {
    const container = document.getElementById('listaNotificacoes');
    
    // Notificações de exemplo
    const notificacoes = [
        { tipo: 'novo', texto: 'Novo cálculo realizado: Maria Fernanda Costa', tempo: '5 min atrás' },
        { tipo: 'pagamento', texto: 'Pagamento confirmado: Ana Carmen Souza - R$ 5,99', tempo: '1 hora atrás' },
        { tipo: 'kit', texto: 'Kit IR enviado para: José Ramos da Silva', tempo: '3 horas atrás' }
    ];
    
    if (notificacoes.length === 0) {
        container.innerHTML = `
            <p style="color: var(--gray-600); text-align: center; padding: 20px;">
                Nenhuma notificação no momento.
            </p>
        `;
        return;
    }
    
    container.innerHTML = notificacoes.map(n => `
        <div style="padding: 12px 16px; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
            <span>${n.texto}</span>
            <span style="font-size: 12px; color: var(--gray-600);">${n.tempo}</span>
        </div>
    `).join('');
    
    // Atualizar badge
    document.getElementById('notificationBadge').textContent = notificacoes.length;
    document.getElementById('notificationBadge').style.display = 'flex';
}

// Configurar menu do usuário
function configurarMenuUsuario() {
    const userMenu = document.getElementById('userMenu');
    
    userMenu.addEventListener('click', function() {
        if (confirm('Deseja sair do sistema?')) {
            auth.logout();
        }
    });
}

// Funções auxiliares
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function verCliente(id) {
    alert('Ver detalhes do cliente ID: ' + id + '\n\n(Funcionalidade será implementada na página de clientes)');
}

function editarCliente(id) {
    alert('Editar cliente ID: ' + id + '\n\n(Funcionalidade será implementada na página de clientes)');
}

// Exportar funções globais
window.verCliente = verCliente;
window.editarCliente = editarCliente;
