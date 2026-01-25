/**
 * Controle Financeiro - JavaScript
 * Módulo exclusivo para Admin
 */

// Verificar autenticação e permissão
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se auth existe e está logado
    if (typeof auth !== 'undefined' && !auth.estaLogado()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar se é admin (se auth existir)
    if (typeof auth !== 'undefined' && auth.getNivel() !== 'admin') {
        alert('Acesso negado! Esta área é exclusiva para administradores.');
        window.location.href = 'index.html';
        return;
    }
    
    // Atualizar nome do usuário
    if (typeof auth !== 'undefined' && auth.getUsuario()) {
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = auth.getUsuario().nome;
    }
    
    // Inicializar
    inicializarFinanceiro();
});

// Dados mock de receitas
let receitas = [
    {
        id: 1,
        data: '2026-01-20',
        cliente: 'José Ramos Conceição',
        tipo: 'kit_ir',
        descricao: 'Kit IR - DIRPF 2021',
        valor: 10.00,
        status: 'confirmado'
    },
    {
        id: 2,
        data: '2026-01-18',
        cliente: 'Ana Carmen Souza',
        tipo: 'kit_ir',
        descricao: 'Kit IR - DIRPF 2022, 2023, 2024',
        valor: 30.00,
        status: 'confirmado'
    },
    {
        id: 3,
        data: '2026-01-15',
        cliente: 'Maria Silva',
        tipo: 'ver_valor',
        descricao: 'Consulta de valor de restituição',
        valor: 5.99,
        status: 'confirmado'
    },
    {
        id: 4,
        data: '2026-01-10',
        cliente: 'José Ramos Conceição',
        tipo: 'contrato',
        descricao: 'Contrato 15% sobre restituição de R$ 74.000',
        valor: 11100.00,
        status: 'pendente'
    },
    {
        id: 5,
        data: '2026-01-08',
        cliente: 'Carlos Oliveira',
        tipo: 'kit_ir',
        descricao: 'Kit IR - DIRPF 2023',
        valor: 10.00,
        status: 'confirmado'
    },
    {
        id: 6,
        data: '2026-01-05',
        cliente: 'Fernanda Costa',
        tipo: 'ver_valor',
        descricao: 'Consulta de valor de restituição',
        valor: 5.99,
        status: 'cancelado'
    }
];

// Dados mock de despesas
let despesas = [
    {
        id: 1,
        data: '2026-01-22',
        categoria: 'comissao',
        descricao: 'Comissão parceiro João - Cliente Ana Carmen',
        fornecedor: 'João Parceiro',
        valor: 3.00,
        status: 'pendente'
    },
    {
        id: 2,
        data: '2026-01-20',
        categoria: 'marketing',
        descricao: 'Google Ads - Campanha Janeiro',
        fornecedor: 'Google',
        valor: 500.00,
        status: 'pago'
    },
    {
        id: 3,
        data: '2026-01-15',
        categoria: 'operacional',
        descricao: 'Hospedagem Hostinger - Mensal',
        fornecedor: 'Hostinger',
        valor: 49.90,
        status: 'pago'
    },
    {
        id: 4,
        data: '2026-01-10',
        categoria: 'operacional',
        descricao: 'Domínio restituicaoia.com.br - Anual',
        fornecedor: 'Registro.br',
        valor: 40.00,
        status: 'pago'
    },
    {
        id: 5,
        data: '2026-01-05',
        categoria: 'impostos',
        descricao: 'DAS Simples Nacional - Janeiro',
        fornecedor: 'Receita Federal',
        valor: 150.00,
        status: 'pendente'
    }
];

// Dados mock de clientes para o select
const clientesMock = [
    { id: 1, nome: 'José Ramos Conceição' },
    { id: 2, nome: 'Ana Carmen Souza' },
    { id: 3, nome: 'Maria Silva' },
    { id: 4, nome: 'Carlos Oliveira' },
    { id: 5, nome: 'Fernanda Costa' }
];

// Inicializar módulo financeiro
function inicializarFinanceiro() {
    // Definir mês atual no seletor
    const hoje = new Date();
    document.getElementById('periodoMes').value = String(hoje.getMonth() + 1).padStart(2, '0');
    document.getElementById('periodoAno').value = hoje.getFullYear();
    
    // Carregar dados
    atualizarCards();
    renderizarReceitas();
    renderizarDespesas();
    inicializarGraficos();
    renderizarResumoAnual();
    
    // Preencher select de clientes
    preencherSelectClientes();
    
    // Event listeners para tabs principais
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Remover active de todas as tabs
            document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adicionar active na tab clicada
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
    
    // Máscaras de valor
    aplicarMascaraValor('receitaValor');
    aplicarMascaraValor('despesaValor');
    
    // Event listeners para filtros
    document.getElementById('filtroTipoReceita')?.addEventListener('change', renderizarReceitas);
    document.getElementById('buscaReceita')?.addEventListener('input', renderizarReceitas);
    document.getElementById('filtroCategoriaDespesa')?.addEventListener('change', renderizarDespesas);
    document.getElementById('buscaDespesa')?.addEventListener('input', renderizarDespesas);
}

// Atualizar cards de resumo
function atualizarCards() {
    const totalReceitas = receitas
        .filter(r => r.status !== 'cancelado')
        .reduce((sum, r) => sum + r.valor, 0);
    
    const totalDespesas = despesas
        .filter(d => d.status !== 'cancelado')
        .reduce((sum, d) => sum + d.valor, 0);
    
    const saldo = totalReceitas - totalDespesas;
    
    const comissoesPendentes = despesas
        .filter(d => d.categoria === 'comissao' && d.status === 'pendente')
        .reduce((sum, d) => sum + d.valor, 0);
    
    document.getElementById('totalReceitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('totalDespesas').textContent = formatarMoeda(totalDespesas);
    document.getElementById('saldoMes').textContent = formatarMoeda(saldo);
    document.getElementById('totalComissoes').textContent = formatarMoeda(comissoesPendentes);
}

// Renderizar tabela de receitas
function renderizarReceitas() {
    const tbody = document.getElementById('tabelaReceitas');
    const filtroTipo = document.getElementById('filtroTipoReceita').value;
    const busca = document.getElementById('buscaReceita')?.value?.toLowerCase() || '';
    
    let receitasFiltradas = receitas;
    
    if (filtroTipo) {
        receitasFiltradas = receitasFiltradas.filter(r => r.tipo === filtroTipo);
    }
    
    if (busca) {
        receitasFiltradas = receitasFiltradas.filter(r => 
            r.cliente.toLowerCase().includes(busca) ||
            r.descricao.toLowerCase().includes(busca)
        );
    }
    
    tbody.innerHTML = receitasFiltradas.map(r => `
        <tr>
            <td>${formatarData(r.data)}</td>
            <td>${r.cliente}</td>
            <td><span class="tipo-badge ${r.tipo}">${getTipoLabel(r.tipo)}</span></td>
            <td>${r.descricao}</td>
            <td class="valor-receita">${formatarMoeda(r.valor)}</td>
            <td><span class="status-badge ${r.status}">${capitalizar(r.status)}</span></td>
            <td>
                <button class="btn-action edit" onclick="editarReceita(${r.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" onclick="excluirReceita(${r.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Atualizar total
    const total = receitasFiltradas
        .filter(r => r.status !== 'cancelado')
        .reduce((sum, r) => sum + r.valor, 0);
    document.getElementById('totalReceitasTabela').textContent = formatarMoeda(total);
}

// Renderizar tabela de despesas
function renderizarDespesas() {
    const tbody = document.getElementById('tabelaDespesas');
    const filtroCategoria = document.getElementById('filtroCategoriaDespesa').value;
    const busca = document.getElementById('buscaDespesa')?.value?.toLowerCase() || '';
    
    let despesasFiltradas = despesas;
    
    if (filtroCategoria) {
        despesasFiltradas = despesasFiltradas.filter(d => d.categoria === filtroCategoria);
    }
    
    if (busca) {
        despesasFiltradas = despesasFiltradas.filter(d => 
            d.descricao.toLowerCase().includes(busca) ||
            d.fornecedor.toLowerCase().includes(busca)
        );
    }
    
    tbody.innerHTML = despesasFiltradas.map(d => `
        <tr>
            <td>${formatarData(d.data)}</td>
            <td><span class="categoria-badge ${d.categoria}">${getCategoriaLabel(d.categoria)}</span></td>
            <td>${d.descricao}</td>
            <td>${d.fornecedor}</td>
            <td class="valor-despesa">${formatarMoeda(d.valor)}</td>
            <td><span class="status-badge ${d.status}">${capitalizar(d.status)}</span></td>
            <td>
                <button class="btn-action edit" onclick="editarDespesa(${d.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" onclick="excluirDespesa(${d.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Atualizar total
    const total = despesasFiltradas
        .filter(d => d.status !== 'cancelado')
        .reduce((sum, d) => sum + d.valor, 0);
    document.getElementById('totalDespesasTabela').textContent = formatarMoeda(total);
}

// Inicializar gráficos
function inicializarGraficos() {
    // Gráfico Receitas x Despesas
    const ctxRD = document.getElementById('graficoReceitasDespesas').getContext('2d');
    new Chart(ctxRD, {
        type: 'bar',
        data: {
            labels: ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [8500, 9200, 10100, 11500, 12800, 11161.98],
                    backgroundColor: '#10b981'
                },
                {
                    label: 'Despesas',
                    data: [3200, 3500, 3800, 4100, 4500, 742.90],
                    backgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Gráfico Receitas por Tipo
    const ctxRT = document.getElementById('graficoReceitasTipo').getContext('2d');
    new Chart(ctxRT, {
        type: 'doughnut',
        data: {
            labels: ['Kit IR', 'Ver Valor', 'Contrato', 'Outros'],
            datasets: [{
                data: [50, 11.98, 11100, 0],
                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Gráfico Despesas por Categoria
    const ctxDC = document.getElementById('graficoDespesasCategoria').getContext('2d');
    new Chart(ctxDC, {
        type: 'doughnut',
        data: {
            labels: ['Comissão', 'Marketing', 'Operacional', 'Impostos'],
            datasets: [{
                data: [3, 500, 89.90, 150],
                backgroundColor: ['#f59e0b', '#ec4899', '#3b82f6', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Renderizar resumo anual
function renderizarResumoAnual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Dados mock por mês
    const dadosMensais = {
        'Janeiro': { receitas: 11161.98, despesas: 742.90 },
        'Fevereiro': { receitas: 0, despesas: 0 },
        'Março': { receitas: 0, despesas: 0 },
        'Abril': { receitas: 0, despesas: 0 },
        'Maio': { receitas: 0, despesas: 0 },
        'Junho': { receitas: 0, despesas: 0 },
        'Julho': { receitas: 0, despesas: 0 },
        'Agosto': { receitas: 0, despesas: 0 },
        'Setembro': { receitas: 0, despesas: 0 },
        'Outubro': { receitas: 0, despesas: 0 },
        'Novembro': { receitas: 0, despesas: 0 },
        'Dezembro': { receitas: 0, despesas: 0 }
    };
    
    const tbody = document.getElementById('tabelaResumoAnual');
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    tbody.innerHTML = meses.map(mes => {
        const dados = dadosMensais[mes];
        const saldo = dados.receitas - dados.despesas;
        totalReceitas += dados.receitas;
        totalDespesas += dados.despesas;
        
        return `
            <tr>
                <td>${mes}</td>
                <td style="color: #10b981">${formatarMoeda(dados.receitas)}</td>
                <td style="color: #ef4444">${formatarMoeda(dados.despesas)}</td>
                <td style="color: ${saldo >= 0 ? '#10b981' : '#ef4444'}">${formatarMoeda(saldo)}</td>
            </tr>
        `;
    }).join('');
    
    // Totais
    document.getElementById('totalAnualReceitas').innerHTML = `<strong style="color: #10b981">${formatarMoeda(totalReceitas)}</strong>`;
    document.getElementById('totalAnualDespesas').innerHTML = `<strong style="color: #ef4444">${formatarMoeda(totalDespesas)}</strong>`;
    document.getElementById('totalAnualSaldo').innerHTML = `<strong style="color: ${totalReceitas - totalDespesas >= 0 ? '#10b981' : '#ef4444'}">${formatarMoeda(totalReceitas - totalDespesas)}</strong>`;
}

// Preencher select de clientes (ordenado alfabeticamente)
function preencherSelectClientes() {
    const select = document.getElementById('receitaCliente');
    if (select) {
        // Ordenar clientes alfabeticamente
        const clientesOrdenados = [...clientesMock].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        select.innerHTML = '<option value="">Selecione o cliente...</option>' +
            clientesOrdenados.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    }
}

// =====================================================
// FUNÇÕES DO MODAL UNIFICADO (UX MELHORADA)
// =====================================================

// Abrir modal de receita
function abrirModalReceita() {
    const modal = document.getElementById('modalFinanceiro');
    modal.style.display = 'flex';
    
    // Ativar aba de receita
    trocarTipoModal('receita');
    
    // Limpar e preparar formulário
    document.getElementById('formReceita').reset();
    document.getElementById('receitaData').value = new Date().toISOString().split('T')[0];
}

// Abrir modal de despesa
function abrirModalDespesa() {
    const modal = document.getElementById('modalFinanceiro');
    modal.style.display = 'flex';
    
    // Ativar aba de despesa
    trocarTipoModal('despesa');
    
    // Limpar e preparar formulário
    document.getElementById('formDespesa').reset();
    document.getElementById('despesaData').value = new Date().toISOString().split('T')[0];
}

// Trocar tipo no modal (receita/despesa)
function trocarTipoModal(tipo) {
    // Atualizar abas
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tipo === tipo) {
            tab.classList.add('active');
        }
    });
    
    // Atualizar formulários
    document.querySelectorAll('.form-financeiro').forEach(form => {
        form.classList.remove('active');
    });
    
    if (tipo === 'receita') {
        document.getElementById('formReceita').classList.add('active');
    } else {
        document.getElementById('formDespesa').classList.add('active');
    }
}

// Fechar modal financeiro
function fecharModalFinanceiro() {
    const modal = document.getElementById('modalFinanceiro');
    modal.style.display = 'none';
}

// Atualizar valor da receita baseado no tipo
function atualizarValorReceita() {
    const select = document.getElementById('receitaTipo');
    const option = select.options[select.selectedIndex];
    const valor = option.dataset.valor;
    
    if (valor && valor !== '0') {
        document.getElementById('receitaValor').value = formatarMoeda(parseFloat(valor));
    } else {
        document.getElementById('receitaValor').value = '';
    }
}

// Salvar receita
function salvarReceita(event) {
    event.preventDefault();
    
    const novaReceita = {
        id: receitas.length + 1,
        data: document.getElementById('receitaData').value,
        cliente: document.getElementById('receitaCliente').options[document.getElementById('receitaCliente').selectedIndex]?.text || 'Cliente Avulso',
        tipo: document.getElementById('receitaTipo').value,
        descricao: document.getElementById('receitaDescricao').value || getTipoLabel(document.getElementById('receitaTipo').value),
        valor: parseMoeda(document.getElementById('receitaValor').value),
        status: document.getElementById('receitaStatus').value
    };
    
    receitas.unshift(novaReceita);
    
    fecharModalFinanceiro();
    atualizarCards();
    renderizarReceitas();
    
    // Feedback visual
    mostrarNotificacao('Receita salva com sucesso!', 'success');
}

// Salvar despesa
function salvarDespesa(event) {
    event.preventDefault();
    
    const novaDespesa = {
        id: despesas.length + 1,
        data: document.getElementById('despesaData').value,
        categoria: document.getElementById('despesaCategoria').value,
        descricao: document.getElementById('despesaDescricao').value,
        fornecedor: document.getElementById('despesaFornecedor').value || '-',
        valor: parseMoeda(document.getElementById('despesaValor').value),
        status: document.getElementById('despesaStatus').value
    };
    
    despesas.unshift(novaDespesa);
    
    fecharModalFinanceiro();
    atualizarCards();
    renderizarDespesas();
    
    // Feedback visual
    mostrarNotificacao('Despesa salva com sucesso!', 'danger');
}

// Editar receita
function editarReceita(id) {
    const receita = receitas.find(r => r.id === id);
    if (!receita) return;
    
    abrirModalReceita();
    
    document.getElementById('receitaData').value = receita.data;
    document.getElementById('receitaTipo').value = receita.tipo;
    document.getElementById('receitaValor').value = formatarMoeda(receita.valor);
    document.getElementById('receitaDescricao').value = receita.descricao;
    document.getElementById('receitaStatus').value = receita.status;
}

// Excluir receita
function excluirReceita(id) {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
        receitas = receitas.filter(r => r.id !== id);
        atualizarCards();
        renderizarReceitas();
        mostrarNotificacao('Receita excluída!', 'warning');
    }
}

// Editar despesa
function editarDespesa(id) {
    const despesa = despesas.find(d => d.id === id);
    if (!despesa) return;
    
    abrirModalDespesa();
    
    document.getElementById('despesaData').value = despesa.data;
    document.getElementById('despesaCategoria').value = despesa.categoria;
    document.getElementById('despesaFornecedor').value = despesa.fornecedor;
    document.getElementById('despesaValor').value = formatarMoeda(despesa.valor);
    document.getElementById('despesaDescricao').value = despesa.descricao;
    document.getElementById('despesaStatus').value = despesa.status;
}

// Excluir despesa
function excluirDespesa(id) {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
        despesas = despesas.filter(d => d.id !== id);
        atualizarCards();
        renderizarDespesas();
        mostrarNotificacao('Despesa excluída!', 'warning');
    }
}

// Filtrar período
function filtrarPeriodo() {
    // Em produção, faria uma chamada à API
    mostrarNotificacao('Filtro aplicado!', 'info');
}

// Exportar relatório - CORRIGIDO
function exportarRelatorio(formato) {
    if (formato === 'pdf') {
        exportarPDF();
    } else if (formato === 'excel') {
        exportarExcel();
    } else {
        mostrarNotificacao(`Formato ${formato} não suportado`, 'warning');
    }
}

// Exportar para PDF
function exportarPDF() {
    // Criar conteúdo do relatório
    const mes = document.getElementById('periodoMes').value;
    const ano = document.getElementById('periodoAno').value;
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeMes = meses[parseInt(mes) - 1];
    
    const totalRec = receitas.filter(r => r.status !== 'cancelado').reduce((sum, r) => sum + r.valor, 0);
    const totalDesp = despesas.filter(d => d.status !== 'cancelado').reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalRec - totalDesp;
    
    // Criar HTML para impressão
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório Financeiro - ${nomeMes}/${ano}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #1a5f2a; border-bottom: 2px solid #1a5f2a; padding-bottom: 10px; }
                h2 { color: #333; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f5f5f5; }
                .receita { color: #10b981; }
                .despesa { color: #ef4444; }
                .resumo { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .resumo-item { display: inline-block; margin-right: 40px; }
                .valor { font-size: 24px; font-weight: bold; }
                @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
        </head>
        <body>
            <h1>📊 Relatório Financeiro - e-Restituição</h1>
            <p><strong>Período:</strong> ${nomeMes} de ${ano}</p>
            <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            
            <div class="resumo">
                <div class="resumo-item">
                    <div>Total Receitas</div>
                    <div class="valor receita">${formatarMoeda(totalRec)}</div>
                </div>
                <div class="resumo-item">
                    <div>Total Despesas</div>
                    <div class="valor despesa">${formatarMoeda(totalDesp)}</div>
                </div>
                <div class="resumo-item">
                    <div>Saldo</div>
                    <div class="valor" style="color: ${saldo >= 0 ? '#10b981' : '#ef4444'}">${formatarMoeda(saldo)}</div>
                </div>
            </div>
            
            <h2>🟢 Receitas</h2>
            <table>
                <tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Status</th></tr>
                ${receitas.map(r => `<tr><td>${formatarData(r.data)}</td><td>${r.cliente}</td><td>${getTipoLabel(r.tipo)}</td><td>${r.descricao}</td><td class="receita">${formatarMoeda(r.valor)}</td><td>${capitalizar(r.status)}</td></tr>`).join('')}
            </table>
            
            <h2>🔴 Despesas</h2>
            <table>
                <tr><th>Data</th><th>Categoria</th><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Status</th></tr>
                ${despesas.map(d => `<tr><td>${formatarData(d.data)}</td><td>${getCategoriaLabel(d.categoria)}</td><td>${d.descricao}</td><td>${d.fornecedor}</td><td class="despesa">${formatarMoeda(d.valor)}</td><td>${capitalizar(d.status)}</td></tr>`).join('')}
            </table>
            
            <p style="margin-top: 40px; color: #666; font-size: 12px;">e-Restituição IA - Sistema de Gestão de Restituição de IRPF</p>
        </body>
        </html>
    `;
    
    // Abrir em nova janela para impressão/PDF
    const janela = window.open('', '_blank');
    janela.document.write(html);
    janela.document.close();
    janela.print();
    
    mostrarNotificacao('✅ Relatório PDF gerado! Use Ctrl+P para salvar como PDF.', 'success');
}

// Exportar para Excel (CSV)
function exportarExcel() {
    const mes = document.getElementById('periodoMes').value;
    const ano = document.getElementById('periodoAno').value;
    
    // Criar CSV com receitas e despesas
    let csv = 'RELATÓRIO FINANCEIRO - e-Restituição\n';
    csv += `Período: ${mes}/${ano}\n`;
    csv += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    // Receitas
    csv += 'RECEITAS\n';
    csv += 'Data,Cliente,Tipo,Descrição,Valor,Status\n';
    receitas.forEach(r => {
        csv += `${formatarData(r.data)},"${r.cliente}",${getTipoLabel(r.tipo)},"${r.descricao}",${r.valor.toFixed(2)},${capitalizar(r.status)}\n`;
    });
    
    const totalRec = receitas.filter(r => r.status !== 'cancelado').reduce((sum, r) => sum + r.valor, 0);
    csv += `,,,,${totalRec.toFixed(2)},TOTAL RECEITAS\n\n`;
    
    // Despesas
    csv += 'DESPESAS\n';
    csv += 'Data,Categoria,Descrição,Fornecedor,Valor,Status\n';
    despesas.forEach(d => {
        csv += `${formatarData(d.data)},${getCategoriaLabel(d.categoria)},"${d.descricao}","${d.fornecedor}",${d.valor.toFixed(2)},${capitalizar(d.status)}\n`;
    });
    
    const totalDesp = despesas.filter(d => d.status !== 'cancelado').reduce((sum, d) => sum + d.valor, 0);
    csv += `,,,,${totalDesp.toFixed(2)},TOTAL DESPESAS\n\n`;
    
    // Resumo
    csv += 'RESUMO\n';
    csv += `Total Receitas,${totalRec.toFixed(2)}\n`;
    csv += `Total Despesas,${totalDesp.toFixed(2)}\n`;
    csv += `Saldo,${(totalRec - totalDesp).toFixed(2)}\n`;
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_financeiro_${mes}_${ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacao('✅ Relatório Excel (CSV) exportado com sucesso!', 'success');
}

// =====================================================
// UTILITÁRIOS
// =====================================================

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function parseMoeda(valor) {
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTipoLabel(tipo) {
    const labels = {
        'kit_ir': 'Kit IR',
        'ver_valor': 'Ver Valor',
        'contrato': 'Contrato',
        'outros': 'Outros'
    };
    return labels[tipo] || tipo;
}

function getCategoriaLabel(categoria) {
    const labels = {
        'comissao': 'Comissão',
        'marketing': 'Marketing',
        'operacional': 'Operacional',
        'pessoal': 'Pessoal',
        'impostos': 'Impostos',
        'outros': 'Outros'
    };
    return labels[categoria] || categoria;
}

function aplicarMascaraValor(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = (parseInt(valor) / 100).toFixed(2);
        e.target.value = formatarMoeda(valor);
    });
}

// Notificação toast
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação existente
    const existente = document.querySelector('.notificacao-toast');
    if (existente) existente.remove();
    
    const cores = {
        'success': '#10b981',
        'danger': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    
    const toast = document.createElement('div');
    toast.className = 'notificacao-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = mensagem;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modalFinanceiro');
    if (e.target === modal) {
        fecharModalFinanceiro();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalFinanceiro();
    }
});
