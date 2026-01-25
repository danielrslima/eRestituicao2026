# 📋 SCRIPT DE TESTE - Formulário de Cadastro de Clientes

**Data:** 25/01/2026  
**Versão:** 1.0  
**Objetivo:** Verificar as alterações implementadas no formulário de cadastro de clientes

---

## 🔗 Acesso ao Sistema

**URL:** https://8081-iv12ayqi3gd44r2vdz0on-d5ac0044.us2.manus.computer/login.html

### Credenciais de Teste:

| Nível | E-mail | Senha |
|-------|--------|-------|
| Admin | admin@erestituicao.com.br | admin123 |
| Funcionário | funcionario@erestituicao.com.br | func123 |
| Parceiro | parceiro@erestituicao.com.br | parc123 |

---

## 📝 TESTE 1: Verificar Nova Ordem dos Campos

### Passos:
1. Fazer login como **Admin**
2. Clicar no menu **👥 Clientes**
3. Clicar no botão **➕ Novo Cliente**
4. Verificar a ordem dos campos na aba "Dados Pessoais"

### Resultado Esperado:
A ordem dos campos deve ser:

**Seção 1 - 👤 Dados Pessoais:**
- [ ] Nome Completo *
- [ ] CPF *
- [ ] E-mail *
- [ ] Data de Nascimento *
- [ ] Profissão

**Seção 2 - 📍 Endereço:**
- [ ] CEP
- [ ] Logradouro
- [ ] Número
- [ ] Complemento
- [ ] Bairro
- [ ] Cidade
- [ ] UF

**Seção 3 - 📞 Telefones:**
- [ ] Telefone * (com tipo Próprio/Outro)
- [ ] Botão "➕ Adicionar Telefone"

**Seção 4 - 🔐 Acesso Gov.br:**
- [ ] Senha Gov.br (com botão 👁️)
- [ ] Checkbox "Possui Procuração Eletrônica"

---

## 📝 TESTE 2: Máscara de Telefone

### Passos:
1. No campo Telefone, digitar: `11999998888`

### Resultado Esperado:
- [ ] O campo deve formatar automaticamente para: **(11) 99999-8888**
- [ ] Máscara: (XX) XXXXX-XXXX

---

## 📝 TESTE 3: Máscara de CEP

### Passos:
1. No campo CEP, digitar: `01310100`

### Resultado Esperado:
- [ ] O campo deve formatar automaticamente para: **01310-100**
- [ ] Máscara: XXXXX-XXX
- [ ] Ao sair do campo (blur), deve buscar o endereço automaticamente via ViaCEP

---

## 📝 TESTE 4: Busca Automática de CEP

### Passos:
1. No campo CEP, digitar: `01310100`
2. Pressionar Tab ou clicar fora do campo

### Resultado Esperado:
- [ ] Logradouro preenchido automaticamente: "Avenida Paulista"
- [ ] Bairro preenchido automaticamente: "Bela Vista"
- [ ] Cidade preenchida automaticamente: "São Paulo"
- [ ] UF preenchido automaticamente: "SP"
- [ ] Cursor posicionado no campo "Número"

---

## 📝 TESTE 5: Adicionar Múltiplos Telefones

### Passos:
1. Preencher o primeiro telefone: `11999998888`
2. Clicar no botão **➕ Adicionar Telefone**
3. Preencher o segundo telefone: `11988887777`
4. Selecionar tipo "Outro"
5. Preencher nome do responsável: "Maria (Esposa)"
6. Clicar no botão **➕ Adicionar Telefone**
7. Preencher o terceiro telefone: `11977776666`

### Resultado Esperado:
- [ ] Três campos de telefone visíveis
- [ ] Cada telefone com máscara correta (XX) XXXXX-XXXX
- [ ] Campo "Nome do Responsável" aparece apenas quando tipo = "Outro"
- [ ] Botão 🗑️ para remover telefones adicionais

---

## 📝 TESTE 6: Remover Telefone

### Passos:
1. Com 3 telefones cadastrados, clicar no 🗑️ do terceiro telefone
2. Tentar remover o único telefone restante

### Resultado Esperado:
- [ ] Terceiro telefone removido com sucesso
- [ ] Ao tentar remover o único telefone, exibir alerta: "É necessário manter pelo menos um telefone de contato."

---

## 📝 TESTE 7: Campo Nome do Responsável (Condicional)

### Passos:
1. No primeiro telefone, selecionar tipo "Próprio"
2. Verificar se campo "Nome do Responsável" está oculto
3. Alterar tipo para "Outro"
4. Verificar se campo "Nome do Responsável" aparece

### Resultado Esperado:
- [ ] Tipo "Próprio": campo "Nome do Responsável" **oculto**
- [ ] Tipo "Outro": campo "Nome do Responsável" **visível**

---

## 📝 TESTE 8: Navegação com Tab

### Passos:
1. Posicionar cursor no campo "Nome Completo"
2. Pressionar Tab repetidamente

### Resultado Esperado:
A navegação deve seguir a ordem:
1. [ ] Nome Completo
2. [ ] CPF
3. [ ] E-mail
4. [ ] Data de Nascimento
5. [ ] Profissão
6. [ ] CEP
7. [ ] Logradouro
8. [ ] Número
9. [ ] Complemento
10. [ ] Bairro
11. [ ] Cidade
12. [ ] UF
13. [ ] Telefone
14. [ ] Tipo de Telefone
15. [ ] (Se Outro) Nome do Responsável
... continua até Senha Gov.br

---

## 📝 TESTE 9: Máscara de CPF

### Passos:
1. No campo CPF, digitar: `12345678900`

### Resultado Esperado:
- [ ] O campo deve formatar automaticamente para: **123.456.789-00**

---

## 📝 TESTE 10: Salvar Cliente com Múltiplos Telefones

### Passos:
1. Preencher todos os campos obrigatórios:
   - Nome: "Teste Silva"
   - CPF: `12345678900`
   - E-mail: "teste@teste.com"
   - Data Nascimento: 01/01/1990
2. Adicionar 2 telefones:
   - Telefone 1: `11999998888` (Próprio)
   - Telefone 2: `11988887777` (Outro - "João Filho")
3. Clicar em **💾 Salvar Cliente**

### Resultado Esperado:
- [ ] Cliente salvo com sucesso
- [ ] ID gerado: CLI-XXXX
- [ ] Todos os telefones salvos no array
- [ ] Cliente aparece na lista com o primeiro telefone exibido

---

## 📝 TESTE 11: Visualizar Cliente com Múltiplos Telefones

### Passos:
1. Na lista de clientes, clicar no 👁️ do cliente recém-cadastrado

### Resultado Esperado:
- [ ] Modal/Alert exibe todos os telefones cadastrados
- [ ] Formato: "1. (11) 99999-8888 (Próprio)"
- [ ] Formato: "2. (11) 98888-7777 (Outro) - João Filho"

---

## 📝 TESTE 12: Permissões de Parceiro

### Passos:
1. Fazer logout
2. Fazer login como **Parceiro** (parceiro@erestituicao.com.br / parc123)
3. Acessar Clientes
4. Clicar em **➕ Novo Cliente**

### Resultado Esperado:
- [ ] Parceiro consegue cadastrar clientes
- [ ] Botão **🧮 Salvar e Calcular** está **oculto**
- [ ] Parceiro vê apenas seus próprios clientes na lista

---

## ✅ CHECKLIST FINAL

| Item | Status |
|------|--------|
| Ordem dos campos correta (Dados Pessoais → Endereço → Telefones → Gov.br) | ⬜ |
| Máscara de telefone: (XX) XXXXX-XXXX | ⬜ |
| Máscara de CEP: XXXXX-XXX | ⬜ |
| Busca automática de CEP (ViaCEP) | ⬜ |
| Telefones dinâmicos (adicionar/remover) | ⬜ |
| Campo "Nome do Responsável" condicional | ⬜ |
| Navegação com Tab funcional | ⬜ |
| Salvar cliente com múltiplos telefones | ⬜ |
| Visualizar telefones na lista e detalhes | ⬜ |
| Permissões de Parceiro corretas | ⬜ |

---

## 🐛 BUGS ENCONTRADOS

| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## 📝 OBSERVAÇÕES

_Adicione aqui quaisquer observações durante os testes_

---

**Testado por:** _______________  
**Data:** ___/___/______  
**Aprovado:** ⬜ Sim  ⬜ Não
