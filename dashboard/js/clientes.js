/* ========================================
   CLIENTES - JAVASCRIPT
   ======================================== */

// Contador de IDs (em produção, vem do banco de dados)
let contadorClientes = 5;
let documentosParaUpload = [];
let contadorTelefones = 1; // Começa com 1 telefone já existente

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

// Dados de exemplo
let CLIENTES = [
    {
        id: 'CLI-0001',
        nome: 'José Ramos da Silva',
        cpf: '070.817.318-72',
        email: 'jose.ramos@email.com',
        telefones: [
            { numero: '(11) 99999-1234', tipo: 'proprio', nomeResponsavel: '' }
        ],
        dataNascimento: '1975-05-15',
        dataInclusao: '2026-01-20 09:30:15',
        casos: [
            {
                casoId: 'CLI-0001-0001234',
                numeroProcesso: '0001234-56.2020.5.02.0001',
                status: 'concluido',
                valorRestituicao: 74028.67,
                dataCalculo: '2026-01-25'
            }
        ],
        tipo: 'externo',
        indicadoPor: null, // Captação direta
        parceiroId: null
    },
    {
        id: 'CLI-0002',
        nome: 'Ana Carmen Souza',
        cpf: '123.456.789-00',
        email: 'ana.carmen@email.com',
        telefones: [
            { numero: '(11) 98888-5678', tipo: 'proprio', nomeResponsavel: '' }
        ],
        dataNascimento: '1982-08-22',
        dataInclusao: '2026-01-21 14:22:08',
        casos: [
            {
                casoId: 'CLI-0002-0007890',
                numeroProcesso: '0007890-12.2021.5.02.0002',
                status: 'pago_kit',
                valorRestituicao: 26604.54,
                dataCalculo: '2026-01-24'
            }
        ],
        tipo: 'externo',
        indicadoPor: 3, // Indicado por João Silva (parceiro)
        parceiroId: null
    },
    {
        id: 'CLI-0003',
        nome: 'Carlos Eduardo Lima',
        cpf: '987.654.321-00',
        email: 'carlos.lima@email.com',
        telefones: [
            { numero: '(21) 97777-9012', tipo: 'proprio', nomeResponsavel: '' }
        ],
        dataNascimento: '1990-03-10',
        dataInclusao: '2026-01-22 10:45:33',
        casos: [
            {
                casoId: 'CLI-0003-0005555',
                numeroProcesso: '0005555-33.2022.5.02.0003',
                status: 'calculado',
                valorRestituicao: 15320.00,
                dataCalculo: '2026-01-25'
            }
        ],
        tipo: 'interno',
        parceiroId: 3
    },
    {
        id: 'CLI-0004',
        nome: 'Maria Fernanda Costa',
        cpf: '456.789.123-00',
        email: 'maria.costa@email.com',
        telefones: [
            { numero: '(31) 96666-3456', tipo: 'proprio', nomeResponsavel: '' },
            { numero: '(31) 98765-4321', tipo: 'outro', nomeResponsavel: 'João (Filho)' }
        ],
        dataNascimento: '1988-11-30',
        dataInclusao: '2026-01-23 16:18:42',
        casos: [],
        tipo: 'externo',
        indicadoPor: 4, // Indicado por Ana Souza (parceiro)
        parceiroId: null
    },
    {
        id: 'CLI-0004',
        nome: 'Roberto Almeida Santos',
        cpf: '789.123.456-00',
        email: 'roberto.santos@email.com',
        telefones: [
            { numero: '(41) 95555-7890', tipo: 'proprio', nomeResponsavel: '' }
        ],
        dataNascimento: '1978-07-05',
        dataInclusao: '2026-01-24 08:55:19',
        casos: [
            {
                casoId: 'CLI-0005-0009999',
                numeroProcesso: '0009999-88.2023.5.02.0004',
                status: 'analise',
                valorRestituicao: 42150.33,
                dataCalculo: '2026-01-23'
            }
        ],
        tipo: 'interno',
        parceiroId: 3
    }
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!auth.verificarAcesso()) {
        return;
    }

    // Configurar interface baseada no nível de acesso
    configurarInterface();
    
    // Carregar clientes
    carregarClientes();
    
    // Configurar tabs
    configurarTabs();
    
    // Configurar upload
    configurarUpload();
    
    // Configurar máscaras
    configurarMascaras();
    
    // Configurar filtros
    configurarFiltros();
    
    // Configurar telefones dinâmicos
    configurarTelefonesDinamicos();
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
    
    // Ocultar seções do menu
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
    
    // Parceiro não pode calcular, ocultar botão "Salvar e Calcular"
    if (!auth.temPermissao('realizarCalculos')) {
        const btnCalcular = document.getElementById('btnSalvarCalcular');
        if (btnCalcular) btnCalcular.style.display = 'none';
        
        const navCalculos = document.getElementById('navCalculos');
        if (navCalculos) navCalculos.style.display = 'none';
    }
}

// Variáveis de controle de visualização
let clienteFixado = null;
let mostrandoTodos = false;

// Carregar clientes na tabela
function carregarClientes() {
    const tbody = document.getElementById('tabelaClientes');
    const infoVisualizacao = document.getElementById('infoVisualizacao');
    const btnVerTodos = document.getElementById('btnVerTodos');
    
    // Filtrar clientes baseado no nível de acesso
    let clientes = CLIENTES;
    
    if (auth.getNivel() === 'parceiro') {
        const usuario = auth.getUsuario();
        clientes = clientes.filter(c => c.parceiroId === usuario.id);
    }
    
    // Aplicar filtro de status
    const filtroStatus = document.getElementById('filtroStatus')?.value || '';
    
    if (filtroStatus) {
        clientes = clientes.filter(c => {
            if (c.casos.length === 0) return filtroStatus === 'novo';
            return c.casos.some(caso => caso.status === filtroStatus);
        });
    }
    
    // Se tem cliente fixado, mostrar apenas ele
    if (clienteFixado) {
        clientes = clientes.filter(c => c.id === clienteFixado);
        if (infoVisualizacao) {
            infoVisualizacao.innerHTML = `<span class="badge-info">📌 Cliente <strong>fixado</strong> - Clique em "Ver Todos" para voltar</span>`;
        }
        if (btnVerTodos) btnVerTodos.style.display = 'inline-flex';
    } else if (!mostrandoTodos) {
        // Ordenar por data de inclusão (mais recentes primeiro) e pegar os 6 últimos
        clientes.sort((a, b) => {
            const dataA = new Date(a.dataInclusao || '2000-01-01');
            const dataB = new Date(b.dataInclusao || '2000-01-01');
            return dataB - dataA;
        });
        clientes = clientes.slice(0, 6);
        
        if (infoVisualizacao) {
            infoVisualizacao.innerHTML = `<span class="badge-info">📊 Mostrando os <strong>6 últimos clientes</strong> cadastrados</span>`;
        }
        if (btnVerTodos) btnVerTodos.style.display = 'none';
    } else {
        // Ordenar alfabeticamente por nome quando mostrar todos
        clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        
        if (infoVisualizacao) {
            infoVisualizacao.innerHTML = `<span class="badge-info">📊 Mostrando <strong>todos os ${clientes.length} clientes</strong> em ordem alfabética</span>`;
        }
        if (btnVerTodos) btnVerTodos.style.display = 'inline-flex';
    }
    
    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--gray-600);">
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => {
        // Pegar o caso mais recente ou status "novo"
        let status = { texto: '🆕 Novo', classe: 'novo' };
        let valorRestituicao = 0;
        let dataCalculo = '-';
        let casoId = '-';
        
        if (cliente.casos.length > 0) {
            const casoRecente = cliente.casos[cliente.casos.length - 1];
            status = STATUS_LABELS[casoRecente.status] || status;
            valorRestituicao = casoRecente.valorRestituicao;
            dataCalculo = new Date(casoRecente.dataCalculo).toLocaleDateString('pt-BR');
            casoId = casoRecente.casoId;
        }
        
        const podeEditar = auth.temPermissao('crmAlterarStatus');
        
        // Pegar telefone principal (primeiro da lista)
        const telefonePrincipal = cliente.telefones && cliente.telefones.length > 0 
            ? cliente.telefones[0].numero 
            : (cliente.telefone || '-');
        
        // Verificar se é o cliente fixado
        const isFixado = clienteFixado === cliente.id;
        
        return `
            <tr class="${isFixado ? 'cliente-fixado' : ''}">
                <td>
                    <div>
                        <span class="cliente-nome-destaque" onclick="fixarCliente('${cliente.id}')" title="Clique para fixar este cliente">${cliente.nome}</span>
                        <div><span class="cliente-id">${cliente.id}</span></div>
                        ${casoId !== '-' ? `<div><span class="caso-id">${casoId}</span></div>` : ''}
                    </div>
                </td>
                <td>${cliente.cpf}</td>
                <td>${cliente.email}</td>
                <td>${telefonePrincipal}</td>
                <td><span class="status-badge ${status.classe}">${status.texto}</span></td>
                <td>${valorRestituicao > 0 ? formatarMoeda(valorRestituicao) : '-'}</td>
                <td>${dataCalculo}</td>
                <td><small>${cliente.dataInclusao || '-'}</small></td>
                <td>
                    <div class="btn-group-acoes">
                        <button class="btn btn-secondary btn-sm btn-icon" onclick="verCliente('${cliente.id}')" title="Ver detalhes">
                            👁️
                        </button>
                        ${podeEditar ? `
                            <button class="btn btn-primary btn-sm btn-icon" onclick="editarCliente('${cliente.id}')" title="Editar">
                                ✏️
                            </button>
                        ` : ''}
                        ${cliente.casos.length > 0 ? `
                            <button class="btn btn-info btn-sm btn-icon" onclick="verPDFs('${cliente.id}')" title="Ver/Imprimir PDFs">
                                📄
                            </button>
                            <button class="btn btn-success btn-sm btn-icon" onclick="enviarPDFs('${cliente.id}')" title="Enviar ao Cliente">
                                📧
                            </button>
                        ` : ''}
                        ${cliente.casos.length > 1 ? `
                            <button class="btn btn-secondary btn-sm btn-icon" onclick="verCasos('${cliente.id}')" title="Ver todos os casos (${cliente.casos.length})">
                                📋 ${cliente.casos.length}
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Configurar tabs
function configurarTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Remover active de todas as tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Ativar tab clicada
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
}

// Ir para próxima aba
function proximaAba(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    const tabContent = document.getElementById('tab-' + tabId);
    tabContent.classList.add('active');
    
    // Scroll para o topo do modal/conteúdo
    const modalBody = tabContent.closest('.modal-body');
    if (modalBody) {
        modalBody.scrollTop = 0;
    }
    
    // Focar no primeiro campo da nova aba
    setTimeout(() => {
        const primeiroCampo = tabContent.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
        if (primeiroCampo) {
            primeiroCampo.focus();
        }
    }, 100);
}

// Configurar upload de documentos
function configurarUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const inputDocumentos = document.getElementById('inputDocumentos');
    
    if (!uploadArea || !inputDocumentos) return;
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
        adicionarDocumentos(files);
    });
    
    // Input file
    inputDocumentos.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        adicionarDocumentos(files);
    });
}

// Adicionar documentos à lista
function adicionarDocumentos(files) {
    const lista = document.getElementById('listaDocumentos');
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`O arquivo ${file.name} excede o limite de 10MB.`);
            return;
        }
        
        documentosParaUpload.push(file);
        
        const div = document.createElement('div');
        div.className = 'documento-item';
        div.innerHTML = `
            <div class="documento-info">
                <span class="documento-icon">📄</span>
                <div>
                    <div class="documento-nome">${file.name}</div>
                    <div class="documento-tamanho">${formatarTamanho(file.size)}</div>
                </div>
            </div>
            <button class="btn btn-danger btn-sm btn-icon" onclick="removerDocumento(this, '${file.name}')" title="Remover">
                🗑️
            </button>
        `;
        lista.appendChild(div);
    });
}

// Remover documento
function removerDocumento(btn, fileName) {
    documentosParaUpload = documentosParaUpload.filter(f => f.name !== fileName);
    btn.closest('.documento-item').remove();
}

// ========================================
// MÁSCARAS DE INPUT
// ========================================

// Máscara para Telefone: (XX) XXXXX-XXXX
function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (value.length > 11) value = value.slice(0, 11);
        
        // Formatar: (XX) XXXXX-XXXX
        if (value.length > 0) {
            value = '(' + value;
        }
        if (value.length > 3) {
            value = value.slice(0, 3) + ') ' + value.slice(3);
        }
        if (value.length > 10) {
            value = value.slice(0, 10) + '-' + value.slice(10);
        }
        
        e.target.value = value;
    });
}

// Máscara para CEP: XXXXX-XXX
function aplicarMascaraCEP(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (value.length > 8) value = value.slice(0, 8);
        
        // Formatar: XXXXX-XXX
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5);
        }
        
        e.target.value = value;
    });
    
    // Buscar endereço pelo CEP
    input.addEventListener('blur', function(e) {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            buscarEnderecoPorCEP(cep);
        }
    });
}

// Buscar endereço pelo CEP (ViaCEP API)
async function buscarEnderecoPorCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('logradouro').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('uf').value = data.uf || '';
            
            // Focar no campo número após preencher
            document.getElementById('numero').focus();
        }
    } catch (error) {
        console.log('Erro ao buscar CEP:', error);
    }
}

// Configurar máscaras
function configurarMascaras() {
    // CPF: 000.000.000-00
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // CEP: XXXXX-XXX
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        aplicarMascaraCEP(cepInput);
    }
    
    // Telefone inicial
    const telefoneInicial = document.querySelector('.input-telefone');
    if (telefoneInicial) {
        aplicarMascaraTelefone(telefoneInicial);
    }
    
    // CNPJ: 00.000.000/0000-00
    const cnpjInput = document.getElementById('cnpjReclamada');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 14) value = value.slice(0, 14);
            value = value.replace(/(\d{2})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1/$2');
            value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Valores monetários
    document.querySelectorAll('.input-moeda').forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value === '') {
                e.target.value = '';
                return;
            }
            value = (parseInt(value) / 100).toFixed(2);
            value = value.replace('.', ',');
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            e.target.value = 'R$ ' + value;
        });
    });
}

// Configurar filtros
function configurarFiltros() {
    const buscaInput = document.getElementById('buscaCliente');
    const filtroSelect = document.getElementById('filtroStatus');
    const buscaResultados = document.getElementById('buscaResultados');
    const btnLimpar = document.getElementById('btnLimparBusca');
    
    if (buscaInput && buscaResultados) {
        // Busca ao digitar - mostra linha completa
        buscaInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase().trim();
            
            // Mostrar/ocultar botão limpar
            if (btnLimpar) {
                btnLimpar.style.display = termo.length > 0 ? 'flex' : 'none';
            }
            
            if (termo.length < 1) {
                buscaResultados.classList.remove('show');
                return;
            }
            
            // Filtrar clientes que correspondem ao termo
            let clientesFiltrados = CLIENTES.filter(c => 
                c.nome.toLowerCase().includes(termo) || 
                c.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
            );
            
            // Ordenar alfabeticamente
            clientesFiltrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            
            if (clientesFiltrados.length === 0) {
                buscaResultados.innerHTML = '<div class="busca-sem-resultados">🔍 Nenhum cliente encontrado para "' + termo + '"</div>';
                buscaResultados.classList.add('show');
                return;
            }
            
            // Gerar HTML com cabeçalho e linhas completas
            let html = `
                <div class="busca-resultado-header">
                    <span>👤 Nome</span>
                    <span>🆔 CPF</span>
                    <span>📧 E-mail</span>
                    <span>📞 Telefone</span>
                    <span>📊 Status</span>
                    <span>💰 Valor</span>
                    <span>📅 Cálculo</span>
                    <span>🗓️ Inclusão</span>
                    <span>⚙️ Ações</span>
                </div>
            `;
            
            clientesFiltrados.forEach(cliente => {
                const ultimoCaso = cliente.casos && cliente.casos.length > 0 
                    ? cliente.casos[cliente.casos.length - 1] 
                    : null;
                
                const status = ultimoCaso 
                    ? STATUS_LABELS[ultimoCaso.status]?.texto || '🆕 Novo'
                    : '🆕 Novo';
                
                const statusClasse = ultimoCaso 
                    ? STATUS_LABELS[ultimoCaso.status]?.classe || 'novo'
                    : 'novo';
                
                const valorRestituicao = ultimoCaso && ultimoCaso.valorRestituicao 
                    ? formatarMoeda(ultimoCaso.valorRestituicao) 
                    : '-';
                
                const dataCalculo = ultimoCaso && ultimoCaso.dataCalculo 
                    ? formatarData(ultimoCaso.dataCalculo) 
                    : '-';
                
                const telefone = cliente.telefones && cliente.telefones.length > 0 
                    ? cliente.telefones[0].numero 
                    : '-';
                
                const dataInclusao = cliente.dataInclusao 
                    ? cliente.dataInclusao.split(' ')[0].split('-').reverse().join('/') 
                    : '-';
                
                html += `
                    <div class="busca-resultado-item" onclick="selecionarClienteBusca('${cliente.id}')">
                        <span class="busca-resultado-nome">${cliente.nome}</span>
                        <span class="busca-resultado-cpf">${cliente.cpf}</span>
                        <span class="busca-resultado-email">${cliente.email || '-'}</span>
                        <span class="busca-resultado-telefone">${telefone}</span>
                        <span class="busca-resultado-status"><span class="status-badge status-${statusClasse}">${status}</span></span>
                        <span class="busca-resultado-valor">${valorRestituicao}</span>
                        <span class="busca-resultado-data">${dataCalculo}</span>
                        <span class="busca-resultado-data">${dataInclusao}</span>
                        <span class="busca-resultado-acoes">
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); verCliente('${cliente.id}')" title="Ver detalhes">👁️</button>
                            <button class="btn btn-sm btn-warning" onclick="event.stopPropagation(); editarCliente('${cliente.id}')" title="Editar">✏️</button>
                            <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); abrirKitIR('${cliente.id}')" title="Kit IR">📦</button>
                        </span>
                    </div>
                `;
            });
            
            buscaResultados.innerHTML = html;
            buscaResultados.classList.add('show');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(e) {
            const container = document.querySelector('.busca-clientes-container');
            if (container && !container.contains(e.target)) {
                buscaResultados.classList.remove('show');
            }
        });
        
        // Navegação por teclado
        buscaInput.addEventListener('keydown', function(e) {
            const items = buscaResultados.querySelectorAll('.busca-resultado-item');
            const selected = buscaResultados.querySelector('.busca-resultado-item.selected');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!selected && items.length > 0) {
                    items[0].classList.add('selected');
                    items[0].scrollIntoView({ block: 'nearest' });
                } else if (selected && selected.nextElementSibling && selected.nextElementSibling.classList.contains('busca-resultado-item')) {
                    selected.classList.remove('selected');
                    selected.nextElementSibling.classList.add('selected');
                    selected.nextElementSibling.scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selected && selected.previousElementSibling && selected.previousElementSibling.classList.contains('busca-resultado-item')) {
                    selected.classList.remove('selected');
                    selected.previousElementSibling.classList.add('selected');
                    selected.previousElementSibling.scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selected) {
                    selected.click();
                }
            } else if (e.key === 'Escape') {
                buscaResultados.classList.remove('show');
                buscaInput.blur();
            }
        });
    }
    
    if (filtroSelect) {
        filtroSelect.addEventListener('change', function() {
            // Ao mudar filtro de status, limpar fixação
            clienteFixado = null;
            mostrandoTodos = true;
            carregarClientes();
        });
    }
}

// Selecionar cliente da busca
function selecionarClienteBusca(clienteId) {
    const buscaInput = document.getElementById('buscaCliente');
    const buscaResultados = document.getElementById('buscaResultados');
    const btnLimpar = document.getElementById('btnLimparBusca');
    const cliente = CLIENTES.find(c => c.id === clienteId);
    
    if (cliente) {
        buscaInput.value = cliente.nome;
        buscaResultados.classList.remove('show');
        
        // Fixar o cliente selecionado
        fixarCliente(clienteId);
    }
}

// Limpar busca
function limparBusca() {
    const buscaInput = document.getElementById('buscaCliente');
    const buscaResultados = document.getElementById('buscaResultados');
    const btnLimpar = document.getElementById('btnLimparBusca');
    
    if (buscaInput) buscaInput.value = '';
    if (buscaResultados) buscaResultados.classList.remove('show');
    if (btnLimpar) btnLimpar.style.display = 'none';
    
    // Voltar para os últimos 6
    clienteFixado = null;
    mostrandoTodos = false;
    carregarClientes();
}

// Abrir Kit IR para o cliente
function abrirKitIR(clienteId) {
    // Redirecionar para a página do Kit IR com o cliente selecionado
    window.location.href = `kit-ir.html?cliente=${clienteId}`;
}



// Fixar cliente na visualização
function fixarCliente(clienteId) {
    clienteFixado = clienteId;
    mostrandoTodos = false;
    carregarClientes();
    
    // Scroll para a tabela
    const tabela = document.querySelector('.table-container');
    if (tabela) {
        tabela.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Mostrar todos os clientes
function mostrarTodosClientes() {
    const buscaInput = document.getElementById('buscaCliente');
    if (buscaInput) buscaInput.value = '';
    
    clienteFixado = null;
    mostrandoTodos = !mostrandoTodos; // Toggle entre todos e últimos 6
    carregarClientes();
}

// ========================================
// TELEFONES DINÂMICOS (ARRAY)
// ========================================

function configurarTelefonesDinamicos() {
    // Configurar o primeiro telefone
    const primeiroSelect = document.querySelector('.select-tipo-telefone');
    if (primeiroSelect) {
        primeiroSelect.addEventListener('change', function() {
            toggleNomeResponsavel(this);
        });
    }
}

function toggleNomeResponsavel(selectElement) {
    const telefoneItem = selectElement.closest('.telefone-item');
    const nomeResponsavelDiv = telefoneItem.querySelector('.nome-responsavel');
    
    if (selectElement.value === 'outro') {
        nomeResponsavelDiv.style.display = 'block';
    } else {
        nomeResponsavelDiv.style.display = 'none';
        // Limpar o campo quando esconder
        const inputNome = nomeResponsavelDiv.querySelector('input');
        if (inputNome) inputNome.value = '';
    }
}

function adicionarTelefone() {
    const container = document.getElementById('containerTelefones');
    const index = contadorTelefones;
    contadorTelefones++;
    
    const div = document.createElement('div');
    div.className = 'telefone-item';
    div.dataset.telefoneIndex = index;
    div.innerHTML = `
        <div class="form-row">
            <div class="form-group" style="flex: 1;">
                <label>Telefone</label>
                <input type="text" name="telefones[${index}][numero]" placeholder="(00) 00000-0000" maxlength="15" class="input-telefone">
            </div>
            <div class="form-group" style="max-width: 130px;">
                <label>Tipo</label>
                <select name="telefones[${index}][tipo]" class="select-tipo-telefone" onchange="toggleNomeResponsavel(this)">
                    <option value="proprio">Próprio</option>
                    <option value="outro">Outro</option>
                </select>
            </div>
            <div class="form-group nome-responsavel" style="flex: 1; display: none;">
                <label>Nome do Responsável</label>
                <input type="text" name="telefones[${index}][nomeResponsavel]" placeholder="Nome de quem atende">
            </div>
            <button type="button" class="btn btn-icon btn-danger" onclick="removerTelefone(this)" title="Remover telefone" style="align-self: flex-end; margin-bottom: 5px;">
                🗑️
            </button>
        </div>
    `;
    
    container.appendChild(div);
    
    // Aplicar máscara ao novo input de telefone
    const novoInputTelefone = div.querySelector('.input-telefone');
    aplicarMascaraTelefone(novoInputTelefone);
    
    // Focar no novo campo
    novoInputTelefone.focus();
}

function removerTelefone(btn) {
    const telefoneItem = btn.closest('.telefone-item');
    // Não permitir remover se for o único telefone
    const totalTelefones = document.querySelectorAll('.telefone-item').length;
    if (totalTelefones <= 1) {
        alert('É necessário manter pelo menos um telefone de contato.');
        return;
    }
    telefoneItem.remove();
}

// Coletar todos os telefones do formulário
function coletarTelefones() {
    const telefones = [];
    document.querySelectorAll('.telefone-item').forEach(item => {
        const numero = item.querySelector('.input-telefone').value.trim();
        const tipo = item.querySelector('.select-tipo-telefone').value;
        const nomeResponsavelInput = item.querySelector('.nome-responsavel input');
        const nomeResponsavel = nomeResponsavelInput ? nomeResponsavelInput.value.trim() : '';
        
        if (numero) {
            telefones.push({
                numero: numero,
                tipo: tipo,
                nomeResponsavel: tipo === 'outro' ? nomeResponsavel : ''
            });
        }
    });
    return telefones;
}

// Função para toggle de senha
function toggleSenha(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Função para abrir modal de novo cliente
// Lista de parceiros/vendedores para o campo "Indicado por"
let PARCEIROS_VENDEDORES = [
    { id: 3, nome: 'João Silva', tipo: 'parceiro', codigo: 'JOAO2026' },
    { id: 4, nome: 'Ana Souza', tipo: 'parceiro', codigo: 'ANA2026' },
    { id: 2, nome: 'Maria Operadora', tipo: 'operador', codigo: 'MARIA2026' },
    { id: 6, nome: 'Pedro Novo', tipo: 'parceiro', codigo: 'PEDRO2026' }
];

// Função para carregar parceiros/vendedores no select
function carregarParceirosVendedores() {
    const select = document.getElementById('indicadoPor');
    if (!select) return;
    
    // Limpar opções anteriores (manter apenas a primeira)
    select.innerHTML = '<option value="">Nenhum (Captação Direta)</option>';
    
    // Ordenar alfabeticamente
    const parceirosOrdenados = [...PARCEIROS_VENDEDORES].sort((a, b) => a.nome.localeCompare(b.nome));
    
    // Adicionar opções
    parceirosOrdenados.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nome} (${p.codigo}) - ${p.tipo === 'parceiro' ? 'Parceiro' : 'Operador'}`;
        select.appendChild(option);
    });
}

function abrirModalNovoCliente() {
    document.getElementById('modalNovoCliente').classList.add('active');
    document.getElementById('formNovoCliente').reset();
    documentosParaUpload = [];
    document.getElementById('listaDocumentos').innerHTML = '';
    
    // Carregar lista de parceiros/vendedores
    carregarParceirosVendedores();
    
    // Resetar telefones para apenas 1
    const containerTelefones = document.getElementById('containerTelefones');
    containerTelefones.innerHTML = `
        <div class="telefone-item" data-telefone-index="0">
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label>Telefone *</label>
                    <input type="text" name="telefones[0][numero]" placeholder="(00) 00000-0000" maxlength="15" class="input-telefone" required>
                </div>
                <div class="form-group" style="max-width: 130px;">
                    <label>Tipo</label>
                    <select name="telefones[0][tipo]" class="select-tipo-telefone" onchange="toggleNomeResponsavel(this)">
                        <option value="proprio">Próprio</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="form-group nome-responsavel" style="flex: 1; display: none;">
                    <label>Nome do Responsável</label>
                    <input type="text" name="telefones[0][nomeResponsavel]" placeholder="Nome de quem atende">
                </div>
            </div>
        </div>
    `;
    contadorTelefones = 1;
    
    // Aplicar máscara ao telefone inicial
    const telefoneInicial = containerTelefones.querySelector('.input-telefone');
    if (telefoneInicial) {
        aplicarMascaraTelefone(telefoneInicial);
    }
    
    proximaAba('dados-pessoais');
    
    // Focar no primeiro campo
    setTimeout(() => {
        document.getElementById('nome').focus();
    }, 100);
}

// Fechar modal
function fecharModal() {
    document.getElementById('modalNovoCliente').classList.remove('active');
}

// Adicionar alvará
function adicionarAlvara() {
    const container = document.getElementById('containerAlvaras');
    const div = document.createElement('div');
    div.className = 'form-row alvara-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Valor do Alvará</label>
            <input type="text" name="alvaraValor[]" placeholder="R$ 0,00" class="input-moeda">
        </div>
        <div class="form-group">
            <label>Data do Alvará</label>
            <input type="date" name="alvaraData[]">
        </div>
        <button type="button" class="btn btn-icon btn-danger" onclick="removerAlvara(this)" title="Remover">🗑️</button>
    `;
    container.appendChild(div);
    
    // Aplicar máscara ao novo input
    const moneyInput = div.querySelector('.input-moeda');
    moneyInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        e.target.value = 'R$ ' + value;
    });
    
    // Aplicar lógica de TAB
    aplicarTabInteligente(div, 'alvara');
    
    // Focar no campo valor
    moneyInput.focus();
}

// Remover alvará
function removerAlvara(btn) {
    btn.closest('.alvara-item').remove();
}

// Adicionar DARF
function adicionarDarf() {
    const container = document.getElementById('containerDarfs');
    const div = document.createElement('div');
    div.className = 'form-row darf-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Valor do DARF</label>
            <input type="text" name="darfValor[]" placeholder="R$ 0,00" class="input-moeda">
        </div>
        <div class="form-group">
            <label>Data do DARF</label>
            <input type="date" name="darfData[]">
        </div>
        <button type="button" class="btn btn-icon btn-danger" onclick="removerDarf(this)" title="Remover">🗑️</button>
    `;
    container.appendChild(div);
    
    // Aplicar máscara ao novo input
    const moneyInput = div.querySelector('.input-moeda');
    moneyInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        e.target.value = 'R$ ' + value;
    });
    
    // Aplicar lógica de TAB
    aplicarTabInteligente(div, 'darf');
    
    // Focar no campo valor
    moneyInput.focus();
}

// Remover DARF
function removerDarf(btn) {
    btn.closest('.darf-item').remove();
}

// Adicionar Honorário
function adicionarHonorario() {
    const container = document.getElementById('containerHonorarios');
    const div = document.createElement('div');
    div.className = 'form-row honorario-item';
    
    // Gerar options de anos
    let yearOptions = '<option value="">Selecione</option>';
    for (let year = 2015; year <= 2026; year++) {
        yearOptions += `<option value="${year}">${year}</option>`;
    }
    
    div.innerHTML = `
        <div class="form-group">
            <label>Valor do Honorário</label>
            <input type="text" name="honorarioValor[]" placeholder="R$ 0,00" class="input-moeda">
        </div>
        <div class="form-group">
            <label>Ano do Honorário</label>
            <select name="honorarioAno[]">
                ${yearOptions}
            </select>
        </div>
        <button type="button" class="btn btn-icon btn-danger" onclick="removerHonorario(this)" title="Remover">🗑️</button>
    `;
    container.appendChild(div);
    
    // Aplicar máscara ao novo input
    const moneyInput = div.querySelector('.input-moeda');
    moneyInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\ d{3})+(?!\d))/g, '.');
        e.target.value = 'R$ ' + value;
    });
    
    // Aplicar lógica de TAB
    aplicarTabInteligente(div, 'honorario');
    
    // Focar no campo valor
    moneyInput.focus();
}

// Remover Honorário
function removerHonorario(btn) {
    btn.closest('.honorario-item').remove();
}

// ========================================
// LÓGICA DE TAB INTELIGENTE
// ========================================

/**
 * Aplica lógica de TAB inteligente nos campos dinâmicos:
 * - Ao preencher Valor + Data/Ano e pressionar TAB → Abre nova linha
 * - Se TAB em linha vazia → Exclui linha e vai para próximo item
 */
function aplicarTabInteligente(itemElement, tipo) {
    const ultimoCampo = tipo === 'honorario' 
        ? itemElement.querySelector('select')
        : itemElement.querySelector('input[type="date"]');
    
    if (!ultimoCampo) return;
    
    ultimoCampo.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            
            const valorInput = itemElement.querySelector('.input-moeda');
            const valor = valorInput ? valorInput.value.replace(/\D/g, '') : '';
            const dataOuAno = ultimoCampo.value;
            
            // Verifica se a linha está preenchida
            if (valor && dataOuAno) {
                // Linha preenchida: adiciona nova linha
                if (tipo === 'alvara') {
                    adicionarAlvara();
                } else if (tipo === 'darf') {
                    adicionarDarf();
                } else if (tipo === 'honorario') {
                    adicionarHonorario();
                }
            } else if (!valor && !dataOuAno) {
                // Linha vazia: remove e vai para próximo item
                const container = itemElement.parentElement;
                const items = container.querySelectorAll(`.${tipo}-item`);
                
                if (items.length > 1) {
                    itemElement.remove();
                }
                
                // Ir para próximo item
                irParaProximoItem(tipo);
            } else {
                // Parcialmente preenchido: vai para próximo item sem excluir
                irParaProximoItem(tipo);
            }
        }
    });
}

/**
 * Move o foco para o próximo item na sequência:
 * Alvarás → DARFs → Honorários → Botão Próximo
 */
function irParaProximoItem(tipoAtual) {
    let proximoElemento = null;
    
    if (tipoAtual === 'alvara') {
        // Vai para primeiro DARF
        const primeiroDarf = document.querySelector('#containerDarfs .darf-item .input-moeda');
        proximoElemento = primeiroDarf;
    } else if (tipoAtual === 'darf') {
        // Vai para primeiro Honorário
        const primeiroHonorario = document.querySelector('#containerHonorarios .honorario-item .input-moeda');
        proximoElemento = primeiroHonorario;
    } else if (tipoAtual === 'honorario') {
        // Vai para botão Próximo
        const btnProximo = document.querySelector('#tab-dados-processo .btn-secondary');
        proximoElemento = btnProximo;
    }
    
    if (proximoElemento) {
        proximoElemento.focus();
    }
}

/**
 * Inicializa a lógica de TAB em todos os itens existentes
 */
function inicializarTabInteligente() {
    // Alvarás
    document.querySelectorAll('.alvara-item').forEach(item => {
        aplicarTabInteligente(item, 'alvara');
    });
    
    // DARFs
    document.querySelectorAll('.darf-item').forEach(item => {
        aplicarTabInteligente(item, 'darf');
    });
    
    // Honorários
    document.querySelectorAll('.honorario-item').forEach(item => {
        aplicarTabInteligente(item, 'honorario');
    });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que os elementos estão carregados
    setTimeout(inicializarTabInteligente, 500);
});

// Gerar ID do cliente
function gerarIdCliente() {
    contadorClientes++;
    return 'CLI-' + String(contadorClientes).padStart(4, '0');
}

// Gerar ID do caso
function gerarIdCaso(clienteId, numeroProcesso) {
    if (!numeroProcesso) return null;
    const primeiros7 = numeroProcesso.replace(/\D/g, '').slice(0, 7).padStart(7, '0');
    return clienteId + '-' + primeiros7;
}

// Salvar cliente (apenas dados)
function salvarCliente() {
    // Validar campos obrigatórios
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const telefones = coletarTelefones();
    
    if (!nome || !cpf || !email || !dataNascimento) {
        alert('Por favor, preencha todos os campos obrigatórios na aba "Dados Pessoais".');
        proximaAba('dados-pessoais');
        return;
    }
    
    if (telefones.length === 0 || !telefones[0].numero) {
        alert('Por favor, informe pelo menos um telefone de contato.');
        proximaAba('dados-pessoais');
        return;
    }
    
    // Gerar ID
    const clienteId = gerarIdCliente();
    
    // Criar objeto do cliente
    const novoCliente = {
        id: clienteId,
        nome: nome,
        cpf: cpf,
        email: email,
        telefones: telefones,
        dataNascimento: dataNascimento,
        profissao: document.getElementById('profissao').value.trim(),
        endereco: {
            cep: document.getElementById('cep').value.trim(),
            logradouro: document.getElementById('logradouro').value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            uf: document.getElementById('uf').value
        },
        senhaGov: document.getElementById('senhaGov').value, // Em produção: criptografar
        procuracaoEletronica: document.getElementById('procuracaoEletronica').checked,
        casos: [],
        tipo: 'interno',
        indicadoPor: document.getElementById('indicadoPor').value ? parseInt(document.getElementById('indicadoPor').value) : null,
        parceiroId: auth.getNivel() === 'parceiro' ? auth.getUsuario().id : null,
        documentos: documentosParaUpload.map(f => f.name),
        dataInclusao: new Date().toLocaleString('pt-BR').replace(',', '')
    };
    
    // Verificar se tem dados do processo
    const numeroProcesso = document.getElementById('numeroProcesso').value.trim();
    if (numeroProcesso) {
        const casoId = gerarIdCaso(clienteId, numeroProcesso);
        novoCliente.casos.push({
            casoId: casoId,
            numeroProcesso: numeroProcesso,
            vara: document.getElementById('vara').value.trim(),
            comarca: document.getElementById('comarca').value.trim(),
            cnpjReclamada: document.getElementById('cnpjReclamada').value.trim(),
            status: 'novo',
            valorRestituicao: 0,
            dataCalculo: null
        });
    }
    
    // Adicionar à lista
    CLIENTES.push(novoCliente);
    
    // Atualizar tabela
    carregarClientes();
    
    // Fechar modal
    fecharModal();
    
    // Mostrar mensagem de sucesso
    alert(`✅ Cliente cadastrado com sucesso!\n\nID: ${clienteId}`);
}

// Salvar e calcular
function salvarECalcular() {
    // Validar campos obrigatórios
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const telefones = coletarTelefones();
    const numeroProcesso = document.getElementById('numeroProcesso').value.trim();
    
    if (!nome || !cpf || !email || !dataNascimento) {
        alert('Por favor, preencha todos os campos obrigatórios na aba "Dados Pessoais".');
        proximaAba('dados-pessoais');
        return;
    }
    
    if (telefones.length === 0 || !telefones[0].numero) {
        alert('Por favor, informe pelo menos um telefone de contato.');
        proximaAba('dados-pessoais');
        return;
    }
    
    if (!numeroProcesso) {
        alert('Para calcular, é necessário preencher os dados do processo.');
        proximaAba('dados-processo');
        return;
    }
    
    // Gerar ID
    const clienteId = gerarIdCliente();
    const casoId = gerarIdCaso(clienteId, numeroProcesso);
    
    // Criar objeto do cliente
    const novoCliente = {
        id: clienteId,
        nome: nome,
        cpf: cpf,
        email: email,
        telefones: telefones,
        dataNascimento: dataNascimento,
        profissao: document.getElementById('profissao').value.trim(),
        endereco: {
            cep: document.getElementById('cep').value.trim(),
            logradouro: document.getElementById('logradouro').value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            uf: document.getElementById('uf').value
        },
        senhaGov: document.getElementById('senhaGov').value, // Em produção: criptografar
        procuracaoEletronica: document.getElementById('procuracaoEletronica').checked,
        casos: [{
            casoId: casoId,
            numeroProcesso: numeroProcesso,
            vara: document.getElementById('vara').value.trim(),
            comarca: document.getElementById('comarca').value.trim(),
            cnpjReclamada: document.getElementById('cnpjReclamada').value.trim(),
            status: 'calculado',
            valorRestituicao: Math.random() * 50000 + 10000, // Simulação - em produção vem do motor de cálculo
            dataCalculo: new Date().toISOString().split('T')[0]
        }],
        tipo: 'interno',
        parceiroId: auth.getNivel() === 'parceiro' ? auth.getUsuario().id : null,
        documentos: documentosParaUpload.map(f => f.name),
        dataInclusao: new Date().toLocaleString('pt-BR').replace(',', '')
    };
    
    // Adicionar à lista
    CLIENTES.push(novoCliente);
    
    // Atualizar tabela
    carregarClientes();
    
    // Fechar modal
    fecharModal();
    
    // Mostrar mensagem de sucesso
    alert(`✅ Cliente cadastrado e cálculo realizado!\n\nID: ${clienteId}\nCaso: ${casoId}\nValor a Restituir: ${formatarMoeda(novoCliente.casos[0].valorRestituicao)}`);
}

// Ver detalhes do cliente
function verCliente(id) {
    const cliente = CLIENTES.find(c => c.id === id);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    // Formatar telefones para HTML
    let telefonesHtml = '';
    if (cliente.telefones && cliente.telefones.length > 0) {
        telefonesHtml = cliente.telefones.map((t, i) => {
            let str = `<li>${t.numero} <span class="badge badge-secondary">${t.tipo === 'proprio' ? 'Próprio' : 'Outro'}</span>`;
            if (t.tipo === 'outro' && t.nomeResponsavel) {
                str += ` - <em>${t.nomeResponsavel}</em>`;
            }
            str += '</li>';
            return str;
        }).join('');
    } else if (cliente.telefone) {
        telefonesHtml = `<li>${cliente.telefone}</li>`;
    } else {
        telefonesHtml = '<li class="text-muted">Nenhum telefone cadastrado</li>';
    }
    
    // Formatar casos para HTML
    let casosHtml = '';
    if (cliente.casos && cliente.casos.length > 0) {
        casosHtml = cliente.casos.map((caso, i) => {
            const statusInfo = STATUS_LABELS[caso.status] || { texto: caso.status, classe: 'novo' };
            return `
                <div class="caso-item" style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>Caso ${i + 1}: ${caso.casoId}</strong>
                        <span class="status-badge ${statusInfo.classe}">${statusInfo.texto}</span>
                    </div>
                    <p style="margin: 5px 0; font-size: 13px; color: #666;">Processo: ${caso.numeroProcesso}</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Valor:</strong> ${caso.valorRestituicao > 0 ? formatarMoeda(caso.valorRestituicao) : '-'}</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #888;">Data Cálculo: ${caso.dataCalculo ? new Date(caso.dataCalculo).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
            `;
        }).join('');
    } else {
        casosHtml = '<p class="text-muted">⚠️ Nenhum caso cadastrado ainda.</p>';
    }
    
    // Formatar indicação
    let indicacaoHtml = 'Captação direta';
    if (cliente.indicadoPor) {
        // Buscar nome do parceiro
        const parceiros = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const parceiro = parceiros.find(p => p.id === cliente.indicadoPor);
        indicacaoHtml = parceiro ? `Indicado por: <strong>${parceiro.nome}</strong>` : `Indicado por ID: ${cliente.indicadoPor}`;
    }
    
    // Criar modal dinâmico
    const modalHtml = `
        <div class="modal-overlay" id="modalVerCliente" style="display: flex;">
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>📋 Detalhes do Cliente</h3>
                    <button class="btn-close" onclick="document.getElementById('modalVerCliente').remove()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div class="cliente-detalhes-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="info-section">
                            <h4 style="color: #1a7f37; margin-bottom: 15px;">👤 Dados Pessoais</h4>
                            <p><strong>ID:</strong> ${cliente.id}</p>
                            <p><strong>Nome:</strong> ${cliente.nome}</p>
                            <p><strong>CPF:</strong> ${cliente.cpf}</p>
                            <p><strong>E-mail:</strong> ${cliente.email}</p>
                            <p><strong>Data Nascimento:</strong> ${cliente.dataNascimento ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR') : '-'}</p>
                            <p><strong>Data Inclusão:</strong> ${cliente.dataInclusao || '-'}</p>
                            <p><strong>Tipo:</strong> ${cliente.tipo === 'externo' ? '🌐 Externo (via site)' : '🏢 Interno'}</p>
                            <p>${indicacaoHtml}</p>
                        </div>
                        <div class="info-section">
                            <h4 style="color: #1a7f37; margin-bottom: 15px;">📞 Telefones</h4>
                            <ul style="list-style: none; padding: 0;">${telefonesHtml}</ul>
                        </div>
                    </div>
                    <div class="casos-section" style="margin-top: 20px;">
                        <h4 style="color: #1a7f37; margin-bottom: 15px;">📁 Casos (${cliente.casos ? cliente.casos.length : 0})</h4>
                        ${casosHtml}
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; padding: 15px 20px; border-top: 1px solid #eee;">
                    <button class="btn btn-secondary" onclick="document.getElementById('modalVerCliente').remove()">Fechar</button>
                    <button class="btn btn-primary" onclick="document.getElementById('modalVerCliente').remove(); editarCliente('${cliente.id}')">✏️ Editar</button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const modalAnterior = document.getElementById('modalVerCliente');
    if (modalAnterior) modalAnterior.remove();
    
    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Editar cliente
function editarCliente(id) {
    const cliente = CLIENTES.find(c => c.id === id);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    // Preencher formulário de edição
    const telefonePrincipal = cliente.telefones && cliente.telefones.length > 0 
        ? cliente.telefones[0].numero 
        : (cliente.telefone || '');
    
    const modalHtml = `
        <div class="modal-overlay" id="modalEditarCliente" style="display: flex;">
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>✏️ Editar Cliente</h3>
                    <button class="btn-close" onclick="document.getElementById('modalEditarCliente').remove()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <form id="formEditarCliente">
                        <input type="hidden" id="editClienteId" value="${cliente.id}">
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label for="editNome">Nome Completo *</label>
                                <input type="text" id="editNome" class="form-control" value="${cliente.nome}" required>
                            </div>
                            <div class="form-group">
                                <label for="editCpf">CPF *</label>
                                <input type="text" id="editCpf" class="form-control" value="${cliente.cpf}" required>
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label for="editEmail">E-mail *</label>
                                <input type="email" id="editEmail" class="form-control" value="${cliente.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="editTelefone">Telefone Principal</label>
                                <input type="text" id="editTelefone" class="form-control" value="${telefonePrincipal}">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label for="editDataNascimento">Data de Nascimento</label>
                                <input type="date" id="editDataNascimento" class="form-control" value="${cliente.dataNascimento || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editTipo">Tipo</label>
                                <select id="editTipo" class="form-control">
                                    <option value="externo" ${cliente.tipo === 'externo' ? 'selected' : ''}>Externo (via site)</option>
                                    <option value="interno" ${cliente.tipo === 'interno' ? 'selected' : ''}>Interno</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; padding: 15px 20px; border-top: 1px solid #eee;">
                    <button class="btn btn-secondary" onclick="document.getElementById('modalEditarCliente').remove()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarEdicaoCliente()">💾 Salvar Alterações</button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const modalAnterior = document.getElementById('modalEditarCliente');
    if (modalAnterior) modalAnterior.remove();
    
    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Salvar edição do cliente
function salvarEdicaoCliente() {
    const id = document.getElementById('editClienteId').value;
    const cliente = CLIENTES.find(c => c.id === id);
    
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    // Atualizar dados
    cliente.nome = document.getElementById('editNome').value.trim();
    cliente.cpf = document.getElementById('editCpf').value.trim();
    cliente.email = document.getElementById('editEmail').value.trim();
    cliente.dataNascimento = document.getElementById('editDataNascimento').value;
    cliente.tipo = document.getElementById('editTipo').value;
    
    // Atualizar telefone principal
    const novoTelefone = document.getElementById('editTelefone').value.trim();
    if (novoTelefone) {
        if (cliente.telefones && cliente.telefones.length > 0) {
            cliente.telefones[0].numero = novoTelefone;
        } else {
            cliente.telefones = [{ numero: novoTelefone, tipo: 'proprio', nomeResponsavel: '' }];
        }
    }
    
    // Persistir no localStorage
    localStorage.setItem('clientes', JSON.stringify(CLIENTES));
    
    // Fechar modal
    document.getElementById('modalEditarCliente').remove();
    
    // Recarregar tabela
    carregarClientes();
    
    // Feedback
    mostrarNotificacaoClientes('✅ Cliente atualizado com sucesso!', 'success');
}

// Mostrar notificação
function mostrarNotificacaoClientes(mensagem, tipo) {
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
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// Ver todos os casos
function verCasos(id) {
    const cliente = CLIENTES.find(c => c.id === id);
    if (!cliente) return;
    
    let detalhes = `📁 CASOS DO CLIENTE ${cliente.id} - ${cliente.nome}\n\n`;
    
    cliente.casos.forEach((caso, i) => {
        detalhes += `
Caso ${i + 1}: ${caso.casoId}
  Processo: ${caso.numeroProcesso}
  Status: ${STATUS_LABELS[caso.status]?.texto || caso.status}
  Valor: ${caso.valorRestituicao > 0 ? formatarMoeda(caso.valorRestituicao) : '-'}
  Data: ${caso.dataCalculo ? new Date(caso.dataCalculo).toLocaleDateString('pt-BR') : '-'}
----------------------------------------`;
    });
    
    alert(detalhes);
}

// Funções auxiliares
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função de busca chamada diretamente pelo oninput/onkeyup
function buscarClienteInput(valor) {
    const termo = valor.toLowerCase().trim();
    const buscaResultados = document.getElementById('buscaResultados');
    const btnLimpar = document.getElementById('btnLimparBusca');
    
    // Mostrar/ocultar botão limpar
    if (btnLimpar) {
        btnLimpar.style.display = termo.length > 0 ? 'flex' : 'none';
    }
    
    if (termo.length < 1) {
        if (buscaResultados) buscaResultados.classList.remove('show');
        return;
    }
    
    // Filtrar clientes cujo NOME COMEÇA com o termo digitado (não contém, mas inicia)
    let clientesFiltrados = CLIENTES.filter(c => 
        c.nome.toLowerCase().startsWith(termo) || 
        c.cpf.replace(/\D/g, '').startsWith(termo.replace(/\D/g, ''))
    );
    
    // Ordenar alfabeticamente (A → Z)
    clientesFiltrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    if (clientesFiltrados.length === 0) {
        buscaResultados.innerHTML = '<div class="busca-sem-resultados">🔍 Nenhum cliente encontrado para "' + termo + '"</div>';
        buscaResultados.classList.add('show');
        return;
    }
    
    // Gerar HTML com cabeçalho e linhas completas
    let html = `
        <div class="busca-resultado-header">
            <span>👤 Nome</span>
            <span>🆔 CPF</span>
            <span>📧 E-mail</span>
            <span>📞 Telefone</span>
            <span>📊 Status</span>
            <span>💰 Valor</span>
            <span>📅 Cálculo</span>
            <span>🗓️ Inclusão</span>
            <span>⚙️ Ações</span>
        </div>
    `;
    
    clientesFiltrados.forEach(cliente => {
        const ultimoCaso = cliente.casos && cliente.casos.length > 0 
            ? cliente.casos[cliente.casos.length - 1] 
            : null;
        
        const status = ultimoCaso 
            ? STATUS_LABELS[ultimoCaso.status]?.texto || '🆕 Novo'
            : '🆕 Novo';
        
        const statusClasse = ultimoCaso 
            ? STATUS_LABELS[ultimoCaso.status]?.classe || 'novo'
            : 'novo';
        
        const valorRestituicao = ultimoCaso && ultimoCaso.valorRestituicao 
            ? formatarMoeda(ultimoCaso.valorRestituicao) 
            : '-';
        
        const dataCalculo = ultimoCaso && ultimoCaso.dataCalculo 
            ? new Date(ultimoCaso.dataCalculo).toLocaleDateString('pt-BR') 
            : '-';
        
        const telefone = cliente.telefones && cliente.telefones.length > 0 
            ? cliente.telefones[0].numero 
            : '-';
        
        html += `
            <div class="busca-resultado-linha" onclick="selecionarClienteBusca('${cliente.id}')">
                <span class="cliente-nome-busca">${cliente.nome}</span>
                <span>${cliente.cpf}</span>
                <span>${cliente.email}</span>
                <span>${telefone}</span>
                <span class="status-badge ${statusClasse}">${status}</span>
                <span class="valor-restituicao">${valorRestituicao}</span>
                <span>${dataCalculo}</span>
                <span>${cliente.dataInclusao || '-'}</span>
                <span class="acoes-busca">
                    <button class="btn-acao btn-ver" onclick="event.stopPropagation(); verCliente('${cliente.id}')" title="Ver detalhes">👁️</button>
                    <button class="btn-acao btn-editar" onclick="event.stopPropagation(); editarCliente('${cliente.id}')" title="Editar">✏️</button>
                    <button class="btn-acao btn-pdfs" onclick="event.stopPropagation(); verPDFs('${cliente.id}')" title="Ver/Imprimir PDFs">📄</button>
                    <button class="btn-acao btn-enviar" onclick="event.stopPropagation(); enviarAoCliente('${cliente.id}')" title="Enviar ao Cliente">📧</button>
                </span>
            </div>
        `;
    });
    
    buscaResultados.innerHTML = html;
    buscaResultados.classList.add('show');
}

// Exportar funções globais
window.abrirModalNovoCliente = abrirModalNovoCliente;
window.fecharModal = fecharModal;
window.proximaAba = proximaAba;
window.adicionarAlvara = adicionarAlvara;
window.removerAlvara = removerAlvara;
window.adicionarDarf = adicionarDarf;
window.removerDarf = removerDarf;
window.removerDocumento = removerDocumento;
window.salvarCliente = salvarCliente;
window.salvarECalcular = salvarECalcular;
window.verCliente = verCliente;
window.editarCliente = editarCliente;
window.verCasos = verCasos;
window.toggleSenha = toggleSenha;
window.adicionarTelefone = adicionarTelefone;
window.removerTelefone = removerTelefone;
window.toggleNomeResponsavel = toggleNomeResponsavel;
window.selecionarClienteBusca = selecionarClienteBusca;
window.limparBusca = limparBusca;
window.buscarClienteInput = buscarClienteInput;
window.abrirKitIR = abrirKitIR;
window.fixarCliente = fixarCliente;
window.mostrarTodosClientes = mostrarTodosClientes;


// ========================================
// FUNÇÕES DE PDFs - VISUALIZAR E ENVIAR
// ========================================

// Ver PDFs do cliente (Planilha RT e Esclarecimentos)
function verPDFs(clienteId) {
    const cliente = CLIENTES.find(c => c.id === clienteId);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    if (cliente.casos.length === 0) {
        alert('Este cliente ainda não possui cálculos realizados.');
        return;
    }
    
    // Criar modal de PDFs
    const modalHTML = `
        <div class="modal active" id="modalPDFs">
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h2>📄 PDFs do Cliente</h2>
                    <button class="btn-close" onclick="fecharModalPDFs()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="cliente-info-pdf">
                        <strong>${cliente.nome}</strong>
                        <span>CPF: ${cliente.cpf}</span>
                    </div>
                    
                    <div class="pdf-list">
                        ${cliente.casos.map((caso, index) => `
                            <div class="pdf-caso">
                                <h4>📁 Caso: ${caso.casoId}</h4>
                                <p>Processo: ${caso.numeroProcesso}</p>
                                <p>Valor Restituição: ${formatarMoeda(caso.valorRestituicao)}</p>
                                <p>Status: ${STATUS_LABELS[caso.status]?.texto || caso.status}</p>
                                
                                <div class="pdf-buttons">
                                    <button class="btn btn-primary" onclick="visualizarPDF('${clienteId}', ${index}, 'esclarecimentos')">
                                        📄 Esclarecimentos
                                    </button>
                                    <button class="btn btn-primary" onclick="visualizarPDF('${clienteId}', ${index}, 'planilha_rt')">
                                        📊 Planilha RT
                                    </button>
                                    <button class="btn btn-secondary" onclick="imprimirPDFs('${clienteId}', ${index})">
                                        🖨️ Imprimir Todos
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="fecharModalPDFs()">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal existente se houver
    const modalExistente = document.getElementById('modalPDFs');
    if (modalExistente) modalExistente.remove();
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Fechar modal de PDFs
function fecharModalPDFs() {
    const modal = document.getElementById('modalPDFs');
    if (modal) modal.remove();
}

// Visualizar PDF específico
function visualizarPDF(clienteId, casoIndex, tipoPDF) {
    const cliente = CLIENTES.find(c => c.id === clienteId);
    if (!cliente || !cliente.casos[casoIndex]) {
        alert('Dados não encontrados.');
        return;
    }
    
    const caso = cliente.casos[casoIndex];
    
    // Em produção, faria uma chamada ao backend para gerar/buscar o PDF
    // Por enquanto, simula a abertura
    alert(`📄 Abrindo ${tipoPDF === 'esclarecimentos' ? 'Esclarecimentos' : 'Planilha RT'}...\n\nCliente: ${cliente.nome}\nCaso: ${caso.casoId}\n\n(Em produção, o PDF será aberto em nova aba)`);
    
    // Simular abertura do PDF
    // window.open(`/api/pdf/${tipoPDF}/${clienteId}/${casoIndex}`, '_blank');
}

// Imprimir todos os PDFs do caso
function imprimirPDFs(clienteId, casoIndex) {
    const cliente = CLIENTES.find(c => c.id === clienteId);
    if (!cliente || !cliente.casos[casoIndex]) {
        alert('Dados não encontrados.');
        return;
    }
    
    alert(`🖨️ Preparando impressão de todos os PDFs...\n\nCliente: ${cliente.nome}\nCaso: ${cliente.casos[casoIndex].casoId}\n\n(Em produção, abrirá janela de impressão)`);
}

// Enviar PDFs ao cliente
function enviarPDFs(clienteId) {
    const cliente = CLIENTES.find(c => c.id === clienteId);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }
    
    if (cliente.casos.length === 0) {
        alert('Este cliente ainda não possui cálculos realizados.');
        return;
    }
    
    // Verificar se cliente pagou Kit IR (em produção, verificar no banco)
    const casoRecente = cliente.casos[cliente.casos.length - 1];
    const statusPagos = ['pago_kit', 'contrato', 'enviado', 'analise', 'concluido'];
    
    if (!statusPagos.includes(casoRecente.status)) {
        const confirmar = confirm(`⚠️ ATENÇÃO: Este cliente ainda NÃO pagou o Kit IR.\n\nStatus atual: ${STATUS_LABELS[casoRecente.status]?.texto || casoRecente.status}\n\nDeseja enviar mesmo assim? (Apenas Admin pode fazer isso)`);
        
        if (!confirmar) return;
        
        // Verificar se é admin
        if (auth.getNivel() !== 'admin') {
            alert('❌ Apenas administradores podem enviar PDFs para clientes que não pagaram.');
            return;
        }
    }
    
    // Criar modal de envio
    const modalHTML = `
        <div class="modal active" id="modalEnviarPDFs">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📧 Enviar PDFs ao Cliente</h2>
                    <button class="btn-close" onclick="fecharModalEnviar()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="cliente-info-pdf">
                        <strong>${cliente.nome}</strong>
                        <span>CPF: ${cliente.cpf}</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Método de Envio</label>
                        <div class="envio-opcoes">
                            <label class="radio-opcao">
                                <input type="radio" name="metodoEnvio" value="email" checked>
                                <span>📧 E-mail</span>
                            </label>
                            <label class="radio-opcao">
                                <input type="radio" name="metodoEnvio" value="whatsapp">
                                <span>📱 WhatsApp</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group" id="grupoEmail">
                        <label>E-mail do Cliente</label>
                        <input type="email" id="emailEnvio" value="${cliente.email}" class="form-control">
                    </div>
                    
                    <div class="form-group" id="grupoWhatsApp" style="display: none;">
                        <label>WhatsApp do Cliente</label>
                        <input type="text" id="whatsappEnvio" value="${cliente.telefones[0]?.numero || ''}" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label>Selecione os PDFs para enviar</label>
                        ${cliente.casos.map((caso, index) => `
                            <div class="checkbox-pdf">
                                <label>
                                    <input type="checkbox" name="casos" value="${index}" checked>
                                    Caso ${caso.casoId} - ${formatarMoeda(caso.valorRestituicao)}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="form-group">
                        <label>Mensagem Personalizada (opcional)</label>
                        <textarea id="mensagemEnvio" rows="4" class="form-control" placeholder="Olá ${cliente.nome.split(' ')[0]}, segue em anexo os documentos do seu cálculo de restituição..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="fecharModalEnviar()">Cancelar</button>
                    <button class="btn btn-success" onclick="confirmarEnvio('${clienteId}')">
                        📤 Enviar PDFs
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal existente se houver
    const modalExistente = document.getElementById('modalEnviarPDFs');
    if (modalExistente) modalExistente.remove();
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event listeners para alternar método de envio
    document.querySelectorAll('input[name="metodoEnvio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'email') {
                document.getElementById('grupoEmail').style.display = 'block';
                document.getElementById('grupoWhatsApp').style.display = 'none';
            } else {
                document.getElementById('grupoEmail').style.display = 'none';
                document.getElementById('grupoWhatsApp').style.display = 'block';
            }
        });
    });
}

// Fechar modal de envio
function fecharModalEnviar() {
    const modal = document.getElementById('modalEnviarPDFs');
    if (modal) modal.remove();
}

// Confirmar envio dos PDFs
function confirmarEnvio(clienteId) {
    const cliente = CLIENTES.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const metodo = document.querySelector('input[name="metodoEnvio"]:checked').value;
    const destino = metodo === 'email' 
        ? document.getElementById('emailEnvio').value 
        : document.getElementById('whatsappEnvio').value;
    
    const casosChecked = Array.from(document.querySelectorAll('input[name="casos"]:checked')).map(cb => cb.value);
    
    if (casosChecked.length === 0) {
        alert('Selecione pelo menos um caso para enviar.');
        return;
    }
    
    if (!destino) {
        alert(`Por favor, informe o ${metodo === 'email' ? 'e-mail' : 'WhatsApp'} do cliente.`);
        return;
    }
    
    // Em produção, faria chamada ao backend
    const mensagem = document.getElementById('mensagemEnvio').value;
    
    // Simular envio
    alert(`✅ PDFs enviados com sucesso!\n\nMétodo: ${metodo === 'email' ? 'E-mail' : 'WhatsApp'}\nDestino: ${destino}\nCasos: ${casosChecked.length}\n\n(Em produção, os PDFs serão enviados automaticamente)`);
    
    // Atualizar status do cliente para "enviado" se ainda não estiver
    const casoRecente = cliente.casos[cliente.casos.length - 1];
    if (casoRecente.status === 'pago_kit') {
        casoRecente.status = 'enviado';
        carregarClientes();
    }
    
    fecharModalEnviar();
}

// Alias para enviarPDFs (usado na busca)
function enviarAoCliente(clienteId) {
    enviarPDFs(clienteId);
}

// Exportar funções de PDFs globalmente
window.verPDFs = verPDFs;
window.fecharModalPDFs = fecharModalPDFs;
window.visualizarPDF = visualizarPDF;
window.imprimirPDFs = imprimirPDFs;
window.enviarPDFs = enviarPDFs;
window.enviarAoCliente = enviarAoCliente;
window.fecharModalEnviar = fecharModalEnviar;
window.confirmarEnvio = confirmarEnvio;
