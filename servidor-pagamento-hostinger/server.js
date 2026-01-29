/**
 * ============================================
 * SERVIDOR DE PAGAMENTO - e-Restituição IA
 * ============================================
 * 
 * Intermediário entre o frontend e a API do Asaas
 * 
 * Versão: 2.0.0
 * Data: 28/01/2026
 * 
 * SEGURANÇA:
 * - Chaves de API ficam no arquivo .env (NÃO vai para GitHub)
 * - CORS configurado para aceitar apenas domínios autorizados
 * 
 * ============================================
 */

// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ============================================
// CONFIGURAÇÕES
// ============================================

// Porta do servidor (padrão: 3001)
const PORT = process.env.PORT || 3001;

// Chave da API do Asaas (vem do arquivo .env)
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Ambiente: sandbox (testes) ou production (real)
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'sandbox';

// URL base da API do Asaas
const ASAAS_API_URL = ASAAS_ENVIRONMENT === 'production' 
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3';

// Preços dos planos
const PRECOS = {
  basico: parseFloat(process.env.PRECO_BASICO) || 5.99,
  completo: parseFloat(process.env.PRECO_COMPLETO) || 15.99
};

// ============================================
// VERIFICAÇÃO DE CONFIGURAÇÃO
// ============================================

if (!ASAAS_API_KEY || ASAAS_API_KEY === 'COLE_SUA_CHAVE_AQUI') {
  console.error('❌ ERRO: Chave da API do Asaas não configurada!');
  console.error('   Por favor, configure a variável ASAAS_API_KEY no arquivo .env');
  process.exit(1);
}

// ============================================
// MIDDLEWARES
// ============================================

// Configuração de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (como Postman)
    if (!origin) return callback(null, true);
    
    // Se permitir todos
    if (allowedOrigins.includes('*')) return callback(null, true);
    
    // Verifica se a origem está na lista
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROTAS
// ============================================

/**
 * Health Check - Verifica se o servidor está funcionando
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor de pagamento funcionando!',
    environment: ASAAS_ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

/**
 * Criar Pagamento - Cria uma cobrança no Asaas
 * 
 * Body esperado:
 * {
 *   name: "Nome do Cliente",
 *   email: "email@cliente.com",
 *   cpfCnpj: "12345678901",
 *   value: 5.99,
 *   description: "e-Restituição - Plano Básico",
 *   billingType: "PIX" ou "CREDIT_CARD",
 *   accessCode: "REST-XXXXXX" (opcional)
 * }
 */
app.post('/api/create-payment', async (req, res) => {
  try {
    const { name, email, cpfCnpj, value, description, billingType, accessCode } = req.body;

    // Validações
    if (!name || !email || !cpfCnpj) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos. Nome, email e CPF/CNPJ são obrigatórios.'
      });
    }

    if (!value || value <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido.'
      });
    }

    console.log(`📝 Criando pagamento para: ${name} (${email})`);
    console.log(`   Valor: R$ ${value.toFixed(2)}`);
    console.log(`   Tipo: ${billingType || 'PIX'}`);

    // 1. Buscar ou criar cliente no Asaas
    let customerId;
    
    // Busca cliente existente pelo CPF/CNPJ
    const searchResponse = await axios.get(
      `${ASAAS_API_URL}/customers?cpfCnpj=${cpfCnpj.replace(/\D/g, '')}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      // Cliente já existe
      customerId = searchResponse.data.data[0].id;
      console.log(`   Cliente encontrado: ${customerId}`);
    } else {
      // Criar novo cliente
      const customerResponse = await axios.post(
        `${ASAAS_API_URL}/customers`,
        {
          name: name,
          email: email,
          cpfCnpj: cpfCnpj.replace(/\D/g, ''),
          notificationDisabled: false
        },
        {
          headers: {
            'access_token': ASAAS_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      customerId = customerResponse.data.id;
      console.log(`   Novo cliente criado: ${customerId}`);
    }

    // 2. Criar a cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias

    const paymentData = {
      customer: customerId,
      billingType: billingType || 'PIX',
      value: value,
      dueDate: dueDate.toISOString().split('T')[0],
      description: description || 'e-Restituição - Pagamento',
      externalReference: accessCode || `REST-${Date.now()}`
    };

    const paymentResponse = await axios.post(
      `${ASAAS_API_URL}/payments`,
      paymentData,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const payment = paymentResponse.data;
    console.log(`   ✅ Cobrança criada: ${payment.id}`);

    // 3. Se for PIX, buscar QR Code
    let pixData = null;
    if (billingType === 'PIX' || !billingType) {
      try {
        const pixResponse = await axios.get(
          `${ASAAS_API_URL}/payments/${payment.id}/pixQrCode`,
          {
            headers: {
              'access_token': ASAAS_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        pixData = pixResponse.data;
        console.log(`   ✅ QR Code PIX gerado`);
      } catch (pixError) {
        console.log(`   ⚠️ Erro ao gerar QR Code PIX: ${pixError.message}`);
      }
    }

    // 4. Retornar resposta
    res.json({
      success: true,
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
      status: payment.status,
      value: payment.value,
      dueDate: payment.dueDate,
      pix: pixData ? {
        qrCodeImage: pixData.encodedImage,
        qrCodePayload: pixData.payload,
        expirationDate: pixData.expirationDate
      } : null
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento. Tente novamente.',
      details: error.response?.data?.errors || error.message
    });
  }
});

/**
 * Verificar Status do Pagamento
 */
app.get('/api/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const response = await axios.get(
      `${ASAAS_API_URL}/payments/${paymentId}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const payment = response.data;

    res.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      value: payment.value,
      confirmedDate: payment.confirmedDate,
      paymentDate: payment.paymentDate
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status do pagamento.'
    });
  }
});

/**
 * Webhook - Recebe notificações do Asaas
 */
app.post('/api/webhook', (req, res) => {
  const event = req.body;
  
  console.log('📬 Webhook recebido:', event.event);
  console.log('   Payment ID:', event.payment?.id);
  console.log('   Status:', event.payment?.status);

  // Aqui você pode adicionar lógica para:
  // - Atualizar status no Firebase
  // - Enviar email de confirmação
  // - Liberar acesso ao conteúdo

  res.status(200).json({ received: true });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('============================================');
  console.log('🚀 SERVIDOR DE PAGAMENTO - e-Restituição');
  console.log('============================================');
  console.log(`📍 Rodando na porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${ASAAS_ENVIRONMENT}`);
  console.log(`💰 Plano Básico: R$ ${PRECOS.basico.toFixed(2)}`);
  console.log(`💰 Plano Completo: R$ ${PRECOS.completo.toFixed(2)}`);
  console.log('============================================');
  console.log('');
});
