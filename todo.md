# TODO - Projeto e-Restituição IA

## Última Atualização: 25/01/2026 - 16:10 (Horário de Brasília)

---

## ✅ MÓDULOS VALIDADOS E BLINDADOS (NÃO ALTERAR)

### Motor de Cálculo - BLINDADO ✅
- [x] Cálculo de IRPF por exercício
- [x] Casos José Ramos (+R$ 74.028,67) e Ana Carmen (+R$ 26.604,54) validados
- [x] Proporcionalização de DARFs e honorários
- [x] Deflação por índices IPCA-E

### Validações e Máscaras - BLINDADO ✅
- [x] CPF com dígitos verificadores
- [x] CNPJ com dígitos verificadores
- [x] Formatação de nomes, comarca, fonte pagadora
- [x] Máscaras de processo, datas, valores

### Comportamento Tab - BLINDADO ✅
- [x] Navegação inteligente entre campos
- [x] TAB inteligente no cadastro de clientes (Alvarás, DARFs, Honorários)

### Modal de Confirmação - BLINDADO ✅
- [x] Resumo antes de calcular

---

## ✅ TELAS DE RESULTADO - VALIDADAS (25/01/2026 - 11:26)

### Tela 1 - Resultado Inicial (DESCUBRA SEU VALOR) ✅
- [x] 🎉🎉🎉 Três confetes (positivo)
- [x] 🔎🔎 Duas lupas (negativo)
- [x] Mensagens corretas (positivo/negativo)
- [x] Card "DESCUBRA SEU VALOR" - R$ 5,99
- [x] Valor OCULTO até pagamento

### Tela 2 - Após Pagamento Básico (FAÇA VOCÊ MESMO) ✅
- [x] Valor REVELADO
- [x] Detalhamento por exercício
- [x] Card com ABATIMENTO:
  - ~~De: R$ 15,99~~ (riscado)
  - 🎁 "Você já pagou R$ 5,99 - Desconto aplicado!"
  - **Por apenas: R$ 10,00**
- [x] OBS sobre 08 dias

### Tela 3 - Após Pagamento Kit IR (ESPECIALISTA) ✅
- [x] SEM confetes, parabéns e valor
- [x] Mensagem sobre KIT IR (fonte 22px)
- [x] ⚠️ Aviso de SPAM
- [x] Card Especialista → WhatsApp (+55 11 94113-9391)
- [x] OBS sobre atendimento

---

## ✅ INTEGRAÇÃO DE PAGAMENTOS - VALIDADA (25/01/2026)

### Asaas ✅
- [x] API Key configurada (produção)
- [x] PIX funcionando
- [x] Cartão funcionando
- [x] Abatimento de valor funcionando (R$ 10,00)
- [x] Webhook configurado

---

## ✅ DASHBOARD - VALIDADO (25/01/2026 - 07:15)

### Login ✅
- [x] 3 níveis de acesso (Admin, Funcionário, Parceiro)
- [x] Autenticação funcionando

### Tela Principal ✅
- [x] Métricas e resumo
- [x] Logo e-Restituição ajustado

### Clientes ✅
- [x] Cadastro com máscaras (telefone, CEP)
- [x] Telefones como arrays dinâmicos
- [x] Ordem: Dados Pessoais → Endereço → Telefones
- [x] Botões Ver/Imprimir PDFs e Enviar ao Cliente
- [x] **Campo Número de Meses** - Adicionado (essencial para cálculo)
- [x] **Campo Valor de INSS** - Adicionado
- [x] **TAB inteligente** - Alvarás, DARFs, Honorários dinâmicos
- [x] **Cursor vai para início** ao clicar "Próximos Dados"
- [x] **Campo Indicado por** - Vincula cliente ao parceiro/vendedor para apuração de comissão
- [x] **Data de Inclusão** - Coluna com data e hora do cadastro
- [x] **Ordenação alfabética** - Todas as listas de clientes ordenadas

### CRM ✅
- [x] Kanban com 7 colunas de status
- [x] Modal de detalhes
- [x] Alteração de status
- [x] **Ordem corrigida**: Kit Enviado → Contrato (antes estava invertido)

### Pagamentos ✅ (NOVO)
- [x] Cards de resumo (Total Recebido, Pagamentos, Pendentes, Confirmados)
- [x] Filtros (Período, Status, Tipo, Produto, Busca)
- [x] Lista de pagamentos com detalhes
- [x] Exportar CSV
- [x] Modal de detalhes do pagamento

### Comissões (Parceiro) ✅ (NOVO)
- [x] Cards de resumo (Total, Pagas, Pendentes, Indicados)
- [x] Informações do parceiro (Nome, Código, Taxa, Link de Indicação)
- [x] Filtros (Período, Status, Busca)
- [x] Lista de clientes indicados com comissões
- [x] Histórico de pagamentos ao parceiro
- [x] Exportar CSV

### Financeiro ✅
- [x] Cards de resumo (Receitas, Despesas, Saldo, Comissões)
- [x] Abas (Receitas, Despesas, Relatórios)
- [x] Dados mock funcionando

### PDFs - VALIDADOS ✅
- [x] Esclarecimentos - Layout fiel ao original
- [x] Planilha RT - Layout fiel ao original (título atualizado)
- [x] Logo e-Restituição centralizado
- [x] Logo IR360 no rodapé
- [x] R$ em todos os valores
- [x] Cálculos corretos (Item 10, 13, 18)
- [x] Multi-exercícios (1 PDF por exercício)

### Encarte - VALIDADOS ✅
- [x] Logo e-Restituição no topo (8cm)
- [x] Título centralizado com espaçamento 80pt
- [x] Endereço CJ.51, WhatsApp (11) 93713-9391
- [x] Logo IR360 no rodapé direito
- [x] Sem logo colorido (círculos removidos)
- [x] **Planilha RT** - Título alterado para "PLANILHA DE APURAÇÃO DE RENDIMENTO TRIBUTÁVEL"

### Kit IR - VALIDADO ✅
- [x] Montador funcional
- [x] Compressão 150 PPI
- [x] Divisão automática 15MB
- [x] Nomenclatura: DocumentosRRAAcaoTrabalhista.pdf
- [x] **Seleção de encarte** - Dropdown com busca (escalável para 100+ templates)
- [x] **Preview do encarte** - Mostra encarte selecionado antes de confirmar

---

## ⏳ PENDENTE / AJUSTES

### 1. Kit IR - Integração Backend
- [ ] Integrar com backend Python para geração automática de PDFs (Auto)

### 2. Financeiro
- [ ] Integrar dados reais (quando tiver banco de dados)

### 3. Relatórios
- [x] Tela de relatórios criada (25/01/2026)

### 4. Usuários - ATUALIZADA (25/01/2026 - 15:30)
- [x] Tela de gerenciamento de usuários criada
- [x] **Campos de comissão individual** no cadastro de parceiro/operador:
  - Código do Parceiro/Vendedor
  - Tipo de Comissão (Percentual / Valor Fixo / Sem Comissão)
  - Valor da comissão
  - Produtos com comissão (Básico, Kit IR, Contrato)
  - Chave PIX para pagamento

### 5. Configurações - CRIADA (25/01/2026 - 15:00)
- [x] Página de configurações criada
- [x] Seções: Empresa, Sistema, Pagamentos, Backup
- [x] CSS e JavaScript funcionando
- [x] Navegação entre seções

### 6. Página de Cálculos - CRIADA (25/01/2026 - 11:48)
- [x] Busca de cliente por nome ou CPF
- [x] Carregamento automático dos dados do cadastro
- [x] Campos: Processo, Valores Homologados, Alvarás, DARFs, Honorários
- [x] Integração com API do motor de cálculo validado
- [x] Identificação automática: mesmo-ano vs multi-anos
- [x] Exibição do resultado com detalhamento
- [x] Botões: Salvar no Cadastro, Gerar PDFs, Novo Cálculo
- [x] Histórico de cálculos recentes
- [x] Casos validados: José Ramos (mesmo-ano, R$ 74.028,67), Ana Carmen (multi-anos, R$ 26.604,54)
- [ ] Integrar com API real (quando disponível)

### 7. Página de Contratos (FUTURO)
- [ ] Subir modelos padrão de contrato
- [ ] Preencher dados automaticamente do cliente
- [ ] Opção 1: Assinatura eletrônica (integração futura)
- [ ] Opção 2: Gerar PDF para enviar por e-mail
- [ ] Opção 3: Imprimir para assinatura presencial

### 8. Backup Automático Diário (FUTURO)
- [ ] Implementar backup automático diário
- [ ] Salvar em 2 ambientes diferentes:
  - GitHub (repositório)
  - Google Drive ou servidor externo
- [ ] Definir melhor forma de implementação

---

## 📁 ARQUIVOS DO PROJETO

### Frontend (Site Público)
| Arquivo | Descrição | Status |
|---------|-----------|--------|
| frontend/index.html | Página principal | ✅ |
| frontend/css/style.css | Estilos principais | ✅ |
| frontend/css/resultado.css | Estilos resultado | ✅ |
| frontend/js/app.js | Script principal | ✅ |
| frontend/js/resultado.js | Módulo resultado | ✅ |

### Dashboard
| Arquivo | Descrição | Status |
|---------|-----------|--------|
| dashboard/login.html | Tela de login | ✅ |
| dashboard/index.html | Tela principal | ✅ |
| dashboard/clientes.html | Gestão de clientes | ✅ |
| dashboard/crm.html | CRM Kanban | ✅ |
| dashboard/kit-ir.html | Kit IR / PDFs | ✅ |
| dashboard/pagamentos.html | Pagamentos | ✅ |
| dashboard/comissoes.html | Comissões parceiro | ✅ |
| dashboard/financeiro.html | Controle financeiro | ✅ |

### Backend (Python - PDFs)
| Arquivo | Descrição | Status |
|---------|-----------|--------|
| server/src/services/pdfEsclarecimentos.py | Gerador Esclarecimentos | ✅ VALIDADO |
| server/src/services/pdfPlanilhaRT.py | Gerador Planilha RT | ✅ VALIDADO |
| server/src/services/pdfEncarte.py | Gerador Encarte | ✅ VALIDADO |
| server/src/services/pdfGerador.py | Gerador em lote | ✅ VALIDADO |
| server/src/services/pdfMontadorKitIR.py | Montador Kit IR | ✅ VALIDADO |

### Assets
| Arquivo | Descrição | Status |
|---------|-----------|--------|
| assets/logo_e_restituicao.jpg | Logo e-Restituição | ✅ |
| assets/logo_ir360.png | Logo IR360 | ✅ |

---

## 💾 BACKUP DE RESTAURAÇÃO

**Arquivo:** `restituicaoia_completo_25012026_1330.zip`
**Localização:** `/home/ubuntu/`
**Data:** 25/01/2026 - 13:30
**Conteúdo:** Todo o projeto (código, assets, documentação, templates)

### Como Restaurar:
```bash
cd /home/ubuntu
mv restituicaoia restituicaoia_old
tar -xzvf restituicaoia_backup_validado_20260125.tar.gz
cd restituicaoia && python3 -m http.server 8081
```

---

## 🔧 COMANDOS

### Analisar projeto:
```
Analise minuciosamente tudo o que foi feito nas últimas 48 horas no projeto e-Restituição IA. Revise todos os arquivos, checkpoints e validações. Responda o que entendeu sobre o projeto, quais passos já foram dados e em que momento estamos.
```

### Continuar implementação:
```
Continue a implementação do projeto e-Restituição IA. O motor de cálculo, PDFs, encarte, Kit IR, Pagamentos, Comissões e Financeiro estão validados. Ajuste os itens pendentes: integração com backend Python, relatórios, usuários e configurações.
```

---

## 🔒 REGRAS DE BLINDAGEM

1. **NÃO alterar** o motor de cálculo sem consentimento
2. **NÃO alterar** casos validados (José Ramos, Ana Carmen)
3. **NÃO alterar** validações e máscaras já validadas
4. **NÃO alterar** telas de resultado já aprovadas
5. **NÃO alterar** PDFs validados (Esclarecimentos, Planilha RT, Encarte)
6. Qualquer alteração deve ser justificada e aprovada
