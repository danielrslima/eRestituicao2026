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
        "data_nascimento": "01/01/1980",
        "processo": "0001234-56.2020.5.02.0001",
        "vara": "1ª Vara do Trabalho de São Paulo",
        "exercicio": 2021,
        "valor_bruto": 150000.00,
        "valor_tributavel": 100000.00,
        "numero_meses": 48,
        "inss": 5000.00,
        "fonte_nome": "EMPRESA XYZ LTDA",
        "fonte_cnpj": "00.000.000/0001-00"
    }
    """
    try:
        dados_req = request.get_json()
        
        if not dados_req:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['nome', 'cpf', 'exercicio', 'valor_bruto', 'valor_tributavel', 'numero_meses']
        for campo in campos_obrigatorios:
            if campo not in dados_req:
                return jsonify({'error': f'Campo obrigatório ausente: {campo}'}), 400
        
        # Gerar nome do arquivo
        nome_limpo = dados_req['nome'].replace(' ', '_').upper()
        nome_arquivo = f"Esclarecimentos_{nome_limpo}_DIRPF_{dados_req['exercicio']}.pdf"
        caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
        
        # Montar estrutura de dados esperada pela função
        dados = {
            'cliente': {
                'nome': dados_req['nome'],
                'cpf': dados_req['cpf'],
                'data_nascimento': dados_req.get('data_nascimento', '-')
            },
            'processo': {
                'numero': dados_req.get('processo', '-'),
                'vara': dados_req.get('vara', 'Vara do Trabalho')
            },
            'fonte': {
                'nome': dados_req.get('fonte_nome', 'FONTE PAGADORA'),
                'cnpj': dados_req.get('fonte_cnpj', '00.000.000/0001-00')
            },
            'calculo': {
                'ano_dirpf': dados_req['exercicio'],
                'valor_total_exercicio': dados_req['valor_bruto'],
                'imposto_retido_fonte': dados_req.get('imposto_retido', 0),
                'valor_bruto_acao': dados_req['valor_bruto'],
                'valor_atualizado_rt': dados_req['valor_tributavel'],
                'percentual_rt': (dados_req['valor_tributavel'] / dados_req['valor_bruto'] * 100) if dados_req['valor_bruto'] > 0 else 0,
                'despesas_dedutiveis': dados_req.get('despesas_dedutiveis', 0),
                'rra_rendimentos_tributaveis': dados_req['valor_tributavel'],
                'rra_inss_reclamante': dados_req.get('inss', 0),
                'rra_imposto_retido': dados_req.get('imposto_retido', 0),
                'rra_meses_discutidos': dados_req['numero_meses'],
                'rendimentos_isentos': dados_req['valor_bruto'] - dados_req['valor_tributavel']
            }
        }
        
        # Gerar PDF
        gerar_esclarecimentos(dados, caminho_arquivo)
        
        return jsonify({
            'success': True,
            'arquivo': nome_arquivo,
            'caminho': caminho_arquivo,
            'download_url': f'/api/download/{nome_arquivo}'
        })
        
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

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
        dados_req = request.get_json()
        
        if not dados_req:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['nome', 'cpf', 'exercicio', 'valor_bruto', 'valor_tributavel', 'numero_meses']
        for campo in campos_obrigatorios:
            if campo not in dados_req:
                return jsonify({'error': f'Campo obrigatório ausente: {campo}'}), 400
        
        # Gerar nome do arquivo
        nome_limpo = dados_req['nome'].replace(' ', '_').upper()
        nome_arquivo = f"PlanilhaRT_{nome_limpo}_DIRPF_{dados_req['exercicio']}.pdf"
        caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
        
        # Calcular os itens da planilha RT
        valor_bruto = dados_req['valor_bruto']
        valor_tributavel = dados_req['valor_tributavel']
        numero_meses = dados_req['numero_meses']
        inss = dados_req.get('inss', 0)
        
        # Calcular valores
        # Item 1: Total de rendimentos retirado pelo autor
        item1_rendimentos_autor = valor_bruto
        
        # Item 2: Total de DARF paga (soma das DARFs)
        darfs = dados_req.get('darfs', [])
        item2_darf_paga = sum(d.get('valor', 0) for d in darfs) if darfs else 0
        
        # Item 3: Total da causa
        item3_total_causa = item1_rendimentos_autor + item2_darf_paga
        
        # Item 4: Rendimentos bruto
        item4_rendimentos_bruto = valor_bruto
        
        # Item 5: RT calculados
        item5_rt_calculados = valor_tributavel
        
        # Item 6: Proporção RT (%)
        item6_proporcao_rt = (valor_tributavel / valor_bruto * 100) if valor_bruto > 0 else 0
        
        # Item 7: Rendimentos isentos
        item7_rendimentos_isentos = valor_bruto - valor_tributavel
        
        # Item 8: RT normal
        item8_rt_normal = valor_tributavel
        
        # Item 9: Despesas totais (honorários)
        honorarios = dados_req.get('honorarios', [])
        item9_despesas_totais = sum(h.get('valor', 0) for h in honorarios) if honorarios else 0
        
        # Item 10: Proporção despesas
        item10_proporcao_despesas = item9_despesas_totais * (item6_proporcao_rt / 100) if item6_proporcao_rt > 0 else 0
        
        # Item 13: Rendimentos tributáveis
        item13_rendimentos_tributaveis = item8_rt_normal - item10_proporcao_despesas
        
        # Item 14: INSS
        item14_inss = inss if inss > 0 else None
        
        # Item 15: IRRF
        item15_irrf = item2_darf_paga
        
        # Item 18: Rendimentos isentos
        item18_rendimentos_isentos = item7_rendimentos_isentos
        
        # Montar estrutura de dados esperada pela função
        dados = {
            'cliente': {
                'nome': dados_req['nome'],
                'cpf': dados_req['cpf'],
                'data_nascimento': dados_req.get('data_nascimento', '-')
            },
            'processo': {
                'numero': dados_req.get('processo', '-'),
                'vara': dados_req.get('vara', 'Vara do Trabalho'),
                'comarca': dados_req.get('comarca', '-')
            },
            'fonte': {
                'nome': dados_req.get('fonte_nome', 'FONTE PAGADORA'),
                'cnpj': dados_req.get('fonte_cnpj', '00.000.000/0001-00')
            },
            'calculo': {
                'ano_dirpf': dados_req['exercicio'],
                'mes_recebimento': dados_req.get('mes_recebimento', 'DEZEMBRO'),
                'meses_discutidos': numero_meses,
                
                # Itens 1-3
                'item1_rendimentos_autor': item1_rendimentos_autor,
                'item2_darf_paga': item2_darf_paga,
                'item3_total_causa': item3_total_causa,
                
                # Itens 4-10
                'item4_rendimentos_bruto': item4_rendimentos_bruto,
                'item5_rt_calculados': item5_rt_calculados,
                'item6_proporcao_rt': item6_proporcao_rt,
                'item7_rendimentos_isentos': item7_rendimentos_isentos,
                'item8_rt_normal': item8_rt_normal,
                'item9_despesas_totais': item9_despesas_totais,
                'item10_proporcao_despesas': item10_proporcao_despesas,
                
                # Itens 11-18
                'item13_rendimentos_tributaveis': item13_rendimentos_tributaveis,
                'item14_inss': item14_inss,
                'item15_irrf': item15_irrf,
                'item18_rendimentos_isentos': item18_rendimentos_isentos
            },
            'alvaras': dados_req.get('alvaras', []),
            'darfs': darfs,
            'honorarios': honorarios
        }
        
        # Gerar PDF
        gerar_planilha_rt(dados, caminho_arquivo)
        
        return jsonify({
            'success': True,
            'arquivo': nome_arquivo,
            'caminho': caminho_arquivo,
            'download_url': f'/api/download/{nome_arquivo}'
        })
        
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

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
        
        # Mapear tipo para título
        titulos = {
            'esclarecimentos': 'ESCLARECIMENTOS',
            'planilha_rt': 'PLANILHA RT',
            'alvara': 'ALVARÁ',
            'darf': 'DARF',
            'honorarios': 'HONORÁRIOS'
        }
        
        titulo = titulo_personalizado if titulo_personalizado else titulos.get(tipo, tipo.upper())
        
        # Gerar nome do arquivo
        nome_arquivo = f"Encarte_{tipo}.pdf"
        caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
        
        # Gerar PDF - função espera (titulo, output_path, subtitulo)
        gerar_encarte(titulo, caminho_arquivo)
        
        return jsonify({
            'success': True,
            'arquivo': nome_arquivo,
            'caminho': caminho_arquivo,
            'download_url': f'/api/download/{nome_arquivo}'
        })
        
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

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
        dados_req = request.get_json()
        
        if not dados_req or 'cliente' not in dados_req or 'exercicios' not in dados_req:
            return jsonify({'error': 'Dados incompletos'}), 400
        
        cliente = dados_req['cliente']
        exercicios = dados_req['exercicios']
        encartes_solicitados = dados_req.get('encartes', ['esclarecimentos', 'planilha_rt'])
        
        arquivos_gerados = []
        
        # Mapear tipo para título
        titulos = {
            'esclarecimentos': 'ESCLARECIMENTOS',
            'planilha_rt': 'PLANILHA RT',
            'alvara': 'ALVARÁ',
            'darf': 'DARF',
            'honorarios': 'HONORÁRIOS'
        }
        
        # Gerar encartes
        for encarte_tipo in encartes_solicitados:
            nome_arquivo = f"Encarte_{encarte_tipo}.pdf"
            caminho_arquivo = os.path.join(OUTPUT_DIR, nome_arquivo)
            titulo = titulos.get(encarte_tipo, encarte_tipo.upper())
            gerar_encarte(titulo, caminho_arquivo)
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
                
                # Montar estrutura de dados
                dados_esc = {
                    'cliente': {
                        'nome': cliente['nome'],
                        'cpf': cliente['cpf'],
                        'data_nascimento': cliente.get('data_nascimento', '-')
                    },
                    'processo': {
                        'numero': cliente.get('processo', '-'),
                        'vara': cliente.get('vara', 'Vara do Trabalho')
                    },
                    'fonte': {
                        'nome': cliente.get('fonte_nome', 'FONTE PAGADORA'),
                        'cnpj': cliente.get('fonte_cnpj', '00.000.000/0001-00')
                    },
                    'calculo': {
                        'ano_dirpf': ano,
                        'valor_total_exercicio': exercicio['valor_bruto'],
                        'imposto_retido_fonte': exercicio.get('imposto_retido', 0),
                        'valor_bruto_acao': exercicio['valor_bruto'],
                        'valor_atualizado_rt': exercicio['valor_tributavel'],
                        'percentual_rt': (exercicio['valor_tributavel'] / exercicio['valor_bruto'] * 100) if exercicio['valor_bruto'] > 0 else 0,
                        'despesas_dedutiveis': exercicio.get('despesas_dedutiveis', 0),
                        'rra_rendimentos_tributaveis': exercicio['valor_tributavel'],
                        'rra_inss_reclamante': exercicio.get('inss', 0),
                        'rra_imposto_retido': exercicio.get('imposto_retido', 0),
                        'rra_meses_discutidos': exercicio['numero_meses'],
                        'rendimentos_isentos': exercicio['valor_bruto'] - exercicio['valor_tributavel']
                    }
                }
                
                gerar_esclarecimentos(dados_esc, caminho_esc)
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
                
                # Montar estrutura de dados
                dados_rt = {
                    'cliente': {
                        'nome': cliente['nome'],
                        'cpf': cliente['cpf']
                    },
                    'processo': {
                        'numero': cliente.get('processo', '-'),
                        'vara': cliente.get('vara', 'Vara do Trabalho'),
                        'comarca': cliente.get('comarca', '-')
                    },
                    'fonte': {
                        'nome': cliente.get('fonte_nome', 'FONTE PAGADORA'),
                        'cnpj': cliente.get('fonte_cnpj', '00.000.000/0001-00')
                    },
                    'calculo': {
                        'ano_dirpf': ano,
                        'valor_bruto': exercicio['valor_bruto'],
                        'valor_tributavel': exercicio['valor_tributavel'],
                        'numero_meses': exercicio['numero_meses'],
                        'inss': exercicio.get('inss', 0)
                    },
                    'alvaras': exercicio.get('alvaras', []),
                    'darfs': exercicio.get('darfs', []),
                    'honorarios': exercicio.get('honorarios', [])
                }
                
                gerar_planilha_rt(dados_rt, caminho_rt)
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
