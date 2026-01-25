# MAPEAMENTO COMPLETO DOS CAMPOS DOS PDFs

## Origem dos Dados

Os campos dos PDFs vêm de **3 fontes**:
1. **CADASTRO** - Dados informados pelo cliente no formulário
2. **PROCESSO** - Dados do processo judicial
3. **MOTOR DE CÁLCULO** - Valores calculados automaticamente pelo sistema

---

## PDF ESCLARECIMENTOS

### Cabeçalho
| Campo | Origem | Variável no Sistema |
|-------|--------|---------------------|
| CONTRIBUINTE (Nome) | CADASTRO | `cliente.nome` |
| CPF | CADASTRO | `cliente.cpf` |
| DATA DE NASCIMENTO | CADASTRO | `cliente.data_nascimento` |
| DIRPF (Ano) | MOTOR DE CÁLCULO | `calculo.ano_dirpf` |

### A) DADOS DA AÇÃO
| Campo | Origem | Variável no Sistema |
|-------|--------|---------------------|
| Número do Processo | PROCESSO | `processo.numero` |
| Vara do Trabalho | PROCESSO | `processo.vara` |

### B) VALORES E DATAS
| Item | Campo | Origem | Variável no Sistema |
|------|-------|--------|---------------------|
| 2 | Valor total levantado (exercício) | **MOTOR DE CÁLCULO** | `calculo.valor_total_exercicio` |
| 3 | Imposto de renda retido | **MOTOR DE CÁLCULO** | `calculo.imposto_retido_fonte` |
| 3 | Nome da Fonte Pagadora | PROCESSO | `fonte.nome` |
| 3 | CNPJ da Fonte | PROCESSO | `fonte.cnpj` |
| 4 | Valor bruto da ação | **MOTOR DE CÁLCULO** | `calculo.valor_bruto_acao` |
| 5 | Valor atualizado RT | **MOTOR DE CÁLCULO** | `calculo.valor_atualizado_rt` |
| 5 | Percentual RT | **MOTOR DE CÁLCULO** | `calculo.percentual_rt` |
| 6 | Despesas dedutíveis | **MOTOR DE CÁLCULO** | `calculo.despesas_dedutiveis` |

### Tabela RRA DIRPF
| Campo | Origem | Variável no Sistema |
|-------|--------|---------------------|
| A) Rendimentos Tributáveis Recebidos | **MOTOR DE CÁLCULO** | `calculo.rra_rendimentos_tributaveis` |
| B) INSS Reclamante | **MOTOR DE CÁLCULO** | `calculo.rra_inss_reclamante` |
| C) Imposto de Renda Retido na Fonte | **MOTOR DE CÁLCULO** | `calculo.rra_imposto_retido` |
| D) Nº de Meses Discutidos na Ação | **MOTOR DE CÁLCULO** | `calculo.rra_meses_discutidos` |

### Ficha de Rendimentos Isentos
| Campo | Origem | Variável no Sistema |
|-------|--------|---------------------|
| Rendimentos Isentos | **MOTOR DE CÁLCULO** | `calculo.rendimentos_isentos` |

---

## PDF PLANILHA RT (Demonstrativo de Apuração)

### Dados do Contribuinte
| Campo | Origem | Variável no Sistema |
|-------|--------|---------------------|
| Nome do Cliente | CADASTRO | `cliente.nome` |
| CPF | CADASTRO | `cliente.cpf` |
| Data de Nascimento | CADASTRO | `cliente.data_nascimento` |

### Dados do Processo
| Campo | Origem | Variável no Sistema |
|-------|--------|---------------------|
| Nº Processo | PROCESSO | `processo.numero` |
| Comarca | PROCESSO | `processo.comarca` |
| Vara | PROCESSO | `processo.vara` |

### Itens 1-3 (Valores da Causa)
| Item | Campo | Origem | Variável no Sistema |
|------|-------|--------|---------------------|
| 1 | Total de Rendimentos Retirado pelo Autor | **MOTOR DE CÁLCULO** | `calculo.item1_rendimentos_autor` |
| 2 | Total de DARF Paga | **MOTOR DE CÁLCULO** | `calculo.item2_darf_paga` |
| 3 | Total da Causa | **MOTOR DE CÁLCULO** | `calculo.item3_total_causa` |

### Itens 4-10 (Apuração dos Rendimentos Isentos)
| Item | Campo | Origem | Variável no Sistema |
|------|-------|--------|---------------------|
| 4 | Rendimentos Bruto Homologado/Atualizado | **MOTOR DE CÁLCULO** | `calculo.item4_rendimentos_bruto` |
| 5 | Rendimentos Tributáveis Calculados na Mesma Data Base | **MOTOR DE CÁLCULO** | `calculo.item5_rt_calculados` |
| 6 | Proporção de Rendimentos Tributáveis | **MOTOR DE CÁLCULO** | `calculo.item6_proporcao_rt` |
| 7 | Total de Rendimentos Isentos | **MOTOR DE CÁLCULO** | `calculo.item7_rendimentos_isentos` |
| 8 | Rendimentos Sujeitos à Tributação Normal | **MOTOR DE CÁLCULO** | `calculo.item8_rt_normal` |
| 9 | Total de Despesas Pagas com Advogado, Perito e Custas | **MOTOR DE CÁLCULO** | `calculo.item9_despesas_totais` |
| 10 | Proporção a Deduzir de Despesas Pagas | **MOTOR DE CÁLCULO** | `calculo.item10_proporcao_despesas` |

### Itens 11-18 (Valores Esperados da Declaração)
| Item | Campo | Origem | Variável no Sistema |
|------|-------|--------|---------------------|
| 11 | CNPJ | PROCESSO | `fonte.cnpj` |
| 12 | Fonte Pagadora | PROCESSO | `fonte.nome` |
| 13 | Rendimentos Tributáveis | **MOTOR DE CÁLCULO** | `calculo.item13_rendimentos_tributaveis` |
| 14 | Contribuição Previdência Oficial (INSS) | **MOTOR DE CÁLCULO** | `calculo.item14_inss` |
| 15 | Imposto de Renda Retido na Fonte | **MOTOR DE CÁLCULO** | `calculo.item15_irrf` |
| 16 | Mês do Recebimento | PROCESSO | `calculo.mes_recebimento` |
| 17 | Meses Discutidos na Ação | **MOTOR DE CÁLCULO** | `calculo.meses_discutidos` |
| 18 | Rendimentos Isentos e Não Tributáveis | **MOTOR DE CÁLCULO** | `calculo.item18_rendimentos_isentos` |

---

## RESUMO POR ORIGEM

### CADASTRO (6 campos)
- Nome do Cliente
- CPF
- Data de Nascimento

### PROCESSO (7 campos)
- Número do Processo
- Comarca
- Vara
- CNPJ da Fonte Pagadora
- Nome da Fonte Pagadora
- Mês do Recebimento

### MOTOR DE CÁLCULO (26 campos)
- Ano DIRPF
- Valor total do exercício
- Imposto retido na fonte
- Valor bruto da ação
- Valor atualizado RT
- Percentual RT
- Despesas dedutíveis
- Rendimentos Tributáveis RRA
- INSS Reclamante
- Imposto Retido RRA
- Meses Discutidos
- Rendimentos Isentos
- Itens 1-10 da Planilha RT
- Itens 13-18 da Planilha RT

---

## CORRESPONDÊNCIA COM MOTOR DE CÁLCULO

Os valores do motor de cálculo são gerados a partir da planilha de cálculo que processa:
1. **Dados de entrada:** Valores da ação, datas, alvarás
2. **Tabelas de IR:** Tabelas progressivas por ano
3. **Cálculo de meses:** Período da ação judicial
4. **Proporção RT:** Percentual de rendimentos tributáveis
5. **Rendimentos Isentos:** Valores não tributáveis

O motor já calcula todos esses valores e os disponibiliza para preenchimento dos PDFs.
