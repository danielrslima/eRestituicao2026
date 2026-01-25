/**
 * Relatórios - JavaScript
 * Lógica para a página de relatórios do dashboard
 */

// Variáveis globais para os gráficos
let chartReceitas = null;
let chartClientes = null;
let chartFunil = null;
let chartProdutos = null;

// Dados mock para relatórios
const dadosMock = {
    receitas: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        valores: [2500, 3200, 4100, 3800, 5200, 6100, 5800, 7200, 8500, 9200, 10500, 11200]
    },
    clientes: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        valores: [12, 18, 25, 22, 30, 35, 32, 40, 48, 52, 60, 65]
    },
    funil: {
        labels: ['Leads', 'Calcularam', 'Pagaram Kit', 'Contrato', 'Concluído'],
        valores: [500, 320, 180, 95, 65]
    },
    produtos: {
        labels: ['Kit IR', 'Consulta Ver Valor', 'Contrato 15%', 'Retificação'],
        valores: [45, 25, 20, 10]
    },
    topClientes: [
        { nome: 'José Ramos da Silva', valor: 11100, produtos: 4 },
        { nome: 'Ana Carmen Souza', valor: 8500, produtos: 3 },
        { nome: 'Maria Santos Oliveira', valor: 6200, produtos: 2 },
        { nome: 'Pedro Almeida Costa', valor: 5800, produtos: 3 },
        { nome: 'Carlos Eduardo Lima', valor: 4500, produtos: 2 }
    ],
    statusResumo: [
        { status: 'Leads', quantidade: 185, percentual: 37, valor: 0 },
        { status: 'Calculado', quantidade: 140, percentual: 28, valor: 0 },
        { status: 'Pago Kit', quantidade: 85, percentual: 17, valor: 4250 },
        { status: 'Contrato', quantidade: 55, percentual: 11, valor: 8250 },
        { status: 'Concluído', quantidade: 35, percentual: 7, valor: 52500 }
    ]
};

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
    
    // Inicializar relatórios
    carregarKPIs();
    inicializarGraficos();
    carregarTabelas();
    carregarMetricas();
    
    // Evento para período personalizado
    document.getElementById('filtroPeriodo').addEventListener('change', function() {
        const custom = this.value === 'custom';
        document.getElementById('dataCustom').style.display = custom ? 'flex' : 'none';
        document.getElementById('dataCustomFim').style.display = custom ? 'flex' : 'none';
    });
});

function atualizarData() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const data = new Date().toLocaleDateString('pt-BR', options);
    document.getElementById('dataAtual').textContent = data.charAt(0).toUpperCase() + data.slice(1);
}

// Carregar KPIs
function carregarKPIs() {
    document.getElementById('kpiTotalClientes').textContent = '500';
    document.getElementById('kpiClientesChange').textContent = '+12% vs mês anterior';
    
    document.getElementById('kpiReceita').textContent = 'R$ 77.300';
    document.getElementById('kpiReceitaChange').textContent = '+18% vs mês anterior';
    
    document.getElementById('kpiKitsGerados').textContent = '185';
    document.getElementById('kpiKitsChange').textContent = '+25% vs mês anterior';
    
    document.getElementById('kpiConversao').textContent = '13%';
    document.getElementById('kpiConversaoChange').textContent = '+2% vs mês anterior';
}

// Inicializar gráficos
function inicializarGraficos() {
    // Gráfico de Receitas
    const ctxReceitas = document.getElementById('chartReceitas').getContext('2d');
    chartReceitas = new Chart(ctxReceitas, {
        type: 'line',
        data: {
            labels: dadosMock.receitas.labels,
            datasets: [{
                label: 'Receitas (R$)',
                data: dadosMock.receitas.valores,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => 'R$ ' + value.toLocaleString('pt-BR')
                    }
                }
            }
        }
    });
    
    // Gráfico de Clientes
    const ctxClientes = document.getElementById('chartClientes').getContext('2d');
    chartClientes = new Chart(ctxClientes, {
        type: 'bar',
        data: {
            labels: dadosMock.clientes.labels,
            datasets: [{
                label: 'Novos Clientes',
                data: dadosMock.clientes.valores,
                backgroundColor: '#2196F3',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
    
    // Gráfico de Funil
    const ctxFunil = document.getElementById('chartFunil').getContext('2d');
    chartFunil = new Chart(ctxFunil, {
        type: 'bar',
        data: {
            labels: dadosMock.funil.labels,
            datasets: [{
                label: 'Quantidade',
                data: dadosMock.funil.valores,
                backgroundColor: [
                    '#e3f2fd',
                    '#bbdefb',
                    '#90caf9',
                    '#64b5f6',
                    '#4CAF50'
                ],
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
    
    // Gráfico de Produtos (Pizza)
    const ctxProdutos = document.getElementById('chartProdutos').getContext('2d');
    chartProdutos = new Chart(ctxProdutos, {
        type: 'doughnut',
        data: {
            labels: dadosMock.produtos.labels,
            datasets: [{
                data: dadosMock.produtos.valores,
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Alterar tipo de gráfico
function alterarTipoGrafico(grafico, tipo) {
    if (grafico === 'receitas' && chartReceitas) {
        chartReceitas.config.type = tipo;
        chartReceitas.update();
        
        // Atualizar botões
        document.querySelectorAll('.chart-card:first-child .btn-chart').forEach(btn => {
            btn.classList.remove('active');
            if ((tipo === 'line' && btn.dataset.tipo === 'linha') || 
                (tipo === 'bar' && btn.dataset.tipo === 'barra')) {
                btn.classList.add('active');
            }
        });
    } else if (grafico === 'clientes' && chartClientes) {
        chartClientes.config.type = tipo;
        chartClientes.update();
        
        // Atualizar botões
        document.querySelectorAll('.chart-card:nth-child(2) .btn-chart').forEach(btn => {
            btn.classList.remove('active');
            if ((tipo === 'line' && btn.dataset.tipo === 'linha') || 
                (tipo === 'bar' && btn.dataset.tipo === 'barra')) {
                btn.classList.add('active');
            }
        });
    }
}

// Carregar tabelas
function carregarTabelas() {
    // Top Clientes
    const tabelaTop = document.getElementById('tabelaTopClientes');
    tabelaTop.innerHTML = dadosMock.topClientes.map((cliente, index) => `
        <tr>
            <td><strong>${index + 1}º</strong></td>
            <td>${cliente.nome}</td>
            <td><strong>R$ ${cliente.valor.toLocaleString('pt-BR')}</strong></td>
            <td>${cliente.produtos}</td>
        </tr>
    `).join('');
    
    // Resumo por Status
    const tabelaStatus = document.getElementById('tabelaResumoStatus');
    tabelaStatus.innerHTML = dadosMock.statusResumo.map(item => `
        <tr>
            <td><span class="status-badge status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></td>
            <td>${item.quantidade}</td>
            <td>${item.percentual}%</td>
            <td>R$ ${item.valor.toLocaleString('pt-BR')}</td>
        </tr>
    `).join('');
}

// Carregar métricas
function carregarMetricas() {
    document.getElementById('metricaDiasConversao').textContent = '7';
    document.getElementById('metricaTicketMedio').textContent = 'R$ 418';
    document.getElementById('metricaTaxaRetorno').textContent = '23%';
    document.getElementById('metricaNPS').textContent = '72';
}

// Atualizar relatórios
function atualizarRelatorios() {
    const periodo = document.getElementById('filtroPeriodo').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    console.log('Atualizando relatórios:', { periodo, tipo });
    
    // Simular atualização dos dados
    carregarKPIs();
    
    // Atualizar gráficos com novos dados (simulado)
    if (chartReceitas) {
        chartReceitas.data.datasets[0].data = dadosMock.receitas.valores.map(v => v * (1 + Math.random() * 0.2));
        chartReceitas.update();
    }
    
    if (chartClientes) {
        chartClientes.data.datasets[0].data = dadosMock.clientes.valores.map(v => Math.floor(v * (1 + Math.random() * 0.2)));
        chartClientes.update();
    }
}

// Gerar relatório
function gerarRelatorio() {
    const periodo = document.getElementById('filtroPeriodo').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    alert(`Relatório "${tipo}" gerado para o período de ${periodo} dias.\n\nEm uma implementação real, isso geraria um relatório detalhado em PDF.`);
}

// Exportar relatório
function exportarRelatorio() {
    alert('Exportando relatório em PDF...\n\nEm uma implementação real, isso geraria um arquivo PDF para download.');
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
