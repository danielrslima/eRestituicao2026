/**
 * e-Restituição - Serviço de Integração com Asaas
 * Gerencia pagamentos via PIX e Cartão de Crédito
 * Versão: 1.0.0
 */

import axios from 'axios';
import { config } from '../config';

// Tipos
interface ClienteAsaas {
  id?: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}

interface CobrancaAsaas {
  id?: string;
  customer: string;
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
}

interface RespostaCobranca {
  id: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  pixQrCodeUrl?: string;
  pixCopiaECola?: string;
  status: string;
}

// Configuração do Axios para Asaas
const asaasApi = axios.create({
  baseURL: config.asaas.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'access_token': config.asaas.apiKey
  }
});

/**
 * Busca ou cria um cliente no Asaas
 */
export async function buscarOuCriarCliente(dados: ClienteAsaas): Promise<string> {
  try {
    // Primeiro, tenta buscar cliente pelo CPF/CNPJ
    const busca = await asaasApi.get('/customers', {
      params: { cpfCnpj: dados.cpfCnpj.replace(/\D/g, '') }
    });

    if (busca.data.data && busca.data.data.length > 0) {
      console.log('Cliente encontrado no Asaas:', busca.data.data[0].id);
      return busca.data.data[0].id;
    }

    // Se não encontrou, cria novo cliente
    const novoCliente = await asaasApi.post('/customers', {
      name: dados.name,
      email: dados.email,
      cpfCnpj: dados.cpfCnpj.replace(/\D/g, ''),
      phone: dados.phone?.replace(/\D/g, '') || undefined,
      notificationDisabled: false
    });

    console.log('Novo cliente criado no Asaas:', novoCliente.data.id);
    return novoCliente.data.id;

  } catch (error: any) {
    console.error('Erro ao buscar/criar cliente no Asaas:', error.response?.data || error.message);
    throw new Error('Erro ao processar cliente no sistema de pagamentos');
  }
}

/**
 * Cria uma cobrança PIX no Asaas
 */
export async function criarCobrancaPix(
  customerId: string,
  valor: number,
  descricao: string,
  referenciaExterna?: string
): Promise<RespostaCobranca> {
  try {
    // Data de vencimento: hoje + 1 dia
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 1);
    const dueDateStr = vencimento.toISOString().split('T')[0];

    const cobranca = await asaasApi.post('/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: valor,
      dueDate: dueDateStr,
      description: descricao,
      externalReference: referenciaExterna
    });

    // Buscar QR Code do PIX
    const pixInfo = await asaasApi.get(`/payments/${cobranca.data.id}/pixQrCode`);

    return {
      id: cobranca.data.id,
      invoiceUrl: cobranca.data.invoiceUrl,
      pixQrCodeUrl: pixInfo.data.encodedImage,
      pixCopiaECola: pixInfo.data.payload,
      status: cobranca.data.status
    };

  } catch (error: any) {
    console.error('Erro ao criar cobrança PIX:', error.response?.data || error.message);
    throw new Error('Erro ao gerar cobrança PIX');
  }
}

/**
 * Cria uma cobrança com Cartão de Crédito no Asaas
 * Retorna URL para checkout do Asaas
 */
export async function criarCobrancaCartao(
  customerId: string,
  valor: number,
  descricao: string,
  referenciaExterna?: string
): Promise<RespostaCobranca> {
  try {
    // Data de vencimento: hoje + 1 dia
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 1);
    const dueDateStr = vencimento.toISOString().split('T')[0];

    const cobranca = await asaasApi.post('/payments', {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: valor,
      dueDate: dueDateStr,
      description: descricao,
      externalReference: referenciaExterna
    });

    return {
      id: cobranca.data.id,
      invoiceUrl: cobranca.data.invoiceUrl,
      status: cobranca.data.status
    };

  } catch (error: any) {
    console.error('Erro ao criar cobrança Cartão:', error.response?.data || error.message);
    throw new Error('Erro ao gerar cobrança com cartão');
  }
}

/**
 * Consulta o status de uma cobrança
 */
export async function consultarStatusCobranca(paymentId: string): Promise<string> {
  try {
    const response = await asaasApi.get(`/payments/${paymentId}`);
    return response.data.status;
  } catch (error: any) {
    console.error('Erro ao consultar status:', error.response?.data || error.message);
    throw new Error('Erro ao consultar status do pagamento');
  }
}

/**
 * Processa webhook do Asaas
 * Retorna o evento processado
 */
export function processarWebhook(payload: any): {
  evento: string;
  paymentId: string;
  status: string;
  referenciaExterna?: string;
} {
  return {
    evento: payload.event,
    paymentId: payload.payment?.id,
    status: payload.payment?.status,
    referenciaExterna: payload.payment?.externalReference
  };
}

/**
 * Obtém os preços configurados
 */
export function obterPrecos(): { descobrirValor: number; facaVoceMesmo: number } {
  const modoTeste = process.env.MODO_PRECO === 'teste';
  
  return {
    descobrirValor: modoTeste 
      ? parseFloat(process.env.PRECO_DESCOBRIR_VALOR_TESTE || '599') / 100
      : parseFloat(process.env.PRECO_DESCOBRIR_VALOR_PROD || '2990') / 100,
    facaVoceMesmo: modoTeste
      ? parseFloat(process.env.PRECO_FACA_VOCE_MESMO_TESTE || '1599') / 100
      : parseFloat(process.env.PRECO_FACA_VOCE_MESMO_PROD || '250000') / 100
  };
}

export default {
  buscarOuCriarCliente,
  criarCobrancaPix,
  criarCobrancaCartao,
  consultarStatusCobranca,
  processarWebhook,
  obterPrecos
};
