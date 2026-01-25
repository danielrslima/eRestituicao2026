# FÓRMULAS DE CÁLCULO DOS CAMPOS DOS PDFs

## PLANILHA RT - Fórmulas dos Itens

### Itens 1-3 (Valores da Causa)
| Item | Campo | Fórmula |
|------|-------|---------|
| 1 | Total de Rendimentos Retirado pelo Autor | Entrada (valor dos alvarás) |
| 2 | Total de DARF Paga | Entrada (IR retido na fonte) |
| 3 | Total da Causa | `Item 1 + Item 2` |

### Itens 4-10 (Apuração dos Rendimentos Isentos)
| Item | Campo | Fórmula |
|------|-------|---------|
| 4 | Rendimentos Bruto Homologado/Atualizado | Entrada (valor bruto atualizado) |
| 5 | Rendimentos Tributáveis Calculados na Mesma Data Base | Calculado pelo motor |
| 6 | Proporção de Rendimentos Tributáveis | `(Item 5 / Item 4) × 100` |
| 7 | Total de Rendimentos Isentos | `Item 4 - Item 5` |
| 8 | Rendimentos Sujeitos à Tributação Normal | `Item 3 × (Item 6 / 100)` |
| 9 | Total de Despesas Pagas com Advogado, Perito e Custas | Entrada (honorários + custas) |
| **10** | **Proporção a Deduzir de Despesas Pagas** | **`Item 9 × (Item 6 / 100)`** |

### Itens 11-18 (Valores Esperados da Declaração)
| Item | Campo | Fórmula |
|------|-------|---------|
| 11 | CNPJ | Entrada (dados do processo) |
| 12 | Fonte Pagadora | Entrada (dados do processo) |
| **13** | **Rendimentos Tributáveis** | **`Item 8 - Item 10`** |
| 14 | Contribuição Previdência Oficial (INSS) | Entrada (se houver) |
| 15 | Imposto de Renda Retido na Fonte | `= Item 2` |
| 16 | Mês do Recebimento | Entrada (dados do processo) |
| 17 | Meses Discutidos na Ação | Calculado pelo motor |
| 18 | Rendimentos Isentos e Não Tributáveis | `Item 7` ou calculado |

---

## ESCLARECIMENTOS - Correspondência com Planilha RT

| Campo Esclarecimentos | Origem |
|-----------------------|--------|
| Item 2 - Valor total exercício | Entrada |
| Item 3 - IR retido | `= Planilha Item 2` |
| Item 4 - Valor bruto ação | `= Planilha Item 3` |
| Item 5 - Valor atualizado RT | `= Planilha Item 8` |
| Item 5 - Percentual RT | `= Planilha Item 6` |
| Item 6 - Despesas dedutíveis | `= Planilha Item 10` |
| **A) Rendimentos Tributáveis Recebidos** | **`= Planilha Item 13`** |
| B) INSS Reclamante | `= Planilha Item 14` |
| C) IR Retido na Fonte | `= Planilha Item 15` |
| D) Meses Discutidos | `= Planilha Item 17` |
| **Rendimentos Isentos** | **`= Planilha Item 18`** |

---

## EXEMPLO DE CÁLCULO (Ana Carmen 2022)

### Dados de Entrada:
- Item 1 (Rendimentos Autor): R$ 45.000,00
- Item 2 (DARF Paga): R$ 4.500,00
- Item 4 (Rendimentos Bruto): R$ 45.000,00
- Item 5 (RT Calculados): R$ 16.363,64
- Item 9 (Despesas Totais): R$ 13.500,00

### Cálculos:
- Item 3 = 45.000 + 4.500 = **R$ 49.500,00**
- Item 6 = (16.363,64 / 45.000) × 100 = **36,3636%**
- Item 7 = 45.000 - 16.363,64 = **R$ 28.636,36**
- Item 8 = 49.500 × 0,363636 = **R$ 18.000,00**
- **Item 10 = 13.500 × 0,363636 = R$ 4.909,09**
- **Item 13 = 18.000 - 4.909,09 = R$ 13.090,91**
- Item 18 = Item 7 = **R$ 28.636,36**

### Esclarecimentos:
- A) Rendimentos Tributáveis = **R$ 13.090,91** (= Item 13)
- Rendimentos Isentos = **R$ 28.636,36** (= Item 18)
