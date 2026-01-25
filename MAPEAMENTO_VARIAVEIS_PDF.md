# 📋 MAPEAMENTO DE VARIÁVEIS - PDFs de Restituição

**Data:** 25/01/2026  
**Objetivo:** Mapear todas as variáveis que precisam ser preenchidas dinamicamente nos PDFs

---

## 📄 PDF 1: ESCLARECIMENTOS

### Cabeçalho
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Logo | `{{logo_erestituicao}}` | Imagem fixa |
| Ano DIRPF | `{{ano_dirpf}}` | 2021 |

### Dados do Contribuinte
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Nome | `{{cliente_nome}}` | JOSE RAMOS CONCEIÇÃO |
| CPF | `{{cliente_cpf}}` | 003.003.987-86 |
| Data Nascimento | `{{cliente_data_nascimento}}` | 25/08/1969 |

### A) Dados da Ação
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Número Processo | `{{processo_numero}}` | 0001971-78.2015.5.17.0007 |
| Vara | `{{processo_vara}}` | 7ª Vara do Trabalho de Vitória-ES |

### B) Valores e Datas
| Item | Campo | Variável | Exemplo |
|------|-------|----------|---------|
| 2 | Valor total exercício | `{{valor_total_exercicio}}` | R$ 2.533.329,85 |
| 3 | Imposto retido | `{{imposto_retido_fonte}}` | R$ 220.597,31 |
| 3 | CNPJ Fonte | `{{fonte_cnpj}}` | 33.592.510/0001-54 |
| 3 | Nome Fonte | `{{fonte_nome}}` | Reclamada Vale S.A. |
| 4 | Valor bruto ação | `{{valor_bruto_acao}}` | R$ 2.535.815,36 |
| 5 | Valor atualizado RT | `{{valor_atualizado_rt}}` | R$ 986.553,89 |
| 5 | Percentual RT | `{{percentual_rt}}` | 38,9048% |
| 6 | Despesas dedutíveis | `{{despesas_dedutiveis}}` | R$ 270.221,85 |

### Tabela RRA DIRPF
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Rendimentos Tributáveis | `{{rra_rendimentos_tributaveis}}` | R$ 716.332,04 |
| INSS Reclamante | `{{rra_inss_reclamante}}` | R$ 0,00 |
| Imposto Retido Fonte | `{{rra_imposto_retido}}` | R$ 220.597,31 |
| Nº Meses Discutidos | `{{rra_meses_discutidos}}` | 58,00 |

### Ficha Rendimentos Isentos
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Rendimentos Isentos | `{{rendimentos_isentos}}` | R$ 1.460.122,49 |

---

## 📊 PDF 2: PLANILHA RT (Demonstrativo de Apuração)

### Cabeçalho
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Logo | `{{logo_ir360}}` | Imagem fixa |
| Ano DIRPF | `{{ano_dirpf}}` | 2021 |

### Dados do Contribuinte
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Nome do Cliente | `{{cliente_nome}}` | JOSE RAMOS CONCEIÇÃO |
| CPF | `{{cliente_cpf}}` | 003.003.987-86 |
| Data de Nascimento | `{{cliente_data_nascimento}}` | 25/08/1969 |

### Dados do Processo
| Campo | Variável | Exemplo |
|-------|----------|---------|
| Nº Processo | `{{processo_numero}}` | 0001971-78.2015.5.17.0007 |
| Comarca | `{{processo_comarca}}` | Vitória-ES |
| Vara | `{{processo_vara_numero}}` | 7a. Vara do Trabalho |

### Valores da Causa (Itens 1-3)
| Item | Campo | Variável | Exemplo |
|------|-------|----------|---------|
| 1 | Total Rendimentos Retirado pelo Autor | `{{item1_rendimentos_autor}}` | 2.315.218,05 |
| 2 | Total de DARF Paga | `{{item2_darf_paga}}` | 220.597,31 |
| 3 | **TOTAL DA CAUSA** | `{{item3_total_causa}}` | **2.535.815,36** |

### Apuração dos Rendimentos Isentos (Itens 4-10)
| Item | Campo | Variável | Exemplo |
|------|-------|----------|---------|
| 4 | Rendimentos Bruto Homologado/Atualizado | `{{item4_rendimentos_bruto}}` | 2.533.329,85 |
| 5 | Rendimentos Tributáveis Calculados na Mesma Data Base | `{{item5_rt_calculados}}` | 985.527,96 |
| 6 | Proporção de Rendimentos Tributáveis | `{{item6_proporcao_rt}}` | 38,9048% |
| 7 | Total de Rendimentos Isentos | `{{item7_rendimentos_isentos}}` | 1.549.260,42 |
| 8 | Rendimentos Sujeitos à Tributação Normal | `{{item8_rt_normal}}` | 986.554,94 |
| 9 | Total de Despesas Pagas com Advogado, Perito e Custas | `{{item9_despesas_totais}}` | 694.572,02 |
| 10 | Proporção a Deduzir de Despesas Pagas | `{{item10_proporcao_despesas}}` | 270.222,14 |

### Valores Esperados da Declaração (Itens 11-18)
| Item | Campo | Variável | Exemplo |
|------|-------|----------|---------|
| 11 | CNPJ | `{{item11_cnpj}}` | 33.592.510/0001-54 |
| 12 | Fonte Pagadora | `{{item12_fonte_pagadora}}` | VALE S/A |
| 13 | Rendimentos Tributáveis | `{{item13_rendimentos_tributaveis}}` | 716.332,80 |
| 14 | Contribuição Previdência Oficial (INSS) | `{{item14_inss}}` | - (vazio ou valor) |
| 15 | Imposto de Renda Retido na Fonte | `{{item15_irrf}}` | 220.597,31 |
| 16 | Mês do Recebimento | `{{item16_mes_recebimento}}` | DEZEMBRO |
| 17 | Meses Discutidos na Ação | `{{item17_meses_acao}}` | 58,00 |
| 18 | Rendimentos Isentos e Não Tributáveis | `{{item18_rendimentos_isentos}}` | 1.549.260,42 |

---

## 🔗 ORIGEM DAS VARIÁVEIS (Motor de Cálculo)

As variáveis acima são preenchidas a partir dos seguintes dados do sistema:

### Dados do Cliente (Cadastro)
```javascript
cliente = {
    nome: "JOSE RAMOS CONCEIÇÃO",
    cpf: "003.003.987-86",
    dataNascimento: "25/08/1969",
    email: "jose@email.com",
    telefone: "(11) 99999-1234"
}
```

### Dados do Processo (Cadastro)
```javascript
processo = {
    numero: "0001971-78.2015.5.17.0007",
    comarca: "Vitória-ES",
    vara: "7a. Vara do Trabalho",
    fontePagadora: {
        cnpj: "33.592.510/0001-54",
        nome: "VALE S/A"
    }
}
```

### Dados do Cálculo (Motor de Cálculo)
```javascript
calculo = {
    anoDirpf: 2021,
    mesRecebimento: "DEZEMBRO",
    mesesDiscutidos: 58,
    
    // Valores da Causa
    rendimentosAutor: 2315218.05,
    darfPaga: 220597.31,
    totalCausa: 2535815.36,
    
    // Apuração RT
    rendimentosBruto: 2533329.85,
    rtCalculados: 985527.96,
    proporcaoRT: 38.9048,
    rendimentosIsentos: 1549260.42,
    rtNormal: 986554.94,
    despesasTotais: 694572.02,
    proporcaoDespesas: 270222.14,
    
    // Valores Declaração
    rendimentosTributaveis: 716332.80,
    inss: 0,
    irrf: 220597.31,
    
    // Valor Final a Restituir
    valorRestituir: 74028.67
}
```

---

## ✅ TOTAL DE VARIÁVEIS MAPEADAS

| Documento | Quantidade |
|-----------|------------|
| Esclarecimentos | 18 variáveis |
| Planilha RT | 21 variáveis |
| **Total Único** | **~25 variáveis** (algumas compartilhadas) |

---

## 📝 OBSERVAÇÕES

1. Os valores monetários devem ser formatados com R$ e separadores de milhar
2. Percentuais devem ter 4 casas decimais (ex: 38,9048%)
3. Meses devem ser em MAIÚSCULAS (DEZEMBRO)
4. CPF deve manter a máscara (000.000.000-00)
5. CNPJ deve manter a máscara (00.000.000/0000-00)
