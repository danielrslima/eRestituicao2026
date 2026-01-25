/* ========================================
   AUTENTICAÇÃO - DASHBOARD e-RESTITUIÇÃO
   ======================================== */

// Usuários de teste (em produção, virá do banco de dados)
const USUARIOS_TESTE = [
    {
        id: 1,
        email: 'admin@erestituicao.com.br',
        senha: 'admin123',
        nome: 'Administrador',
        nivel: 'admin'
    },
    {
        id: 2,
        email: 'funcionario@erestituicao.com.br',
        senha: 'func123',
        nome: 'João Silva',
        nivel: 'funcionario'
    },
    {
        id: 3,
        email: 'parceiro@erestituicao.com.br',
        senha: 'parc123',
        nome: 'Maria Santos',
        nivel: 'parceiro'
    }
];

// Permissões por nível
const PERMISSOES = {
    admin: {
        visualizarTodosClientes: true,
        visualizarSeusClientes: true,
        cadastrarClientes: true,
        realizarCalculos: true,
        gerarKitIR: true,
        gerarPDFs: true,
        verPagamentos: true,
        criarContratos: true,
        verRelatorios: true,
        crmVerTodos: true,
        crmAlterarStatus: true,
        crmExcluir: true,
        excluirRegistros: true,
        alterarConfiguracoes: true,
        gerenciarUsuarios: true,
        verDadosFinanceiros: true,
        controleFinanceiro: true,
        verComissoes: true
    },
    funcionario: {
        visualizarTodosClientes: true,
        visualizarSeusClientes: true,
        cadastrarClientes: true,
        realizarCalculos: true,
        gerarKitIR: true,
        gerarPDFs: true,
        verPagamentos: true,
        criarContratos: true,
        verRelatorios: true,
        crmVerTodos: true,
        crmAlterarStatus: true,
        crmExcluir: false,
        excluirRegistros: false,
        alterarConfiguracoes: false,
        gerenciarUsuarios: false,
        verDadosFinanceiros: false,
        controleFinanceiro: false,
        verComissoes: false
    },
    parceiro: {
        visualizarTodosClientes: false,
        visualizarSeusClientes: true,
        cadastrarClientes: true,
        realizarCalculos: false,
        gerarKitIR: false,
        gerarPDFs: false,
        verPagamentos: false,
        criarContratos: false,
        verRelatorios: false,
        crmVerTodos: false,
        crmAlterarStatus: false,
        crmExcluir: false,
        excluirRegistros: false,
        alterarConfiguracoes: false,
        gerenciarUsuarios: false,
        verDadosFinanceiros: false,
        controleFinanceiro: false,
        verComissoes: true
    }
};

// Classe de Autenticação
class Auth {
    constructor() {
        this.usuario = null;
        this.carregarSessao();
    }

    // Fazer login
    login(email, senha) {
        const usuario = USUARIOS_TESTE.find(u => u.email === email && u.senha === senha);
        
        if (usuario) {
            this.usuario = {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                nivel: usuario.nivel,
                permissoes: PERMISSOES[usuario.nivel]
            };
            this.salvarSessao();
            return { sucesso: true, usuario: this.usuario };
        }
        
        return { sucesso: false, erro: 'E-mail ou senha incorretos' };
    }

    // Fazer logout
    logout() {
        this.usuario = null;
        localStorage.removeItem('dashboard_sessao');
        window.location.href = 'login.html';
    }

    // Verificar se está logado
    estaLogado() {
        return this.usuario !== null;
    }

    // Obter usuário atual
    getUsuario() {
        return this.usuario;
    }

    // Verificar permissão
    temPermissao(permissao) {
        if (!this.usuario) return false;
        return this.usuario.permissoes[permissao] === true;
    }

    // Obter nível do usuário
    getNivel() {
        return this.usuario ? this.usuario.nivel : null;
    }

    // Obter nome formatado do nível
    getNivelFormatado() {
        if (!this.usuario) return '';
        const niveis = {
            admin: 'Administrador',
            funcionario: 'Funcionário',
            parceiro: 'Parceiro'
        };
        return niveis[this.usuario.nivel] || this.usuario.nivel;
    }

    // Salvar sessão no localStorage
    salvarSessao() {
        if (this.usuario) {
            localStorage.setItem('dashboard_sessao', JSON.stringify(this.usuario));
        }
    }

    // Carregar sessão do localStorage
    carregarSessao() {
        const sessao = localStorage.getItem('dashboard_sessao');
        if (sessao) {
            try {
                this.usuario = JSON.parse(sessao);
                // Recarregar permissões atualizadas
                if (this.usuario && this.usuario.nivel) {
                    this.usuario.permissoes = PERMISSOES[this.usuario.nivel];
                }
            } catch (e) {
                this.usuario = null;
            }
        }
    }

    // Verificar acesso à página
    verificarAcesso(permissoesNecessarias = []) {
        if (!this.estaLogado()) {
            window.location.href = 'login.html';
            return false;
        }

        if (permissoesNecessarias.length > 0) {
            const temAcesso = permissoesNecessarias.some(p => this.temPermissao(p));
            if (!temAcesso) {
                alert('Você não tem permissão para acessar esta página.');
                window.location.href = 'index.html';
                return false;
            }
        }

        return true;
    }

    // Obter iniciais do nome
    getIniciais() {
        if (!this.usuario || !this.usuario.nome) return '?';
        const partes = this.usuario.nome.split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
        }
        return partes[0][0].toUpperCase();
    }
}

// Instância global
const auth = new Auth();

// Exportar para uso global
window.auth = auth;
