# BACKUP DE RESTAURAÇÃO - e-Restituição IA

## Data do Backup: 25/01/2026 - 07:10 (Horário de Brasília)

## Arquivo de Backup
- **Nome:** `restituicaoia_backup_validado_20260125.tar.gz`
- **Localização:** `/home/ubuntu/restituicaoia_backup_validado_20260125.tar.gz`
- **Tamanho:** ~1.1 MB

## Como Restaurar

```bash
# 1. Navegue para o diretório home
cd /home/ubuntu

# 2. Faça backup do projeto atual (se necessário)
mv restituicaoia restituicaoia_old

# 3. Extraia o backup
tar -xzvf restituicaoia_backup_validado_20260125.tar.gz

# 4. Inicie o servidor
cd restituicaoia && python3 -m http.server 8081
```

## Conteúdo do Backup

### Dashboard (Validado ✅)
- `/dashboard/index.html` - Dashboard principal
- `/dashboard/clientes.html` - Cadastro de clientes
- `/dashboard/crm.html` - CRM
- `/dashboard/kit-ir.html` - Kit IR / PDFs
- `/dashboard/pagamentos.html` - Pagamentos
- `/dashboard/comissoes.html` - Comissões para Parceiros
- `/dashboard/financeiro.html` - Controle Financeiro
- `/dashboard/login.html` - Tela de login

### JavaScript (Validado ✅)
- `/dashboard/js/auth.js` - Autenticação
- `/dashboard/js/clientes.js` - Lógica de clientes (inclui TAB inteligente)
- `/dashboard/js/dashboard.js` - Dashboard
- `/dashboard/js/crm.js` - CRM
- `/dashboard/js/kit-ir.js` - Kit IR com dropdown de encartes
- `/dashboard/js/pagamentos.js` - Pagamentos
- `/dashboard/js/comissoes.js` - Comissões
- `/dashboard/js/financeiro.js` - Financeiro

### CSS (Validado ✅)
- `/dashboard/css/style.css` - Estilos principais
- `/dashboard/css/clientes.css` - Estilos de clientes
- `/dashboard/css/crm.css` - Estilos do CRM
- `/dashboard/css/kit-ir.css` - Estilos do Kit IR
- `/dashboard/css/pagamentos.css` - Estilos de pagamentos
- `/dashboard/css/comissoes.css` - Estilos de comissões
- `/dashboard/css/financeiro.css` - Estilos do financeiro
- `/dashboard/css/login.css` - Estilos do login

### Frontend (Landing Page)
- `/frontend/index.html` - Formulário de captação de leads
- `/frontend/css/style.css` - Estilos da landing page
- `/frontend/css/resultado.css` - Estilos do resultado
- `/frontend/js/app.js` - Lógica principal
- `/frontend/js/resultado.js` - Lógica do resultado

### Backend (Python)
- `/server/src/services/pdfEncarte.py` - Geração de encartes PDF
- `/server/src/services/pdfEsclarecimentos.py` - PDF de Esclarecimentos
- `/server/src/services/pdfPlanilhaRT.py` - PDF da Planilha RT
- `/server/src/services/pdfGerador.py` - Gerador de PDFs
- `/server/src/services/pdfMontadorKitIR.py` - Montador do Kit IR

### Assets
- `/assets/logo_ir360.jpg` - Logo IR360
- `/assets/logo_e_restituicao.jpg` - Logo e-Restituição
- `/assets/logo_ir360_rodape.png` - Logo rodapé

### Documentação
- `/todo.md` - Lista de tarefas e status
- `/ESPECIFICACOES_DASHBOARD.md` - Especificações do dashboard
- `/ESTRUTURA_KIT_IR.md` - Estrutura do Kit IR
- `/MAPEAMENTO_CAMPOS_PDF_COMPLETO.md` - Mapeamento de campos PDF
- `/FORMULAS_CALCULO_PDF.md` - Fórmulas de cálculo

## Funcionalidades Validadas

1. ✅ Dashboard com cards de resumo
2. ✅ Cadastro de clientes com TAB inteligente
3. ✅ Campos: Número de Meses, Valor de INSS
4. ✅ Alvarás, DARFs, Honorários dinâmicos
5. ✅ CRM com pipeline de vendas
6. ✅ Kit IR com dropdown de encartes
7. ✅ Pagamentos com filtros e exportação
8. ✅ Comissões para Parceiros
9. ✅ Financeiro com receitas e despesas
10. ✅ Encartes PDF (Planilha RT, Esclarecimentos, etc.)

## Observações

- Este backup contém todos os arquivos validados até 25/01/2026
- O motor de cálculos está funcional
- Os PDFs de encartes estão funcionando
- A integração com Asaas está configurada (mas precisa de chave de produção)
