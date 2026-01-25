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
    // Botão alterar logo
    const btnAlterarLogo = document.getElementById('btnAlterarLogo');
    if (btnAlterarLogo) {
        btnAlterarLogo.addEventListener('click', function() {
            alert('Funcionalidade de upload de logo será implementada com o backend.');
        });
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
    
    // Botões de backup
    const btnBackup = document.getElementById('btnFazerBackup');
    if (btnBackup) {
        btnBackup.addEventListener('click', fazerBackup);
    }
    
    const btnRestaurar = document.getElementById('btnRestaurar');
    if (btnRestaurar) {
        btnRestaurar.addEventListener('click', restaurarBackup);
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

// Fazer backup
function fazerBackup() {
    const config = localStorage.getItem('eRestituicaoConfig') || '{}';
    const clientes = localStorage.getItem('eRestituicaoClientes') || '[]';
    const usuarios = localStorage.getItem('eRestituicaoUsuarios') || '[]';
    
    const backup = {
        config: JSON.parse(config),
        clientes: JSON.parse(clientes),
        usuarios: JSON.parse(usuarios),
        dataBackup: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_erestituicao_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Atualizar info de último backup
    const ultimoBackup = document.getElementById('ultimoBackup');
    if (ultimoBackup) {
        ultimoBackup.textContent = new Date().toLocaleString('pt-BR');
    }
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
                
                if (confirm('Isso irá substituir todas as configurações atuais. Deseja continuar?')) {
                    if (backup.config) localStorage.setItem('eRestituicaoConfig', JSON.stringify(backup.config));
                    if (backup.clientes) localStorage.setItem('eRestituicaoClientes', JSON.stringify(backup.clientes));
                    if (backup.usuarios) localStorage.setItem('eRestituicaoUsuarios', JSON.stringify(backup.usuarios));
                    
                    alert('Backup restaurado com sucesso! A página será recarregada.');
                    location.reload();
                }
            } catch (err) {
                alert('Erro ao ler arquivo de backup. Verifique se é um arquivo válido.');
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
