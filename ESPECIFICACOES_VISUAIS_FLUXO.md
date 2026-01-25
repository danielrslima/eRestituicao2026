# ESPECIFICAÇÕES VISUAIS DO FLUXO DO SITE - e-Restituição IA

## Última Atualização: 25/01/2026 - 09:00 (Horário de Brasília)

---

## 📌 REFERÊNCIAS DE IMAGENS ANALISADAS

| ID | Arquivo | Descrição |
|----|---------|-----------|
| IMG-01 | pasted_file_1RNWXt_image.png | Tela de resultado atual (a manter parcialmente) |
| IMG-02 | Capturadetela2026-01-06011010.png | Tela antiga - Resultado inicial |
| IMG-03 | Capturadetela2026-01-06011121.png | Tela antiga - Método de pagamento |
| IMG-04 | Capturadetela2026-01-06011321.png | Tela antiga - Modal "Cobrança criada" |
| IMG-05 | Capturadetela2026-01-06011408.png | Tela Asaas - Pagamento PIX |
| IMG-06 | Capturadetela2026-01-06011423.png | Tela antiga - Modal após pagamento |
| IMG-07 | Capturadetela2026-01-06011544.png | Tela Asaas - Pagamento confirmado |
| IMG-08 | Capturadetela2026-01-06011618.png | Tela antiga - Após pagamento Kit IR |
| IMG-09 | Capturadetela2026-01-06011816.png | Tela antiga - Opção Especialista |
| IMG-10 | Capturadetela2026-01-06012011.png | Tela WhatsApp - Contato Especialista |

---

## ✅ O QUE MANTER (IMG-01)

Da tela atual (IMG-01), o cliente gostou e deseja **MANTER**:

1. **Logo e-Restituição** no topo
2. **Subtítulo:** "Descubra o quanto você pode recuperar de imposto"
3. **Steps de navegação:** 1-Dados Pessoais, 2-Dados do Processo, 3-Valores e Alvarás, 4-Resultado
4. **Ícone de celebração** (emoji de festa)
5. **Mensagem:** "Parabéns! Você tem valor a restituir!"
6. **Valor em destaque verde:** "+ R$ 53.727,39"
7. **Texto explicativo:** "Este é o valor total que você pode recuperar de imposto de renda retido na fonte."

---

## 🔄 O QUE ALTERAR

### 1. Detalhamento por Exercício
- **ANTES:** Mostrava tabela completa com RT, IRRF, IR Devido, IRPF
- **AGORA:** Mostrar **APENAS** valores a restituir/pagar de cada exercício
- **FORMATO:**
  ```
  Exercício 2022: - R$ 14.954,27 (Pagar)
  Exercício 2023: + R$ 20.196,88 (Restituir)
  Exercício 2025: + R$ 21.361,93 (Restituir)
  ```

### 2. Plano Básico - "DESCUBRA SEU VALOR"
- **Nome do plano:** "DESCUBRA SEU VALOR" (não mais "Faça Você Mesmo")
- **Preço TESTE:** R$ 5,99
- **Preço PRODUÇÃO:** Entre R$ 29,90 e R$ 49,90
- **Design:** Mais chamativo, vívido, que incentive o lead a dar o primeiro passo
- **Botão:** "Clique aqui para continuar" ou similar

### 3. Design Geral
- **Mais vívido e chamativo** que a versão antiga
- **Cores mais vibrantes** para chamar atenção
- **Call-to-action mais destacado**
- **Não copiar exatamente** o layout antigo, mas usar como referência

---

## 📋 FLUXO VISUAL DETALHADO

### TELA 1: Resultado Inicial (Antes do Pagamento)

```
┌─────────────────────────────────────────────────────────────────┐
│                      [LOGO e-Restituição]                       │
│                                                                 │
│        Descubra o quanto você pode recuperar de imposto         │
│                                                                 │
│  [1 Dados Pessoais] [2 Dados do Processo] [3 Valores] [4 Result]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                          🎉                                     │
│                                                                 │
│            Parabéns! Você tem valor a restituir!                │
│                                                                 │
│                  (VALOR OCULTO AQUI)                            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │              🔍 DESCUBRA SEU VALOR                       │   │
│   │                                                         │   │
│   │     Descubra agora quanto você pode recuperar           │   │
│   │     de imposto de renda retido na fonte!                │   │
│   │                                                         │   │
│   │                    R$ 5,99                              │   │
│   │                  (teste)                                │   │
│   │                                                         │   │
│   │     👉 [  DESCOBRIR AGORA  ]                            │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Características:**
- Valor total **NÃO aparece** ainda
- Quadrado do plano básico bem **destacado e chamativo**
- Cores vibrantes (verde, laranja, gradientes)
- Botão grande e convidativo

---

### TELA 2: Método de Pagamento (Plano Básico)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              Escolha o método de pagamento:                     │
│                                                                 │
│              Plano selecionado: DESCUBRA SEU VALOR              │
│              Checkout: R$ 5,99                                  │
│                                                                 │
│              [◆ PIX]    [💳 Cartão]    [ Pagar → ]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### TELA 3: Modal - Cobrança Criada

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              restituicaoia.com.br diz                           │
│                                                                 │
│    Cobrança criada! Uma nova aba foi aberta para pagamento.     │
│                                                                 │
│                                          [ OK ]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### TELA 4: Asaas - Pagamento PIX

**Abre em nova aba** com:
- Logo IR360
- Dados da empresa (IRDL PARTICIPACOES CONSULTORIA E SERVICOS LTDA)
- Dados da fatura (número, nome, e-mail)
- Valor e data de vencimento
- QR Code PIX
- Código PIX copia e cola

---

### TELA 5: Após Pagamento Plano Básico - Valor Revelado

```
┌─────────────────────────────────────────────────────────────────┐
│                      [LOGO e-Restituição]                       │
│                                                                 │
│            Parabéns! Você possui valor à restituir!             │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   Total a restituir:                    │   │
│   │                                                         │   │
│   │                  + R$ 53.727,39                         │   │
│   │                    (verde grande)                       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Detalhamento por Exercício:                                   │
│   • Exercício 2022: - R$ 14.954,27 (Pagar)                      │
│   • Exercício 2023: + R$ 20.196,88 (Restituir)                  │
│   • Exercício 2025: + R$ 21.361,93 (Restituir)                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │              📦 FAÇA VOCÊ MESMO (Kit IR)                │   │
│   │                                                         │   │
│   │     Você receberá os documentos necessários e as        │   │
│   │     orientações para restituir o valor pago             │   │
│   │     indevidamente.                                      │   │
│   │                                                         │   │
│   │                    R$ 15,99                             │   │
│   │                   (teste)                               │   │
│   │                                                         │   │
│   │     👉 [  QUERO O KIT IR  ]                             │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   OBS: Você receberá em até 08 dias o link para baixar o        │
│   KIT IR completo, com todos os documentos devidamente pronto   │
│   para lhe auxiliar no ajuste/retificação da Declaração do      │
│   Imposto de Renda e para o protocolo junto à Receita Federal,  │
│   além de um Link para assistir um vídeo de como deve           │
│   protocolar essa documentação.                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### TELA 6: Após Pagamento Kit IR - Opção Especialista

```
┌─────────────────────────────────────────────────────────────────┐
│                      [LOGO e-Restituição]                       │
│                                                                 │
│            Parabéns! Você possui valor à restituir!             │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   Total a restituir:                    │   │
│   │                                                         │   │
│   │                  + R$ 53.727,39                         │   │
│   │                    (verde grande)                       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │         🤝 Quer Ter um Especialista Para                │   │
│   │              Cuidar de Tudo?                            │   │
│   │                                                         │   │
│   │     👉 [  CLIQUE AQUI  ]                                │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   OBS: Aqui cuidamos de tudo para você: Desde a apresentação    │
│   ou retificação da Declaração, do Protocolo da documentação    │
│   na Malha e acompanhamento até final resolução, com a          │
│   regularização e/ou restituição. Clique no botão acima e       │
│   será direcionado(a) para um atendimento especializado.        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Características:**
- Layout igual à TELA 5 (centralizado)
- Quadrado "Especialista" centralizado abaixo do valor
- Texto de observação abaixo do quadrado

---

### TELA 7: WhatsApp - Contato Especialista

**Abre WhatsApp** com mensagem pré-definida:
> "Olá, gostaria de contratar um Especialista. Aguardo retorno."

---

## 💰 TABELA DE PREÇOS ATUALIZADA

| Plano | Nome | Preço Teste | Preço Produção |
|-------|------|-------------|----------------|
| Plano Básico | **DESCUBRA SEU VALOR** | R$ 5,99 | R$ 29,90 a R$ 49,90 |
| Plano Completo | **FAÇA VOCÊ MESMO (Kit IR)** | R$ 15,99 | R$ 2.500,00 |
| Especialista | **Quer um Especialista?** | WhatsApp | Atendimento |

---

## 🎨 DIRETRIZES DE DESIGN

### Cores Principais
- **Verde Principal:** #1a7f37 (logo, valores positivos)
- **Verde Claro:** #d4f4dd (fundos de destaque)
- **Laranja/Dourado:** #c4883a (botões de ação, CTAs)
- **Vermelho:** Para valores negativos (a pagar)

### Tipografia
- **Títulos:** Bold, tamanho grande
- **Valores monetários:** Extra bold, cor verde para restituir, vermelho para pagar
- **Textos explicativos:** Regular, cinza escuro

### Botões
- **CTA Principal:** Fundo laranja/dourado, texto branco, bordas arredondadas
- **CTA Secundário:** Fundo verde, texto branco
- **Hover:** Escurecer levemente

### Cards/Quadrados
- **Borda:** Verde ou gradiente
- **Fundo:** Branco ou verde muito claro
- **Sombra:** Sutil para dar profundidade
- **Padding:** Generoso para respirar

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Valor NUNCA aparece antes do pagamento** do Plano Básico
2. **Detalhamento por exercício** mostra apenas valores a restituir/pagar (não RT, IRRF, etc.)
3. **Design deve ser mais chamativo** que a versão antiga
4. **Botões de ação** devem ser grandes e convidativos
5. **Mensagens de sucesso** devem ser celebratórias (emoji de festa)
6. **Prazo do Kit IR:** 8 dias após pagamento (CDC)
7. **WhatsApp:** Número (11) 94113-9391

---

## 🔧 COMANDO PARA IMPLEMENTAÇÃO

```
Implemente o novo layout da tela de resultado conforme ESPECIFICACOES_VISUAIS_FLUXO.md. O design deve ser mais vívido e chamativo que a versão antiga. Mantenha o que foi aprovado da tela atual (logo, steps, mensagem de parabéns). Altere: 1) Plano Básico para "DESCUBRA SEU VALOR" com preço R$ 5,99 (teste), 2) Detalhamento por exercício mostrando apenas valores a restituir/pagar, 3) Design mais chamativo com cores vibrantes e CTAs destacados.
```


---

## 📄 DOCUMENTOS PDFs - KIT IR (Para Dashboard)

> **NOTA:** Quando formos implementar o Dashboard, o cliente irá apresentar os documentos PDFs que são gerados com os dados extraídos do motor de cálculo.

### Documentos do Kit IR:

| Documento | Arquivo de Referência | Descrição |
|-----------|----------------------|-----------|
| **Esclarecimentos** | `referencias_pdfs/0-EsclarecimentosJoseRamos.pdf` | PDF com explicações e orientações para o cliente |
| **PlanilhaRT** | `referencias_pdfs/6-PLanilhaRTJoséRamos.pdf` | Planilha com os dados de Rendimentos Tributáveis calculados |

### Dados extraídos do Motor de Cálculo para os PDFs:
- Dados pessoais do cliente
- Dados do processo
- Valores homologados
- Alvarás e DARFs
- Honorários advocatícios
- Rendimentos Tributáveis por exercício
- IRRF por exercício
- IR Devido por exercício
- IRPF (valor a restituir/pagar) por exercício
- Total a restituir/pagar

### Pendente:
- [ ] Cliente irá apresentar os templates dos PDFs
- [ ] Definir estrutura de dados para geração automática
- [ ] Implementar geração de PDFs no backend
- [ ] Integrar com sistema de envio por e-mail (8 dias após pagamento)
