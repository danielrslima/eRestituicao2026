"""
API de Geração de PDFs - e-Restituição
Servidor Flask para gerar PDFs automaticamente (Esclarecimentos, Planilha RT, Encarte)
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import json
from datetime import datetime

# Adicionar o diretório de serviços ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src', 'services'))

from pdfEsclarecimentos import gerar_esclarecimentos
from pdfPlanilhaRT import gerar_planilha_rt
from pdfEncarte import gerar_encarte

app = Flask(__name__)
CORS(app)  # Permitir requisições de qualquer origem

# Diretório para salvar PDFs gerados
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'pdfs_gerados')
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verificar se a API está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'API de PDFs funcionando',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/gerar-esclarecimentos', methods=['POST'])
def api_gerar_esclarecimentos():
    """
    Gerar PDF de Esclarecimentos
    
    Body JSON esperado:
    {
        "nome": "JOSÉ RAMOS DA SILVA",
        "cpf": "070.817.318-72",
        "processo": "0001234-56.2020.5.02.0001",
        "exercicio": 2021,
        "valor_bruto": 150000.00,
        "valor_tributavel": 100000.00,
        "numero_meses": 48,
        "inss": 5000.00
    }
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['nome', 'cpf', 'exercicio', 'valor_bruto', 'valor_tributavel', 'numero_meses']
        for campo in campos_obrigatorios:
            if campo not in dados:
                return jsonify({'error': f'Campo obrigatório ausente: {campo}'}), 400
        
        # Gerar nome do arquivo
        nome_limpo = dados['nome'].replace(' ', '_').upper()
        nome_arquivo = f"Esclarecimentos_{nome_limpo}_DIRPF_{dados['exercicio']}.pdf"
        caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
        
        # Gerar PDF
        gerar_esclarecimentos(
            nome=dados['nome'],
            cpf=dados['cpf'],
            processo=dados.get('processo', ''),
            exercicio=dados['exercicio'],
            valor_bruto=dados['valor_bruto'],
            valor_tributavel=dados['valor_tributavel'],
            numero_meses=dados['numero_meses'],
            inss=dados.get('inss', 0),
            output_path=caminho_arquivo
        )
        
        return jsonify({
            'success': True,
            'arquivo': nome_arquivo,
            'caminho': caminho_arquivo,
            'download_url': f'/api/download/{nome_arquivo}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gerar-planilha-rt', methods=['POST'])
def api_gerar_planilha_rt():
    """
    Gerar PDF da Planilha RT
    
    Body JSON esperado:
    {
        "nome": "JOSÉ RAMOS DA SILVA",
        "cpf": "070.817.318-72",
        "processo": "0001234-56.2020.5.02.0001",
        "exercicio": 2021,
        "valor_bruto": 150000.00,
        "valor_tributavel": 100000.00,
        "numero_meses": 48,
        "inss": 5000.00,
        "alvaras": [{"valor": 50000, "data": "2021-05-15"}],
        "darfs": [{"valor": 10000, "ano": 2021}],
        "honorarios": [{"valor": 15000, "ano": 2021}]
    }
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['nome', 'cpf', 'exercicio', 'valor_bruto', 'valor_tributavel', 'numero_meses']
        for campo in campos_obrigatorios:
            if campo not in dados:
                return jsonify({'error': f'Campo obrigatório ausente: {campo}'}), 400
        
        # Gerar nome do arquivo
        nome_limpo = dados['nome'].replace(' ', '_').upper()
        nome_arquivo = f"PlanilhaRT_{nome_limpo}_DIRPF_{dados['exercicio']}.pdf"
        caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
        
        # Gerar PDF
        gerar_planilha_rt(
            nome=dados['nome'],
            cpf=dados['cpf'],
            processo=dados.get('processo', ''),
            exercicio=dados['exercicio'],
            valor_bruto=dados['valor_bruto'],
            valor_tributavel=dados['valor_tributavel'],
            numero_meses=dados['numero_meses'],
            inss=dados.get('inss', 0),
            alvaras=dados.get('alvaras', []),
            darfs=dados.get('darfs', []),
            honorarios=dados.get('honorarios', []),
            output_path=caminho_arquivo
        )
        
        return jsonify({
            'success': True,
            'arquivo': nome_arquivo,
            'caminho': caminho_arquivo,
            'download_url': f'/api/download/{nome_arquivo}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gerar-encarte', methods=['POST'])
def api_gerar_encarte():
    """
    Gerar PDF de Encarte
    
    Body JSON esperado:
    {
        "tipo": "esclarecimentos",  // ou "planilha_rt", "alvara", etc.
        "titulo_personalizado": ""  // opcional, para encarte personalizado
    }
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        tipo = dados.get('tipo', 'esclarecimentos')
        titulo_personalizado = dados.get('titulo_personalizado', '')
        
        # Gerar nome do arquivo
        nome_arquivo = f"Encarte_{tipo}.pdf"
        caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
        
        # Gerar PDF
        gerar_encarte(
            tipo=tipo,
            titulo_personalizado=titulo_personalizado,
            output_path=caminho_arquivo
        )
        
        return jsonify({
            'success': True,
            'arquivo': nome_arquivo,
            'caminho': caminho_arquivo,
            'download_url': f'/api/download/{nome_arquivo}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gerar-kit-completo', methods=['POST'])
def api_gerar_kit_completo():
    """
    Gerar Kit IR completo (Encarte + Esclarecimentos + Planilha RT) para um cliente
    
    Body JSON esperado:
    {
        "cliente": {
            "nome": "JOSÉ RAMOS DA SILVA",
            "cpf": "070.817.318-72",
            "processo": "0001234-56.2020.5.02.0001"
        },
        "exercicios": [
            {
                "ano": 2021,
                "valor_bruto": 150000.00,
                "valor_tributavel": 100000.00,
                "numero_meses": 48,
                "inss": 5000.00,
                "alvaras": [...],
                "darfs": [...],
                "honorarios": [...]
            }
        ],
        "encartes": ["esclarecimentos", "planilha_rt"]
    }
    """
    try:
        dados = request.get_json()
        
        if not dados or 'cliente' not in dados or 'exercicios' not in dados:
            return jsonify({'error': 'Dados incompletos'}), 400
        
        cliente = dados['cliente']
        exercicios = dados['exercicios']
        encartes_solicitados = dados.get('encartes', ['esclarecimentos', 'planilha_rt'])
        
        arquivos_gerados = []
        
        # Gerar encartes
        for encarte_tipo in encartes_solicitados:
            nome_arquivo = f"Encarte_{encarte_tipo}.pdf"
            caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
            gerar_encarte(tipo=encarte_tipo, output_path=caminho_arquivo)
            arquivos_gerados.append({
                'tipo': 'encarte',
                'encarte': encarte_tipo,
                'arquivo': nome_arquivo,
                'download_url': f'/api/download/{nome_arquivo}'
            })
        
        # Gerar PDFs para cada exercício
        for exercicio in exercicios:
            ano = exercicio['ano']
            nome_limpo = cliente['nome'].replace(' ', '_').upper()
            
            # Esclarecimentos
            if 'esclarecimentos' in encartes_solicitados:
                nome_esc = f"Esclarecimentos_{nome_limpo}_DIRPF_{ano}.pdf"
                caminho_esc = os.path.join(OUTPUT_DIR, nome_esc)
                gerar_esclarecimentos(
                    nome=cliente['nome'],
                    cpf=cliente['cpf'],
                    processo=cliente.get('processo', ''),
                    exercicio=ano,
                    valor_bruto=exercicio['valor_bruto'],
                    valor_tributavel=exercicio['valor_tributavel'],
                    numero_meses=exercicio['numero_meses'],
                    inss=exercicio.get('inss', 0),
                    output_path=caminho_esc
                )
                arquivos_gerados.append({
                    'tipo': 'esclarecimentos',
                    'exercicio': ano,
                    'arquivo': nome_esc,
                    'download_url': f'/api/download/{nome_esc}'
                })
            
            # Planilha RT
            if 'planilha_rt' in encartes_solicitados:
                nome_rt = f"PlanilhaRT_{nome_limpo}_DIRPF_{ano}.pdf"
                caminho_rt = os.path.join(OUTPUT_DIR, nome_rt)
                gerar_planilha_rt(
                    nome=cliente['nome'],
                    cpf=cliente['cpf'],
                    processo=cliente.get('processo', ''),
                    exercicio=ano,
                    valor_bruto=exercicio['valor_bruto'],
                    valor_tributavel=exercicio['valor_tributavel'],
                    numero_meses=exercicio['numero_meses'],
                    inss=exercicio.get('inss', 0),
                    alvaras=exercicio.get('alvaras', []),
                    darfs=exercicio.get('darfs', []),
                    honorarios=exercicio.get('honorarios', []),
                    output_path=caminho_rt
                )
                arquivos_gerados.append({
                    'tipo': 'planilha_rt',
                    'exercicio': ano,
                    'arquivo': nome_rt,
                    'download_url': f'/api/download/{nome_rt}'
                })
        
        return jsonify({
            'success': True,
            'cliente': cliente['nome'],
            'arquivos': arquivos_gerados,
            'total_arquivos': len(arquivos_gerados)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<nome_arquivo>', methods=['GET'])
def download_arquivo(nome_arquivo):
    """Download de arquivo PDF gerado"""
    try:
        caminho = os.path.join(OUTPUT_DIR, nome_arquivo)
        if os.path.exists(caminho):
            return send_file(caminho, as_attachment=True)
        else:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/listar-pdfs', methods=['GET'])
def listar_pdfs():
    """Listar todos os PDFs gerados"""
    try:
        arquivos = []
        for arquivo in os.listdir(OUTPUT_DIR):
            if arquivo.endswith('.pdf'):
                caminho = os.path.join(OUTPUT_DIR, arquivo)
                arquivos.append({
                    'nome': arquivo,
                    'tamanho': os.path.getsize(caminho),
                    'data_criacao': datetime.fromtimestamp(os.path.getctime(caminho)).isoformat(),
                    'download_url': f'/api/download/{arquivo}'
                })
        return jsonify({'arquivos': arquivos, 'total': len(arquivos)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("API de Geração de PDFs - e-Restituição")
    print("=" * 50)
    print(f"Diretório de saída: {OUTPUT_DIR}")
    print("Endpoints disponíveis:")
    print("  GET  /api/health - Verificar status")
    print("  POST /api/gerar-esclarecimentos - Gerar PDF de Esclarecimentos")
    print("  POST /api/gerar-planilha-rt - Gerar PDF da Planilha RT")
    print("  POST /api/gerar-encarte - Gerar PDF de Encarte")
    print("  POST /api/gerar-kit-completo - Gerar Kit IR completo")
    print("  GET  /api/download/<arquivo> - Download de PDF")
    print("  GET  /api/listar-pdfs - Listar PDFs gerados")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
