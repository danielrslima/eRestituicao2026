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
    const cliente = CLIENTES_EXEMPLO.find(c => c.id === id);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    const statusInfo = STATUS_LABELS[cliente.status] || { texto: cliente.status, classe: 'novo' };
    
    // Criar modal dinâmico
    const modalHtml = `
        <div class="modal-overlay" id="modalVerClienteDash" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
            <div class="modal" style="background: white; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #1a7f37;">📋 Detalhes do Cliente</h3>
                    <button style="background: none; border: none; font-size: 24px; cursor: pointer;" onclick="document.getElementById('modalVerClienteDash').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="margin-bottom: 15px;">
                        <p style="margin: 8px 0;"><strong>ID:</strong> ${cliente.id}</p>
                        <p style="margin: 8px 0;"><strong>Nome:</strong> ${cliente.nome}</p>
                        <p style="margin: 8px 0;"><strong>CPF:</strong> ${cliente.cpf}</p>
                        <p style="margin: 8px 0;"><strong>E-mail:</strong> ${cliente.email}</p>
                        <p style="margin: 8px 0;"><strong>Telefone:</strong> ${cliente.telefone}</p>
                        <p style="margin: 8px 0;"><strong>Status:</strong> <span class="status-badge ${statusInfo.classe}">${statusInfo.texto}</span></p>
                        <p style="margin: 8px 0;"><strong>Valor Restituição:</strong> ${cliente.valorRestituicao > 0 ? formatarMoeda(cliente.valorRestituicao) : '-'}</p>
                        <p style="margin: 8px 0;"><strong>Data Cálculo:</strong> ${cliente.dataCalculo ? new Date(cliente.dataCalculo).toLocaleDateString('pt-BR') : '-'}</p>
                        <p style="margin: 8px 0;"><strong>Tipo:</strong> ${cliente.tipo === 'externo' ? '🌐 Externo (via site)' : '🏢 Interno'}</p>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-secondary" style="padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="document.getElementById('modalVerClienteDash').remove()">Fechar</button>
                    <a href="clientes.html" class="btn btn-primary" style="padding: 8px 16px; border-radius: 6px; background: #1a7f37; color: white; text-decoration: none;">Ver na Página de Clientes</a>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const modalAnterior = document.getElementById('modalVerClienteDash');
    if (modalAnterior) modalAnterior.remove();
    
    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function editarCliente(id) {
    const cliente = CLIENTES_EXEMPLO.find(c => c.id === id);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    // Criar modal de edição
    const modalHtml = `
        <div class="modal-overlay" id="modalEditarClienteDash" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
            <div class="modal" style="background: white; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #1a7f37;">✏️ Editar Cliente</h3>
                    <button style="background: none; border: none; font-size: 24px; cursor: pointer;" onclick="document.getElementById('modalEditarClienteDash').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <form id="formEditarClienteDash">
                        <input type="hidden" id="editIdDash" value="${cliente.id}">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Nome</label>
                            <input type="text" id="editNomeDash" value="${cliente.nome}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">E-mail</label>
                            <input type="email" id="editEmailDash" value="${cliente.email}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Telefone</label>
                            <input type="text" id="editTelefoneDash" value="${cliente.telefone}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Status</label>
                            <select id="editStatusDash" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                                <option value="novo" ${cliente.status === 'novo' ? 'selected' : ''}>🆕 Novo</option>
                                <option value="calculado" ${cliente.status === 'calculado' ? 'selected' : ''}>📊 Calculado</option>
                                <option value="pago_basico" ${cliente.status === 'pago_basico' ? 'selected' : ''}>💰 Pago Básico</option>
                                <option value="pago_kit" ${cliente.status === 'pago_kit' ? 'selected' : ''}>💰 Pago Kit IR</option>
                                <option value="contrato" ${cliente.status === 'contrato' ? 'selected' : ''}>📝 Contrato</option>
                                <option value="enviado" ${cliente.status === 'enviado' ? 'selected' : ''}>📧 Kit Enviado</option>
                                <option value="analise" ${cliente.status === 'analise' ? 'selected' : ''}>⏳ Em Análise</option>
                                <option value="concluido" ${cliente.status === 'concluido' ? 'selected' : ''}>✅ Concluído</option>
                                <option value="cancelado" ${cliente.status === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-secondary" style="padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="document.getElementById('modalEditarClienteDash').remove()">Cancelar</button>
                    <button class="btn btn-primary" style="padding: 8px 16px; border-radius: 6px; background: #1a7f37; color: white; cursor: pointer;" onclick="salvarEdicaoClienteDash()">💾 Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const modalAnterior = document.getElementById('modalEditarClienteDash');
    if (modalAnterior) modalAnterior.remove();
    
    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function salvarEdicaoClienteDash() {
    const id = parseInt(document.getElementById('editIdDash').value);
    const cliente = CLIENTES_EXEMPLO.find(c => c.id === id);
    
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    // Atualizar dados
    cliente.nome = document.getElementById('editNomeDash').value.trim();
    cliente.email = document.getElementById('editEmailDash').value.trim();
    cliente.telefone = document.getElementById('editTelefoneDash').value.trim();
    cliente.status = document.getElementById('editStatusDash').value;
    
    // Fechar modal
    document.getElementById('modalEditarClienteDash').remove();
    
    // Recarregar tabela
    carregarUltimosClientes();
    carregarEstatisticas();
    
    // Feedback
    mostrarNotificacaoDash('✅ Cliente atualizado com sucesso!', 'success');
}

function mostrarNotificacaoDash(mensagem, tipo) {
    const notificacao = document.createElement('div');
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
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}

// Exportar funções globais
window.verCliente = verCliente;
window.editarCliente = editarCliente;
