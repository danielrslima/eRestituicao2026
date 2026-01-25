# FLUXO DETALHADO DO SITE - e-Restituição IA

## Última Atualização: 25/01/2026 - 08:30 (Horário de Brasília)

---

## 📋 PASSO A PASSO COMPLETO

### ETAPA 1: Preenchimento do Formulário
1. Cliente acessa o site
2. Preenche todos os dados do formulário (dados pessoais, processo, valores, alvarás, DARFs, honorários)
3. Clica no botão "Calcular"

### ETAPA 2: Cálculo e Resultado Inicial
1. Sistema realiza o cálculo internamente
2. **Internamente:** Envia os dados para o Dashboard administrativo
3. **Externamente (na tela):** Mostra uma das mensagens:
   - ✅ **"Parabéns! Você tem valor a restituir!"** (se houver restituição)
   - ⚠️ **"Você não tem valor a restituir, mas pode ter pago mais do que o devido"** (se não houver)

### ETAPA 3: Plano Básico - Descobrir o Valor
1. Na mesma tela aparece um **quadrado/botão** para o cliente clicar se quiser descobrir o valor
2. **Preço:**
   - Produção: **R$ 29,90**
   - Teste: **R$ 5,99**
3. Ao clicar, aparecem as **opções de pagamento:**
   - PIX
   - Cartão de Crédito
4. Botão **"Pagar"**
5. Ao clicar em "Pagar", **abre nova janela do Asaas** para realizar o pagamento

### ETAPA 4: Confirmação do Pagamento (Plano Básico)
1. Após confirmação do pagamento no Asaas
2. **Janela principal** informa que foi confirmado
3. **Apresenta o resultado:** Valor exato a restituir

### ETAPA 5: Plano Completo - "Faça Você Mesmo" (Kit IR)
1. Na mesma tela aparece outro **quadrado denominado "Faça você mesmo"**
2. Com observações explicativas sobre o serviço
3. **Preço:**
   - Produção: **R$ 2.500,00**
   - Teste: **R$ 15,99**
4. **IMPORTANTE:** O e-mail com o Kit IR será enviado **após 8 dias** do pagamento
   - Motivo: Evitar arrependimento conforme CDC (Código de Defesa do Consumidor)
5. Ao clicar em "Pagar", **mesma mecânica** do item anterior (Asaas)

### ETAPA 6: Confirmação do Pagamento (Plano Completo)
1. Após confirmação do pagamento
2. **Tela principal** mostra mensagem:
   - "Você receberá por e-mail o KIT IR em até 8 dias"
3. **Conteúdo do Kit IR:**
   - Templates de PDF
   - Esclarecimentos
   - Link contendo vídeo explicativo de como utilizar os documentos

### ETAPA 7: Opção de Contratar Especialista
1. Na mesma tela aparece a **opção de contratar um especialista** para cuidar de tudo
2. Com as observações necessárias sobre o serviço
3. Se o cliente quiser, **clica no botão**
4. É **direcionado para WhatsApp** para atendimento direto

---

## 💰 TABELA DE PREÇOS

| Plano | Produção | Teste |
|-------|----------|-------|
| Plano Básico (Descobrir Valor) | R$ 29,90 | R$ 5,99 |
| Plano Completo (Kit IR - Faça Você Mesmo) | R$ 2.500,00 | R$ 15,99 |
| Especialista | Atendimento via WhatsApp | - |

---

## ⏰ PRAZOS IMPORTANTES

| Item | Prazo | Motivo |
|------|-------|--------|
| Envio do Kit IR | 8 dias após pagamento | Direito de arrependimento (CDC) |

---

## 📱 INTEGRAÇÕES

| Serviço | Uso |
|---------|-----|
| Asaas | Gateway de pagamento (PIX e Cartão) |
| WhatsApp | Atendimento para contratação de especialista |
| E-mail | Envio do Kit IR após 8 dias |

---

## 🖥️ TELAS DO FLUXO

### Tela 1: Resultado Inicial (Antes do Pagamento)
```
┌─────────────────────────────────────────────┐
│                                             │
│   🎉 Parabéns! Você tem valor a restituir!  │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │   Descubra seu valor a Restituir    │   │
│   │                                     │   │
│   │          R$ 29,90                   │   │
│   │                                     │   │
│   │      [ Escolher Plano ]             │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Tela 2: Após Pagamento Plano Básico
```
┌─────────────────────────────────────────────┐
│                                             │
│   ✅ Pagamento Confirmado!                  │
│                                             │
│   Seu valor a restituir é:                  │
│                                             │
│        + R$ 74.028,67                       │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │   Faça Você Mesmo (Kit IR)          │   │
│   │                                     │   │
│   │          R$ 2.500,00                │   │
│   │                                     │   │
│   │   Receba por e-mail em até 8 dias:  │   │
│   │   - Templates PDF                   │   │
│   │   - Esclarecimentos                 │   │
│   │   - Vídeo explicativo               │   │
│   │                                     │   │
│   │      [ Escolher Plano ]             │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Tela 3: Após Pagamento Plano Completo
```
┌─────────────────────────────────────────────┐
│                                             │
│   ✅ Pagamento Confirmado!                  │
│                                             │
│   Você receberá por e-mail o KIT IR         │
│   em até 8 dias.                            │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │   Quer que um especialista          │   │
│   │   cuide de tudo para você?          │   │
│   │                                     │   │
│   │   [ Falar com Especialista ]        │   │
│   │        (WhatsApp)                   │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📊 DADOS ENVIADOS AO DASHBOARD

Ao clicar em "Calcular", os seguintes dados são enviados ao Dashboard:
- Dados pessoais (nome, CPF, email, telefone)
- Dados do processo
- Valores homologados
- Alvarás, DARFs, Honorários
- Resultado do cálculo
- Data/hora do cálculo
- Status do pagamento (pendente)

---

## 🔄 FLUXO DE STATUS DO LEAD

```
[Novo] → [Calculou] → [Pagou Básico] → [Pagou Completo] → [Kit Enviado]
                                    ↘
                                      [Contratou Especialista]
```
