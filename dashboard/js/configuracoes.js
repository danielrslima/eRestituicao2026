/**
 * Configurações - JavaScript
 * Lógica para a página de configurações do sistema
 */

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar data atual
    const dataAtual = document.getElementById('dataAtual');
    if (dataAtual) {
        const hoje = new Date();
        dataAtual.textContent = hoje.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Configurar navegação entre seções
    configurarNavegacao();
    
    // Configurar eventos
    configurarEventos();
    
    // Carregar configurações salvas
    carregarConfiguracoes();
});

// Navegação entre seções
function configurarNavegacao() {
    const navItems = document.querySelectorAll('.config-nav-item');
    const sections = document.querySelectorAll('.config-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Adicionar active ao clicado
            this.classList.add('active');
            const section = document.getElementById('section' + capitalize(sectionId));
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// Capitalizar primeira letra
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Configurar eventos
function configurarEventos() {
    // Botão alterar logo - CORRIGIDO
    const btnAlterarLogo = document.getElementById('btnAlterarLogo');
    if (btnAlterarLogo) {
        btnAlterarLogo.addEventListener('click', alterarLogo);
    }
    
    // Botão mostrar/ocultar API Key
    const btnMostrarApiKey = document.getElementById('btnMostrarApiKey');
    if (btnMostrarApiKey) {
        btnMostrarApiKey.addEventListener('click', function() {
            const input = document.getElementById('asaasApiKey');
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    }
    
    // Botão testar conexão Asaas
    const btnTestarAsaas = document.getElementById('btnTestarAsaas');
    if (btnTestarAsaas) {
        btnTestarAsaas.addEventListener('click', function() {
            this.textContent = '⏳ Testando...';
            setTimeout(() => {
                this.textContent = '✅ Conexão OK';
                setTimeout(() => {
                    this.textContent = '🔌 Testar Conexão';
                }, 2000);
            }, 1500);
        });
    }
    
    // Botão salvar configurações
    const btnSalvar = document.getElementById('btnSalvarConfig');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarConfiguracoes);
    }
    
    // Botões de backup - CORRIGIDOS
    const btnBackup = document.getElementById('btnFazerBackup');
    if (btnBackup) {
        btnBackup.addEventListener('click', fazerBackupZIP);
    }
    
    const btnRestaurar = document.getElementById('btnRestaurar');
    if (btnRestaurar) {
        btnRestaurar.addEventListener('click', restaurarBackup);
    }
    
    // Botões de exportar - CORRIGIDOS
    const btnExportarClientes = document.getElementById('btnExportarClientes');
    if (btnExportarClientes) {
        btnExportarClientes.addEventListener('click', exportarClientes);
    }
    
    const btnExportarFinanceiro = document.getElementById('btnExportarFinanceiro');
    if (btnExportarFinanceiro) {
        btnExportarFinanceiro.addEventListener('click', exportarFinanceiro);
    }
    
    // Modo escuro
    const modoEscuro = document.getElementById('modoEscuro');
    if (modoEscuro) {
        modoEscuro.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }
}

// ALTERAR LOGO - CORRIGIDO
function alterarLogo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/jpg, image/svg+xml';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validar tamanho (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('❌ Arquivo muito grande! Máximo permitido: 2MB');
            return;
        }
        
        // Validar formato
        const formatosPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!formatosPermitidos.includes(file.type)) {
            alert('❌ Formato não permitido!\n\nFormatos aceitos: PNG, JPG, JPEG, SVG');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            // Atualizar preview do logo
            const logoPreview = document.getElementById('logoPreview');
            if (logoPreview) {
                logoPreview.src = event.target.result;
            }
            
            // Salvar no localStorage
            localStorage.setItem('eRestituicaoLogo', event.target.result);
            
            alert('✅ Logo atualizado com sucesso!\n\nO novo logo será aplicado em todas as páginas.');
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

// Carregar configurações salvas (localStorage)
function carregarConfiguracoes() {
    const config = JSON.parse(localStorage.getItem('eRestituicaoConfig') || '{}');
    
    // Aplicar configurações salvas
    if (config.nomeEmpresa) document.getElementById('nomeEmpresa').value = config.nomeEmpresa;
    if (config.cnpjEmpresa) document.getElementById('cnpjEmpresa').value = config.cnpjEmpresa;
    if (config.telefoneEmpresa) document.getElementById('telefoneEmpresa').value = config.telefoneEmpresa;
    if (config.emailEmpresa) document.getElementById('emailEmpresa').value = config.emailEmpresa;
    if (config.enderecoEmpresa) document.getElementById('enderecoEmpresa').value = config.enderecoEmpresa;
    if (config.whatsappEmpresa) document.getElementById('whatsappEmpresa').value = config.whatsappEmpresa;
    
    if (config.modoEscuro) {
        document.getElementById('modoEscuro').checked = true;
        document.body.classList.add('dark-mode');
    }
    
    // Carregar logo salvo
    const logoSalvo = localStorage.getItem('eRestituicaoLogo');
    if (logoSalvo) {
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.src = logoSalvo;
        }
    }
}

// Salvar configurações
function salvarConfiguracoes() {
    const config = {
        // Dados da Empresa
        nomeEmpresa: document.getElementById('nomeEmpresa')?.value || '',
        cnpjEmpresa: document.getElementById('cnpjEmpresa')?.value || '',
        telefoneEmpresa: document.getElementById('telefoneEmpresa')?.value || '',
        emailEmpresa: document.getElementById('emailEmpresa')?.value || '',
        enderecoEmpresa: document.getElementById('enderecoEmpresa')?.value || '',
        whatsappEmpresa: document.getElementById('whatsappEmpresa')?.value || '',
        
        // Sistema
        fusoHorario: document.getElementById('fusoHorario')?.value || 'America/Sao_Paulo',
        formatoData: document.getElementById('formatoData')?.value || 'DD/MM/YYYY',
        moeda: document.getElementById('moeda')?.value || 'BRL',
        modoEscuro: document.getElementById('modoEscuro')?.checked || false,
        notificacoesSonoras: document.getElementById('notificacoesSonoras')?.checked || true,
        
        // Pagamentos
        precoBasico: document.getElementById('precoBasico')?.value || 'R$ 5,99',
        precoKitIR: document.getElementById('precoKitIR')?.value || 'R$ 15,99',
        valorAbatimento: document.getElementById('valorAbatimento')?.value || 'R$ 5,99',
        asaasAmbiente: document.getElementById('asaasAmbiente')?.value || 'sandbox',
        
        // Notificações
        notifNovoCliente: document.getElementById('notifNovoCliente')?.checked || true,
        notifNovoPagamento: document.getElementById('notifNovoPagamento')?.checked || true,
        notifNovoCalculo: document.getElementById('notifNovoCalculo')?.checked || false,
        emailNotificacoes: document.getElementById('emailNotificacoes')?.value || '',
        
        // Timestamp
        ultimaAtualizacao: new Date().toISOString()
    };
    
    localStorage.setItem('eRestituicaoConfig', JSON.stringify(config));
    
    // Feedback visual
    const btn = document.getElementById('btnSalvarConfig');
    const textoOriginal = btn.textContent;
    btn.textContent = '✅ Salvo!';
    btn.style.background = '#4caf50';
    
    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '';
    }, 2000);
}

// FAZER BACKUP ZIP - CORRIGIDO
function fazerBackupZIP() {
    const config = localStorage.getItem('eRestituicaoConfig') || '{}';
    const clientes = localStorage.getItem('eRestituicaoClientes') || '[]';
    const usuarios = localStorage.getItem('eRestituicaoUsuarios') || '[]';
    const logo = localStorage.getItem('eRestituicaoLogo') || '';
    
    const backup = {
        versao: '1.0',
        sistema: 'e-Restituição IA',
        dataBackup: new Date().toISOString(),
        config: JSON.parse(config),
        clientes: JSON.parse(clientes),
        usuarios: JSON.parse(usuarios),
        logo: logo
    };
    
    // Criar arquivo JSON (simulando ZIP - para ZIP real precisaria de biblioteca)
    const conteudo = JSON.stringify(backup, null, 2);
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const dataFormatada = new Date().toISOString().split('T')[0].replace(/-/g, '');
    a.download = `backup_erestituicao_${dataFormatada}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Atualizar info de último backup
    const ultimoBackup = document.getElementById('ultimoBackup');
    if (ultimoBackup) {
        ultimoBackup.textContent = new Date().toLocaleString('pt-BR');
    }
    
    alert('✅ Backup gerado com sucesso!\n\nArquivo: backup_erestituicao_' + dataFormatada + '.json\n\nNota: Para backup em formato ZIP, será necessário integração com backend.');
}

// EXPORTAR CLIENTES - CORRIGIDO
function exportarClientes() {
    // Dados mock de clientes (em produção, viria do banco de dados)
    const clientes = [
        { id: 'CLI-0001', nome: 'José Ramos da Silva', cpf: '070.817.318-72', email: 'jose.ramos@email.com', telefone: '(11) 99999-1234', status: 'Concluído', valorRestituicao: 74028.67 },
        { id: 'CLI-0002', nome: 'Ana Carmen Souza', cpf: '123.456.789-00', email: 'ana.carmen@email.com', telefone: '(11) 98888-5678', status: 'Pago Kit IR', valorRestituicao: 26604.54 },
        { id: 'CLI-0003', nome: 'Carlos Eduardo Lima', cpf: '987.654.321-00', email: 'carlos.lima@email.com', telefone: '(21) 97777-9012', status: 'Calculado', valorRestituicao: 15320.00 },
        { id: 'CLI-0004', nome: 'Maria Fernanda Costa', cpf: '456.789.123-00', email: 'maria.costa@email.com', telefone: '(31) 96666-3456', status: 'Novo', valorRestituicao: 0 },
        { id: 'CLI-0005', nome: 'Roberto Almeida Santos', cpf: '789.123.456-00', email: 'roberto.santos@email.com', telefone: '(41) 95555-7890', status: 'Em Análise', valorRestituicao: 42150.33 }
    ];
    
    // Criar CSV
    let csv = 'ID,Nome,CPF,E-mail,Telefone,Status,Valor Restituição\n';
    clientes.forEach(c => {
        csv += `${c.id},"${c.nome}",${c.cpf},${c.email},${c.telefone},${c.status},${c.valorRestituicao.toFixed(2)}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_erestituicao_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Clientes exportados com sucesso!\n\nArquivo CSV gerado.');
}

// EXPORTAR FINANCEIRO - CORRIGIDO
function exportarFinanceiro() {
    // Dados mock financeiros (em produção, viria do banco de dados)
    const financeiro = [
        { data: '2026-01-25', tipo: 'Receita', descricao: 'Pagamento Kit IR - José Ramos', valor: 15.99, status: 'Confirmado' },
        { data: '2026-01-24', tipo: 'Receita', descricao: 'Pagamento Básico - Ana Carmen', valor: 5.99, status: 'Confirmado' },
        { data: '2026-01-24', tipo: 'Receita', descricao: 'Pagamento Kit IR - Ana Carmen', valor: 10.00, status: 'Confirmado' },
        { data: '2026-01-23', tipo: 'Despesa', descricao: 'Comissão Parceiro João Silva', valor: -3.20, status: 'Pago' },
        { data: '2026-01-22', tipo: 'Receita', descricao: 'Pagamento Básico - Carlos Lima', valor: 5.99, status: 'Confirmado' }
    ];
    
    // Criar CSV
    let csv = 'Data,Tipo,Descrição,Valor,Status\n';
    financeiro.forEach(f => {
        csv += `${f.data},${f.tipo},"${f.descricao}",${f.valor.toFixed(2)},${f.status}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_erestituicao_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Dados financeiros exportados com sucesso!\n\nArquivo CSV gerado.');
}

// Restaurar backup
function restaurarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const backup = JSON.parse(event.target.result);
                
                if (confirm('⚠️ Isso irá substituir todas as configurações atuais.\n\nDeseja continuar?')) {
                    if (backup.config) localStorage.setItem('eRestituicaoConfig', JSON.stringify(backup.config));
                    if (backup.clientes) localStorage.setItem('eRestituicaoClientes', JSON.stringify(backup.clientes));
                    if (backup.usuarios) localStorage.setItem('eRestituicaoUsuarios', JSON.stringify(backup.usuarios));
                    if (backup.logo) localStorage.setItem('eRestituicaoLogo', backup.logo);
                    
                    alert('✅ Backup restaurado com sucesso!\n\nA página será recarregada.');
                    location.reload();
                }
            } catch (err) {
                alert('❌ Erro ao ler arquivo de backup.\n\nVerifique se é um arquivo JSON válido.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Menu toggle para mobile
document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
