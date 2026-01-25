/**
 * Usuários - JavaScript
 * Lógica para a página de gestão de usuários
 */

// Dados mock de usuários
let usuarios = [
    {
        id: 1,
        nome: 'Administrador Sistema',
        email: 'admin@erestituicao.com.br',
        telefone: '(11) 93713-9391',
        tipo: 'admin',
        status: 'ativo',
        ultimoAcesso: '2026-01-25 10:15',
        permissoes: ['clientes', 'crm', 'kitir', 'financeiro', 'pagamentos', 'relatorios', 'usuarios', 'config']
    },
    {
        id: 2,
        nome: 'Maria Operadora',
        email: 'maria@erestituicao.com.br',
        telefone: '(11) 98765-4321',
        tipo: 'operador',
        status: 'ativo',
        ultimoAcesso: '2026-01-25 09:30',
        permissoes: ['clientes', 'crm', 'kitir']
    },
    {
        id: 3,
        nome: 'João Silva',
        email: 'joao@parceiro.com.br',
        telefone: '(11) 91234-5678',
        tipo: 'parceiro',
        status: 'ativo',
        ultimoAcesso: '2026-01-24 16:45',
        codigoParceiro: 'JOAO2026',
        tipoComissao: 'porcentagem',
        valorComissao: 10,
        chavePix: 'joao@parceiro.com.br',
        permissoes: ['clientes']
    },
    {
        id: 4,
        nome: 'Ana Souza',
        email: 'ana@parceiro.com.br',
        telefone: '(21) 99876-5432',
        tipo: 'parceiro',
        status: 'ativo',
        ultimoAcesso: '2026-01-23 14:20',
        codigoParceiro: 'ANA2026',
        tipoComissao: 'fixo',
        valorComissao: 50,
        chavePix: '123.456.789-00',
        permissoes: ['clientes']
    },
    {
        id: 5,
        nome: 'Carlos Operador',
        email: 'carlos@erestituicao.com.br',
        telefone: '(11) 97654-3210',
        tipo: 'operador',
        status: 'inativo',
        ultimoAcesso: '2026-01-10 11:00',
        permissoes: ['clientes', 'crm']
    },
    {
        id: 6,
        nome: 'Pedro Novo',
        email: 'pedro@parceiro.com.br',
        telefone: '(31) 98888-7777',
        tipo: 'parceiro',
        status: 'pendente',
        ultimoAcesso: null,
        codigoParceiro: 'PEDRO2026',
        tipoComissao: 'porcentagem',
        valorComissao: 8,
        chavePix: '(31) 98888-7777',
        permissoes: ['clientes']
    }
];

let paginaAtual = 1;
const itensPorPagina = 10;
let usuarioParaExcluir = null;

// Inicialização
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
    
    // Carregar dados
    atualizarCards();
    renderizarTabela();
});

function atualizarData() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const data = new Date().toLocaleDateString('pt-BR', options);
    document.getElementById('dataAtual').textContent = data.charAt(0).toUpperCase() + data.slice(1);
}

// Atualizar cards de resumo
function atualizarCards() {
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'ativo').length;
    const parceiros = usuarios.filter(u => u.tipo === 'parceiro').length;
    const admins = usuarios.filter(u => u.tipo === 'admin').length;
    
    document.getElementById('totalUsuarios').textContent = total;
    document.getElementById('usuariosAtivos').textContent = ativos;
    document.getElementById('totalParceiros').textContent = parceiros;
    document.getElementById('totalAdmins').textContent = admins;
}

// Renderizar tabela
function renderizarTabela() {
    const filtroTipo = document.getElementById('filtroTipo').value;
    const filtroStatus = document.getElementById('filtroStatus').value;
    const busca = document.getElementById('buscarUsuario').value.toLowerCase();
    
    let usuariosFiltrados = usuarios.filter(u => {
        if (filtroTipo && u.tipo !== filtroTipo) return false;
        if (filtroStatus && u.status !== filtroStatus) return false;
        if (busca && !u.nome.toLowerCase().includes(busca) && !u.email.toLowerCase().includes(busca)) return false;
        return true;
    });
    
    // Paginação
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fim);
    
    // Atualizar info de paginação
    document.getElementById('paginacaoInicio').textContent = usuariosFiltrados.length > 0 ? inicio + 1 : 0;
    document.getElementById('paginacaoFim').textContent = Math.min(fim, usuariosFiltrados.length);
    document.getElementById('paginacaoTotal').textContent = usuariosFiltrados.length;
    
    // Renderizar linhas
    const tbody = document.getElementById('tabelaUsuarios');
    tbody.innerHTML = usuariosPagina.map(u => `
        <tr>
            <td>
                <div class="usuario-info">
                    <div class="usuario-avatar">${getIniciais(u.nome)}</div>
                    <div>
                        <div class="usuario-nome">${u.nome}</div>
                        <div class="usuario-telefone">${u.telefone || '-'}</div>
                    </div>
                </div>
            </td>
            <td>${u.email}</td>
            <td><span class="badge badge-${u.tipo}">${getTipoLabel(u.tipo)}</span></td>
            <td><span class="badge badge-${u.status}">${getStatusLabel(u.status)}</span></td>
            <td>${u.ultimoAcesso ? formatarData(u.ultimoAcesso) : 'Nunca'}</td>
            <td>
                <div class="acoes-btns">
                    <button class="btn-acao btn-editar" onclick="editarUsuario(${u.id})" title="Editar">✏️</button>
                    <button class="btn-acao btn-excluir" onclick="excluirUsuario(${u.id})" title="Excluir">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    if (usuariosPagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">Nenhum usuário encontrado</td></tr>';
    }
}

// Funções auxiliares
function getIniciais(nome) {
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function getTipoLabel(tipo) {
    const labels = {
        'admin': 'Administrador',
        'operador': 'Operador',
        'parceiro': 'Parceiro'
    };
    return labels[tipo] || tipo;
}

function getStatusLabel(status) {
    const labels = {
        'ativo': 'Ativo',
        'inativo': 'Inativo',
        'pendente': 'Pendente'
    };
    return labels[status] || status;
}

function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Filtrar usuários
function filtrarUsuarios() {
    paginaAtual = 1;
    renderizarTabela();
}

// Paginação
function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTabela();
    }
}

function proximaPagina() {
    const totalPaginas = Math.ceil(usuarios.length / itensPorPagina);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTabela();
    }
}

// Modal de novo usuário
function abrirModalNovoUsuario() {
    document.getElementById('modalUsuarioTitulo').textContent = '➕ Novo Usuário';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('camposParceiro').style.display = 'none';
    abrirModal('modalUsuario');
}

// Editar usuário
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    document.getElementById('modalUsuarioTitulo').textContent = '✏️ Editar Usuário';
    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('usuarioNome').value = usuario.nome;
    document.getElementById('usuarioEmail').value = usuario.email;
    document.getElementById('usuarioTelefone').value = usuario.telefone || '';
    document.getElementById('usuarioTipo').value = usuario.tipo;
    document.getElementById('usuarioStatus').value = usuario.status;
    document.getElementById('usuarioSenha').value = '';
    
    // Campos de parceiro
    if (usuario.tipo === 'parceiro') {
        document.getElementById('camposParceiro').style.display = 'block';
        document.getElementById('parceiroCodigo').value = usuario.codigoParceiro || '';
        document.getElementById('parceiroComissao').value = usuario.valorComissao || 10;
        document.getElementById('parceiroPix').value = usuario.chavePix || '';
    } else {
        document.getElementById('camposParceiro').style.display = 'none';
    }
    
    // Permissões
    document.getElementById('permClientes').checked = usuario.permissoes.includes('clientes');
    document.getElementById('permCRM').checked = usuario.permissoes.includes('crm');
    document.getElementById('permKitIR').checked = usuario.permissoes.includes('kitir');
    document.getElementById('permFinanceiro').checked = usuario.permissoes.includes('financeiro');
    document.getElementById('permPagamentos').checked = usuario.permissoes.includes('pagamentos');
    document.getElementById('permRelatorios').checked = usuario.permissoes.includes('relatorios');
    document.getElementById('permUsuarios').checked = usuario.permissoes.includes('usuarios');
    document.getElementById('permConfig').checked = usuario.permissoes.includes('config');
    
    abrirModal('modalUsuario');
}

// Mostrar campos de parceiro
function mostrarCamposParceiro() {
    const tipo = document.getElementById('usuarioTipo').value;
    document.getElementById('camposParceiro').style.display = tipo === 'parceiro' ? 'block' : 'none';
}

// Salvar usuário
function salvarUsuario() {
    const id = document.getElementById('usuarioId').value;
    const nome = document.getElementById('usuarioNome').value;
    const email = document.getElementById('usuarioEmail').value;
    const telefone = document.getElementById('usuarioTelefone').value;
    const tipo = document.getElementById('usuarioTipo').value;
    const status = document.getElementById('usuarioStatus').value;
    const senha = document.getElementById('usuarioSenha').value;
    
    if (!nome || !email || !tipo) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Coletar permissões
    const permissoes = [];
    if (document.getElementById('permClientes').checked) permissoes.push('clientes');
    if (document.getElementById('permCRM').checked) permissoes.push('crm');
    if (document.getElementById('permKitIR').checked) permissoes.push('kitir');
    if (document.getElementById('permFinanceiro').checked) permissoes.push('financeiro');
    if (document.getElementById('permPagamentos').checked) permissoes.push('pagamentos');
    if (document.getElementById('permRelatorios').checked) permissoes.push('relatorios');
    if (document.getElementById('permUsuarios').checked) permissoes.push('usuarios');
    if (document.getElementById('permConfig').checked) permissoes.push('config');
    
    const usuarioData = {
        nome,
        email,
        telefone,
        tipo,
        status,
        permissoes,
        ultimoAcesso: null
    };
    
    // Campos de parceiro
    if (tipo === 'parceiro') {
        usuarioData.codigoParceiro = document.getElementById('parceiroCodigo').value;
        usuarioData.valorComissao = parseFloat(document.getElementById('parceiroComissao').value) || 10;
        usuarioData.chavePix = document.getElementById('parceiroPix').value;
    }
    
    if (id) {
        // Editar
        const index = usuarios.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...usuarioData };
        }
    } else {
        // Novo
        usuarioData.id = Math.max(...usuarios.map(u => u.id)) + 1;
        usuarios.push(usuarioData);
    }
    
    fecharModal('modalUsuario');
    atualizarCards();
    renderizarTabela();
    
    alert(id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
}

// Excluir usuário
function excluirUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    usuarioParaExcluir = id;
    document.getElementById('nomeUsuarioExcluir').textContent = usuario.nome;
    abrirModal('modalExcluir');
}

function confirmarExclusao() {
    if (usuarioParaExcluir) {
        usuarios = usuarios.filter(u => u.id !== usuarioParaExcluir);
        usuarioParaExcluir = null;
        fecharModal('modalExcluir');
        atualizarCards();
        renderizarTabela();
        alert('Usuário excluído com sucesso!');
    }
}

// Funções de modal
function abrirModal(id) {
    document.getElementById(id).classList.add('active');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
