"""
Proxy de Pagamento - e-Restituição
Intermediário para contornar CORS no ambiente de teste (Manus)
Versão: 1.1.0
Data: 26/01/2026
Identificação: PROXY-PAGAMENTO-V1.1-26JAN
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Permite requisições de qualquer origem

# Configuração da API do Asaas (PRODUÇÃO)
ASAAS_API_URL = 'https://api.asaas.com/v3'
ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjFhZTNhMjFmLTliYmItNGMwOC05N2FlLWQ5Y2Y1MWUyOWYyMzo6JGFhY2hfZTBiMGIyN2EtNTU5My00N2NlLWJlMDctZTI5MDVmNDcxZmNh'

# Preços dos planos (em reais)
PRECOS = {
    'basico': 5.99,
    'completo': 15.99
}

@app.route('/api/health', methods=['GET'])
def health():
    """Verifica se o proxy está funcionando"""
    return jsonify({'status': 'ok', 'message': 'Proxy de pagamento funcionando!'})

@app.route('/api/create-payment', methods=['POST'])
def create_payment():
    """Cria um pagamento no Asaas"""
    try:
        data = request.get_json()
        
        nome = data.get('nome', 'Cliente')
        email = data.get('email', 'cliente@email.com')
        cpf = data.get('cpf', '').replace('.', '').replace('-', '')
        telefone = data.get('telefone', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
        plano = data.get('plano', 'basico')
        metodo = data.get('metodoPagamento', 'pix')
        valor_com_abatimento = data.get('valorComAbatimento')  # Em centavos
        
        # Determinar valor
        if valor_com_abatimento:
            valor = valor_com_abatimento / 100  # Converter de centavos para reais
        else:
            valor = PRECOS.get(plano, 5.99)
        
        # Headers para API do Asaas
        headers = {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        }
        
        # 1. Criar ou buscar cliente
        cliente_response = requests.post(
            f'{ASAAS_API_URL}/customers',
            headers=headers,
            json={
                'name': nome,
                'email': email,
                'cpfCnpj': cpf,
                'mobilePhone': telefone
            },
            timeout=30
        )
        
        cliente_data = cliente_response.json()
        
        # Se cliente já existe, buscar pelo CPF
        if 'errors' in cliente_data:
            busca_response = requests.get(
                f'{ASAAS_API_URL}/customers?cpfCnpj={cpf}',
                headers=headers,
                timeout=30
            )
            busca_data = busca_response.json()
            if busca_data.get('data') and len(busca_data['data']) > 0:
                customer_id = busca_data['data'][0]['id']
            else:
                return jsonify({'sucesso': False, 'erro': 'Erro ao criar cliente'}), 400
        else:
            customer_id = cliente_data.get('id')
        
        # 2. Criar cobrança
        billing_type = 'PIX' if metodo == 'pix' else 'CREDIT_CARD'
        
        cobranca_response = requests.post(
            f'{ASAAS_API_URL}/payments',
            headers=headers,
            json={
                'customer': customer_id,
                'billingType': billing_type,
                'value': valor,
                'dueDate': '2026-02-28',  # Data de vencimento
                'description': f'e-Restituição - Plano {plano.capitalize()}'
            },
            timeout=30
        )
        
        cobranca_data = cobranca_response.json()
        
        if 'errors' in cobranca_data:
            return jsonify({
                'sucesso': False, 
                'erro': cobranca_data['errors'][0].get('description', 'Erro ao criar cobrança')
            }), 400
        
        # Retornar dados do pagamento
        return jsonify({
            'sucesso': True,
            'pagamento': {
                'id': cobranca_data.get('id'),
                'invoiceUrl': cobranca_data.get('invoiceUrl'),
                'bankSlipUrl': cobranca_data.get('bankSlipUrl'),
                'status': cobranca_data.get('status'),
                'value': cobranca_data.get('value')
            }
        })
        
    except Exception as e:
        print(f'Erro: {str(e)}')
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/api/payment-status/<payment_id>', methods=['GET'])
def payment_status(payment_id):
    """Verifica o status de um pagamento"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        }
        
        response = requests.get(
            f'{ASAAS_API_URL}/payments/{payment_id}',
            headers=headers,
            timeout=30
        )
        
        data = response.json()
        
        # Mapear status do Asaas para nosso formato
        status_map = {
            'PENDING': 'pendente',
            'RECEIVED': 'pago',
            'CONFIRMED': 'pago',
            'OVERDUE': 'vencido',
            'REFUNDED': 'estornado',
            'RECEIVED_IN_CASH': 'pago',
            'REFUND_REQUESTED': 'estorno_solicitado',
            'CHARGEBACK_REQUESTED': 'chargeback',
            'CHARGEBACK_DISPUTE': 'disputa',
            'AWAITING_CHARGEBACK_REVERSAL': 'aguardando_reversao',
            'DUNNING_REQUESTED': 'negativacao',
            'DUNNING_RECEIVED': 'negativacao_recebida',
            'AWAITING_RISK_ANALYSIS': 'analise_risco'
        }
        
        return jsonify({
            'sucesso': True,
            'status': status_map.get(data.get('status'), 'pendente'),
            'statusOriginal': data.get('status'),
            'pago': data.get('status') in ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']
        })
        
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

if __name__ == '__main__':
    print('=' * 50)
    print('PROXY DE PAGAMENTO - e-Restituição')
    print('Porta: 3001')
    print('API: Asaas (Produção)')
    print('=' * 50)
    app.run(host='0.0.0.0', port=3001)
