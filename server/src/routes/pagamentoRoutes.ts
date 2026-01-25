/**
 * Rotas de Pagamento - e-Restituição
 * Integração com Asaas para PIX e Cartão de Crédito
 * Versão: 2.0.0
 */

import { Router, Request, Response } from 'express';
import asaasService from '../services/asaasService';

const router = Router();

// Armazenamento temporário de pagamentos (em produção usar banco de dados)
const pagamentosCache: Map<string, any> = new Map();

/**
 * GET /api/precos - Retorna os preços configurados
 */
router.get('/precos', (req: Request, res: Response) => {
  try {
    const precos = asaasService.obterPrecos();
    res.json({
      sucesso: true,
      precos: {
        descobrirValor: precos.descobrirValor,
        facaVoceMesmo: precos.facaVoceMesmo
      },
      modoTeste: process.env.MODO_PRECO === 'teste'
    });
  } catch (error: any) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * POST /api/create-payment - Cria uma cobrança no Asaas
 * Body: { nome, email, cpf, telefone, plano, metodoPagamento, accessCode, valorComAbatimento }
 */
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { nome, email, cpf, telefone, plano, metodoPagamento, accessCode, valorComAbatimento } = req.body;

    // Validações
    if (!nome || !email || !cpf) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Nome, email e CPF são obrigatórios'
      });
    }

    if (!plano || !['basico', 'completo'].includes(plano)) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Plano inválido. Use "basico" ou "completo"'
      });
    }

    if (!metodoPagamento || !['pix', 'cartao'].includes(metodoPagamento)) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Método de pagamento inválido. Use "pix" ou "cartao"'
      });
    }

    // Obter preços
    const precos = asaasService.obterPrecos();
    // Se houver valor com abatimento, usar ele (em centavos), senão usar preço padrão
    let valor: number;
    if (valorComAbatimento && plano === 'completo') {
      valor = valorComAbatimento; // Já está em centavos
    } else {
      valor = plano === 'basico' ? precos.descobrirValor : precos.facaVoceMesmo;
    }
    const descricao = plano === 'basico' 
      ? 'e-Restituição - Descubra Seu Valor'
      : 'e-Restituição - Kit IR (Faça Você Mesmo)';

    // Buscar ou criar cliente no Asaas
    const customerId = await asaasService.buscarOuCriarCliente({
      name: nome,
      email: email,
      cpfCnpj: cpf,
      phone: telefone
    });

    // Criar cobrança baseada no método de pagamento
    let cobranca;
    if (metodoPagamento === 'pix') {
      cobranca = await asaasService.criarCobrancaPix(
        customerId,
        valor,
        descricao,
        accessCode
      );
    } else {
      cobranca = await asaasService.criarCobrancaCartao(
        customerId,
        valor,
        descricao,
        accessCode
      );
    }

    // Salvar no cache
    pagamentosCache.set(cobranca.id, {
      accessCode,
      plano,
      status: cobranca.status,
      valor,
      criadoEm: new Date()
    });

    // Retornar resposta
    res.json({
      sucesso: true,
      pagamento: {
        id: cobranca.id,
        invoiceUrl: cobranca.invoiceUrl,
        pixQrCodeUrl: cobranca.pixQrCodeUrl,
        pixCopiaECola: cobranca.pixCopiaECola,
        status: cobranca.status,
        valor: valor,
        plano: plano
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      sucesso: false,
      erro: error.message || 'Erro ao processar pagamento'
    });
  }
});

/**
 * GET /api/payment-status/:paymentId - Consulta status do pagamento
 */
router.get('/payment-status/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    // Consultar status no Asaas
    const status = await asaasService.consultarStatusCobranca(paymentId);

    // Buscar dados do cache
    const dadosCache = pagamentosCache.get(paymentId);

    res.json({
      sucesso: true,
      pagamento: {
        id: paymentId,
        status: status,
        pago: ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(status),
        plano: dadosCache?.plano,
        accessCode: dadosCache?.accessCode
      }
    });

  } catch (error: any) {
    console.error('Erro ao consultar status:', error);
    res.status(500).json({
      sucesso: false,
      erro: error.message || 'Erro ao consultar status'
    });
  }
});

/**
 * POST /api/webhooks/asaas - Webhook do Asaas para notificações de pagamento
 */
router.post('/webhooks/asaas', (req: Request, res: Response) => {
  try {
    console.log('=== WEBHOOK ASAAS RECEBIDO ===');
    console.log(JSON.stringify(req.body, null, 2));

    const evento = asaasService.processarWebhook(req.body);

    // Atualizar cache se existir
    if (evento.paymentId && pagamentosCache.has(evento.paymentId)) {
      const dados = pagamentosCache.get(evento.paymentId);
      dados.status = evento.status;
      dados.atualizadoEm = new Date();
      pagamentosCache.set(evento.paymentId, dados);
    }

    // Log do evento
    console.log('Evento processado:', evento);

    // Verificar se foi pago
    if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(evento.status)) {
      console.log('✅ PAGAMENTO CONFIRMADO!');
      console.log('   Payment ID:', evento.paymentId);
      console.log('   Referência:', evento.referenciaExterna);
      
      // TODO: Atualizar banco de dados com status de pagamento
      // TODO: Liberar acesso ao valor para o cliente
    }

    res.status(200).send('OK');

  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('Erro');
  }
});

/**
 * GET /api/pagamentos/cache - Lista pagamentos em cache (debug)
 */
router.get('/pagamentos/cache', (req: Request, res: Response) => {
  const lista: any[] = [];
  pagamentosCache.forEach((valor, chave) => {
    lista.push({ id: chave, ...valor });
  });
  res.json({ sucesso: true, pagamentos: lista });
});

export default router;
