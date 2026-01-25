# DETALHAMENTO DA IMPLEMENTAÇÃO - Projeto e-Restituição IA

## Última Atualização: 25/01/2026 - 08:45 (Horário de Brasília)

---

## 🎯 1. OBJETIVO DO PROJETO

O projeto **e-Restituição IA** é um sistema web desenvolvido para realizar o cálculo de restituição de Imposto de Renda sobre Rendimentos Recebidos Acumuladamente (RRA), especificamente para valores oriundos de reclamatórias trabalhistas. O sistema permite que o usuário, de forma autônoma, insira os dados de seu processo e obtenha uma análise sobre a existência de valores a restituir ou a pagar.

O fluxo do site foi desenhado para guiar o usuário desde a coleta de dados até a aquisição de serviços complementares, como a obtenção do valor exato do cálculo e um kit completo para a declaração do imposto de renda.

---

## 🏗️ 2. ARQUITETURA E TECNOLOGIAS

O sistema foi estruturado em duas partes principais: o **Frontend**, responsável pela interação com o usuário, e o **Backend**, onde a lógica de negócio e os cálculos complexos são executados.

| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) | Interface do usuário, formulário de coleta de dados e exibição de resultados. Nenhuma biblioteca externa foi utilizada para garantir leveza e total controle sobre o código. |
| **Backend** | Node.js + Express | Servidor responsável por receber os dados do frontend, processá-los e retornar o resultado do cálculo. Expõe uma API RESTful para comunicação. |

---

## ✅ 3. FUNCIONALIDADES IMPLEMENTADAS

Até o momento, as seguintes funcionalidades foram implementadas, validadas e blindadas contra alterações não autorizadas.

### 3.1. Backend - Motor de Cálculo

O motor de cálculo, localizado em `server/src/services/irpfCalculationService.ts`, é o coração do sistema e foi rigorosamente testado e validado com os casos de **José Ramos** e **Ana Carmen**. Suas principais capacidades são:

- **Cálculo de Proporção Tributável:** Determina o percentual dos valores brutos que é sujeito à tributação, com base nos valores homologados no processo.
- **Deflação por IPCA-E:** Atualiza monetariamente os valores recebidos em diferentes datas para a data do cálculo, utilizando os índices oficiais do IPCA-E.
- **Dedução de Honorários:** Realiza a dedução dos honorários advocatícios da base de cálculo do imposto, aplicando a proporção tributável.
- **Cálculo de IR Devido:** Aplica a tabela progressiva do Imposto de Renda para cada exercício fiscal, considerando o número de meses a que os rendimentos se referem.
- **Apuração Final:** Consolida os valores de IRRF (Imposto de Renda Retido na Fonte) e o IR Devido para determinar o valor final a restituir ou a pagar.

### 3.2. Frontend - Interface e Validações

O frontend foi desenvolvido para ser intuitivo e robusto, garantindo a qualidade dos dados enviados ao backend.

#### Validações e Máscaras (`validations.js`, `masks.js`)

| Funcionalidade | Descrição |
|----------------|-----------|
| **CPF/CNPJ** | Validação dos dígitos verificadores para garantir que os documentos são matematicamente válidos. |
| **Nomes e Textos** | Formatação automática de nomes próprios e comarcas, com iniciais maiúsculas e preposições minúsculas. Tratamento especial para "S/A" em fontes pagadoras. |
| **Número do Processo** | Máscara `XXXXXXX-XX.XXXX.X.XX.XXXX` para garantir o formato padrão dos processos judiciais. |
| **Anos e Datas** | Validação para que os anos tenham 4 dígitos e estejam em um intervalo razoável (2020-2100). Máscara `DD/MM/AAAA` para datas. |
| **Vara** | Formatação automática com "ª" e "do" para padronizar a entrada. |

#### Usabilidade (`tabBehavior.js`, `confirmacao.js`)

- **Navegação por Tab:** Implementado um comportamento inteligente nos campos de valores (Alvarás, DARFs, Honorários). Pressionar "Tab" em uma linha preenchida cria uma nova linha. Pressionar "Tab" em uma linha vazia a remove e move o foco para o próximo elemento do formulário.
- **Modal de Confirmação:** Antes de enviar os dados para cálculo, um modal de confirmação é exibido, apresentando um resumo de todos os dados inseridos pelo usuário. Isso permite uma última revisão e aumenta a precisão do cálculo.

---

## 📁 4. ESTRUTURA DE ARQUIVOS DO PROJETO

A seguir, a lista de arquivos que compõem o projeto (excluindo dependências de `node_modules`):

```
/home/ubuntu/restituicaoia/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── masks.js
│       ├── validations.js
│       ├── tabBehavior.js
│       └── confirmacao.js
├── server/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/index.ts
│       ├── controllers/calculoController.ts
│       ├── index.ts
│       ├── routes/calculoRoutes.ts
│       ├── routes/pagamentoRoutes.ts
│       ├── services/dbService.ts
│       ├── services/irpfCalculationService.ts
│       ├── tests/testeMotorDebug.ts
│       ├── tests/testeMotorV2.ts
│       └── utils/formatters.ts
├── CHECKPOINT_25_01_2026_0825.md
├── DETALHAMENTO_PROJETO.md
├── FLUXO_SITE_DETALHADO.md
└── todo.md
```

---

## 🔧 5. PRÓXIMOS PASSOS

Com a base do sistema validada, os próximos passos se concentram em implementar o fluxo de negócio definido:

1.  **Ajustar a Tela de Resultado:** Modificar a interface para ocultar o valor do cálculo e apresentar os planos de pagamento, conforme especificado no `FLUXO_SITE_DETALHADO.md`.
2.  **Integrar Gateway de Pagamento (Asaas):** Implementar a comunicação com a API do Asaas para processar pagamentos via PIX e Cartão de Crédito.
3.  **Desenvolver o Dashboard Administrativo:** Criar uma área restrita para gerenciamento de leads, visualização de cálculos e acompanhamento de pagamentos.
4.  **Implementar o Sistema de E-mail:** Desenvolver a lógica para o envio agendado (8 dias) do "Kit IR" após a confirmação do pagamento do Plano Completo.
