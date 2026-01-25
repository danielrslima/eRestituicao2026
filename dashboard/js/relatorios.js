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

// Gerar relatório em PDF
function gerarRelatorio() {
    const periodo = document.getElementById('filtroPeriodo').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    // Verificar se jsPDF está disponível
    if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
        alert('⚠️ Carregando biblioteca de PDF...');
        // Carregar jsPDF dinamicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => gerarRelatorioPDF(periodo, tipo);
        document.head.appendChild(script);
        return;
    }
    
    gerarRelatorioPDF(periodo, tipo);
}

function gerarRelatorioPDF(periodo, tipo) {
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF();
    
    // Configurações
    const corVerde = [26, 127, 55];
    const corCinza = [100, 100, 100];
    let y = 20;
    
    // Identificar quem gerou (chave correta: dashboard_sessao)
    const usuarioLogado = JSON.parse(localStorage.getItem('dashboard_sessao') || '{}');
    let geradoPor = 'Externo';
    if (usuarioLogado && usuarioLogado.nome) {
        geradoPor = usuarioLogado.nome;
        if (usuarioLogado.nivel === 'parceiro') {
            geradoPor += ' (Parceiro)';
        } else if (usuarioLogado.nivel === 'admin') {
            geradoPor += ' (Admin)';
        } else if (usuarioLogado.nivel === 'funcionario') {
            geradoPor += ' (Funcionário)';
        }
    }
    
    // Cabeçalho com fundo verde
    doc.setFillColor(...corVerde);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Adicionar logo (convertido para base64)
    try {
        const logoImg = new Image();
        logoImg.src = 'img/logo_e_restituicao.jpg';
        // Usar logo em base64 para garantir que funcione
        const logoBase64 = localStorage.getItem('logoEmpresa') || null;
        if (logoBase64) {
            doc.addImage(logoBase64, 'JPEG', 75, 3, 60, 15);
            y = 22;
        } else {
            // Fallback: texto do logo
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('e-Restituição', 105, 15, { align: 'center' });
        }
    } catch (e) {
        // Fallback: texto do logo
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('e-Restituição', 105, 15, { align: 'center' });
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório Gerencial', 105, 30, { align: 'center' });
    
    // Informação de quem gerou (canto superior direito)
    doc.setFontSize(8);
    doc.text(`Gerado por: ${geradoPor}`, 195, 38, { align: 'right' });
    
    y = 45;
    
    // Título do relatório
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    
    const tiposLabel = {
        'geral': 'Relatório Geral',
        'clientes': 'Relatório de Clientes',
        'financeiro': 'Relatório Financeiro',
        'conversao': 'Relatório de Conversão'
    };
    
    doc.text(tiposLabel[tipo] || 'Relatório', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...corCinza);
    doc.text(`Período: Últimos ${periodo} dias | Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, y);
    
    y += 15;
    
    // KPIs
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Principais (KPIs)', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const kpis = [
        ['Total de Clientes:', document.getElementById('kpiTotalClientes')?.textContent || '500'],
        ['Receita Total:', document.getElementById('kpiReceita')?.textContent || 'R$ 77.300'],
        ['Kits IR Gerados:', document.getElementById('kpiKitsGerados')?.textContent || '185'],
        ['Taxa de Conversão:', document.getElementById('kpiConversao')?.textContent || '13%']
    ];
    
    kpis.forEach(([label, valor]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 25, y);
        doc.setFont('helvetica', 'bold');
        doc.text(valor, 80, y);
        y += 7;
    });
    
    y += 10;
    
    // Resumo por Status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo por Status', 20, y);
    
    y += 8;
    
    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 4, 170, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Status', 25, y);
    doc.text('Qtd', 80, y);
    doc.text('%', 110, y);
    doc.text('Valor', 140, y);
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    
    dadosMock.statusResumo.forEach((item, i) => {
        if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, y - 4, 170, 7, 'F');
        }
        doc.text(item.status, 25, y);
        doc.text(item.quantidade.toString(), 80, y);
        doc.text(item.percentual + '%', 110, y);
        doc.text('R$ ' + item.valor.toLocaleString('pt-BR'), 140, y);
        y += 7;
    });
    
    y += 10;
    
    // Top 5 Clientes
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 5 Clientes por Valor', 20, y);
    
    y += 8;
    
    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 4, 170, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 25, y);
    doc.text('Cliente', 35, y);
    doc.text('Valor', 120, y);
    doc.text('Produtos', 160, y);
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    
    dadosMock.topClientes.forEach((cliente, i) => {
        if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, y - 4, 170, 7, 'F');
        }
        doc.text((i + 1) + 'º', 25, y);
        doc.text(cliente.nome.substring(0, 30), 35, y);
        doc.text('R$ ' + cliente.valor.toLocaleString('pt-BR'), 120, y);
        doc.text(cliente.produtos.toString(), 165, y);
        y += 7;
    });
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(...corCinza);
    doc.text('e-Restituição - Sistema de Gestão de Restituição de Imposto de Renda', 105, 285, { align: 'center' });
    
    // Salvar
    const nomeArquivo = `Relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    mostrarNotificacao(`✅ Relatório gerado: ${nomeArquivo}`, 'success');
}

// Exportar relatório em Excel
function exportarRelatorio() {
    // Verificar se SheetJS está disponível
    if (typeof XLSX === 'undefined') {
        alert('⚠️ Carregando biblioteca de Excel...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => exportarRelatorioExcel();
        document.head.appendChild(script);
        return;
    }
    
    exportarRelatorioExcel();
}

function exportarRelatorioExcel() {
    const periodo = document.getElementById('filtroPeriodo').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Aba 1: KPIs
    const kpisData = [
        ['RELATÓRIO GERENCIAL - e-Restituição'],
        ['Gerado em:', new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')],
        ['Período:', `Últimos ${periodo} dias`],
        [''],
        ['INDICADORES PRINCIPAIS (KPIs)'],
        ['Indicador', 'Valor'],
        ['Total de Clientes', document.getElementById('kpiTotalClientes')?.textContent || '500'],
        ['Receita Total', document.getElementById('kpiReceita')?.textContent || 'R$ 77.300'],
        ['Kits IR Gerados', document.getElementById('kpiKitsGerados')?.textContent || '185'],
        ['Taxa de Conversão', document.getElementById('kpiConversao')?.textContent || '13%']
    ];
    const wsKPIs = XLSX.utils.aoa_to_sheet(kpisData);
    XLSX.utils.book_append_sheet(wb, wsKPIs, 'KPIs');
    
    // Aba 2: Resumo por Status
    const statusData = [
        ['RESUMO POR STATUS'],
        ['Status', 'Quantidade', 'Percentual', 'Valor (R$)'],
        ...dadosMock.statusResumo.map(item => [
            item.status,
            item.quantidade,
            item.percentual + '%',
            item.valor
        ])
    ];
    const wsStatus = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, wsStatus, 'Status');
    
    // Aba 3: Top Clientes
    const clientesData = [
        ['TOP 5 CLIENTES POR VALOR'],
        ['Posição', 'Cliente', 'Valor (R$)', 'Produtos'],
        ...dadosMock.topClientes.map((cliente, i) => [
            i + 1,
            cliente.nome,
            cliente.valor,
            cliente.produtos
        ])
    ];
    const wsClientes = XLSX.utils.aoa_to_sheet(clientesData);
    XLSX.utils.book_append_sheet(wb, wsClientes, 'Top Clientes');
    
    // Aba 4: Receitas Mensais
    const receitasData = [
        ['RECEITAS MENSAIS'],
        ['Mês', 'Valor (R$)'],
        ...dadosMock.receitas.labels.map((mes, i) => [
            mes,
            dadosMock.receitas.valores[i]
        ])
    ];
    const wsReceitas = XLSX.utils.aoa_to_sheet(receitasData);
    XLSX.utils.book_append_sheet(wb, wsReceitas, 'Receitas');
    
    // Aba 5: Clientes Mensais
    const clientesMensaisData = [
        ['NOVOS CLIENTES POR MÊS'],
        ['Mês', 'Quantidade'],
        ...dadosMock.clientes.labels.map((mes, i) => [
            mes,
            dadosMock.clientes.valores[i]
        ])
    ];
    const wsClientesMensais = XLSX.utils.aoa_to_sheet(clientesMensaisData);
    XLSX.utils.book_append_sheet(wb, wsClientesMensais, 'Clientes Mensais');
    
    // Salvar arquivo
    const nomeArquivo = `Relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
    
    mostrarNotificacao(`✅ Relatório Excel exportado: ${nomeArquivo}`, 'success');
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo) {
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
