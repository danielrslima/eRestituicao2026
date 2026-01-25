"""
Gerador de PDFs em Lote - Esclarecimentos e Planilha RT
Gera um par de PDFs para cada exercício do cliente
COM CÁLCULOS AUTOMÁTICOS CORRETOS
"""

import os
from datetime import datetime
from pdfEsclarecimentos import gerar_esclarecimentos
from pdfPlanilhaRT import gerar_planilha_rt


def calcular_campos_pdf(dados_entrada):
    """
    Calcula automaticamente os campos derivados para os PDFs
    baseado nas fórmulas corretas.
    
    Fórmulas:
    - Item 3 = Item 1 + Item 2
    - Item 6 = (Item 5 / Item 4) × 100
    - Item 7 = Item 4 - Item 5
    - Item 8 = Item 3 × (Item 6 / 100)
    - Item 10 = Item 9 × (Item 6 / 100)  ← CORRIGIDO
    - Item 13 = Item 8 - Item 10         ← CORRIGIDO
    - Item 18 = Item 7
    """
    
    # Dados de entrada
    item1 = dados_entrada.get('item1_rendimentos_autor', 0)
    item2 = dados_entrada.get('item2_darf_paga', 0)
    item4 = dados_entrada.get('item4_rendimentos_bruto', 0)
    item5 = dados_entrada.get('item5_rt_calculados', 0)
    item9 = dados_entrada.get('item9_despesas_totais', 0)
    
    # Cálculos
    item3 = item1 + item2  # Total da Causa
    
    # Proporção de RT (Item 6)
    if item4 > 0:
        item6 = (item5 / item4) * 100
    else:
        item6 = 0
    
    item7 = item4 - item5  # Total de Rendimentos Isentos
    
    # Item 8 = Total da Causa × Proporção RT
    item8 = item3 * (item6 / 100)
    
    # Item 10 = Despesas × Proporção RT (CORRIGIDO!)
    item10 = item9 * (item6 / 100)
    
    # Item 13 = RT Normal - Proporção Despesas (CORRIGIDO!)
    item13 = item8 - item10
    
    # Item 18 = Rendimentos Isentos (igual ao Item 7)
    item18 = item7
    
    return {
        'item3_total_causa': round(item3, 2),
        'item6_proporcao_rt': round(item6, 4),
        'item7_rendimentos_isentos': round(item7, 2),
        'item8_rt_normal': round(item8, 2),
        'item10_proporcao_despesas': round(item10, 2),
        'item13_rendimentos_tributaveis': round(item13, 2),
        'item18_rendimentos_isentos': round(item18, 2),
        # Para Esclarecimentos
        'rra_rendimentos_tributaveis': round(item13, 2),  # = Item 13
        'rendimentos_isentos': round(item18, 2),  # = Item 18
        'despesas_dedutiveis': round(item10, 2),  # = Item 10
        'valor_atualizado_rt': round(item8, 2),  # = Item 8
        'percentual_rt': round(item6, 4),  # = Item 6
        'valor_bruto_acao': round(item3, 2),  # = Item 3
    }


def gerar_pdfs_cliente(cliente_dados, exercicios, pasta_saida):
    """
    Gera todos os PDFs para um cliente com múltiplos exercícios
    """
    
    # Criar pasta de saída se não existir
    os.makedirs(pasta_saida, exist_ok=True)
    
    pdfs_gerados = []
    
    for exercicio in exercicios:
        ano = exercicio['ano_dirpf']
        calculo = exercicio['calculo']
        
        # Calcular campos derivados automaticamente
        campos_calculados = calcular_campos_pdf(calculo)
        
        # Mesclar dados de entrada com campos calculados
        calculo_completo = {**calculo, **campos_calculados}
        
        # Montar dados para Esclarecimentos
        dados_esclarecimentos = {
            'cliente': cliente_dados,
            'processo': exercicio['processo'],
            'fonte': exercicio['fonte'],
            'calculo': {
                'ano_dirpf': ano,
                'valor_total_exercicio': calculo.get('valor_total_exercicio', calculo.get('item1_rendimentos_autor', 0)),
                'imposto_retido_fonte': calculo.get('imposto_retido_fonte', calculo.get('item2_darf_paga', 0)),
                'valor_bruto_acao': campos_calculados['valor_bruto_acao'],
                'valor_atualizado_rt': campos_calculados['valor_atualizado_rt'],
                'percentual_rt': campos_calculados['percentual_rt'],
                'despesas_dedutiveis': campos_calculados['despesas_dedutiveis'],
                'rra_rendimentos_tributaveis': campos_calculados['rra_rendimentos_tributaveis'],
                'rra_inss_reclamante': calculo.get('item14_inss', 0) or 0,
                'rra_imposto_retido': calculo.get('item15_irrf', calculo.get('item2_darf_paga', 0)),
                'rra_meses_discutidos': calculo.get('meses_discutidos', 0),
                'rendimentos_isentos': campos_calculados['rendimentos_isentos']
            }
        }
        
        # Montar dados para Planilha RT
        dados_planilha = {
            'cliente': cliente_dados,
            'processo': exercicio['processo'],
            'fonte': exercicio['fonte'],
            'calculo': {
                'ano_dirpf': ano,
                'mes_recebimento': calculo.get('mes_recebimento', 'DEZEMBRO'),
                'meses_discutidos': calculo.get('meses_discutidos', 0),
                'item1_rendimentos_autor': calculo.get('item1_rendimentos_autor', 0),
                'item2_darf_paga': calculo.get('item2_darf_paga', 0),
                'item3_total_causa': campos_calculados['item3_total_causa'],
                'item4_rendimentos_bruto': calculo.get('item4_rendimentos_bruto', 0),
                'item5_rt_calculados': calculo.get('item5_rt_calculados', 0),
                'item6_proporcao_rt': campos_calculados['item6_proporcao_rt'],
                'item7_rendimentos_isentos': campos_calculados['item7_rendimentos_isentos'],
                'item8_rt_normal': campos_calculados['item8_rt_normal'],
                'item9_despesas_totais': calculo.get('item9_despesas_totais', 0),
                'item10_proporcao_despesas': campos_calculados['item10_proporcao_despesas'],
                'item13_rendimentos_tributaveis': campos_calculados['item13_rendimentos_tributaveis'],
                'item14_inss': calculo.get('item14_inss'),
                'item15_irrf': calculo.get('item15_irrf', calculo.get('item2_darf_paga', 0)),
                'item18_rendimentos_isentos': campos_calculados['item18_rendimentos_isentos']
            }
        }
        
        # Gerar nome dos arquivos
        nome_base = cliente_dados['nome'].replace(' ', '_').upper()
        
        # Gerar Esclarecimentos
        caminho_esclarecimentos = os.path.join(
            pasta_saida, 
            f"Esclarecimentos_{nome_base}_DIRPF_{ano}.pdf"
        )
        gerar_esclarecimentos(dados_esclarecimentos, caminho_esclarecimentos)
        pdfs_gerados.append({
            'tipo': 'Esclarecimentos',
            'ano': ano,
            'caminho': caminho_esclarecimentos
        })
        
        # Gerar Planilha RT
        caminho_planilha = os.path.join(
            pasta_saida, 
            f"PlanilhaRT_{nome_base}_DIRPF_{ano}.pdf"
        )
        gerar_planilha_rt(dados_planilha, caminho_planilha)
        pdfs_gerados.append({
            'tipo': 'PlanilhaRT',
            'ano': ano,
            'caminho': caminho_planilha
        })
        
        # Log dos cálculos
        print(f"✅ PDFs gerados para DIRPF {ano}")
        print(f"   Item 9 (Despesas): R$ {calculo.get('item9_despesas_totais', 0):,.2f}")
        print(f"   Item 6 (Proporção): {campos_calculados['item6_proporcao_rt']:.4f}%")
        print(f"   Item 10 (Proporção Despesas): R$ {campos_calculados['item10_proporcao_despesas']:,.2f}")
        print(f"   Item 13 (RT Tributáveis): R$ {campos_calculados['item13_rendimentos_tributaveis']:,.2f}")
        print(f"   Item 18 (Isentos): R$ {campos_calculados['item18_rendimentos_isentos']:,.2f}")
        print()
    
    return pdfs_gerados


# Função de teste com Ana Carmen (3 exercícios)
if __name__ == "__main__":
    
    # Dados da cliente
    cliente = {
        'nome': 'ANA CARMEN SOUZA',
        'cpf': '123.456.789-00',
        'data_nascimento': '15/03/1975'
    }
    
    # 3 exercícios da Ana Carmen - APENAS DADOS DE ENTRADA
    # Os campos derivados serão calculados automaticamente
    exercicios = [
        {
            'ano_dirpf': 2022,
            'processo': {
                'numero': '0001234-56.2020.5.17.0001',
                'comarca': 'Vitória-ES',
                'vara': '1ª Vara do Trabalho'
            },
            'fonte': {
                'cnpj': '12.345.678/0001-90',
                'nome': 'EMPRESA ABC S/A'
            },
            'calculo': {
                'mes_recebimento': 'MARÇO',
                'meses_discutidos': 24,
                # Dados de entrada
                'valor_total_exercicio': 45000.00,
                'imposto_retido_fonte': 4500.00,
                'item1_rendimentos_autor': 45000.00,
                'item2_darf_paga': 4500.00,
                'item4_rendimentos_bruto': 45000.00,
                'item5_rt_calculados': 16363.64,
                'item9_despesas_totais': 13500.00,
                'item14_inss': None,
                'item15_irrf': 4500.00,
            }
        },
        {
            'ano_dirpf': 2023,
            'processo': {
                'numero': '0001234-56.2020.5.17.0001',
                'comarca': 'Vitória-ES',
                'vara': '1ª Vara do Trabalho'
            },
            'fonte': {
                'cnpj': '12.345.678/0001-90',
                'nome': 'EMPRESA ABC S/A'
            },
            'calculo': {
                'mes_recebimento': 'MARÇO',
                'meses_discutidos': 18,
                # Dados de entrada
                'valor_total_exercicio': 38000.00,
                'imposto_retido_fonte': 3800.00,
                'item1_rendimentos_autor': 38000.00,
                'item2_darf_paga': 3800.00,
                'item4_rendimentos_bruto': 38000.00,
                'item5_rt_calculados': 13816.80,
                'item9_despesas_totais': 11400.00,
                'item14_inss': None,
                'item15_irrf': 3800.00,
            }
        },
        {
            'ano_dirpf': 2024,
            'processo': {
                'numero': '0001234-56.2020.5.17.0001',
                'comarca': 'Vitória-ES',
                'vara': '1ª Vara do Trabalho'
            },
            'fonte': {
                'cnpj': '12.345.678/0001-90',
                'nome': 'EMPRESA ABC S/A'
            },
            'calculo': {
                'mes_recebimento': 'MARÇO',
                'meses_discutidos': 12,
                # Dados de entrada
                'valor_total_exercicio': 25000.00,
                'imposto_retido_fonte': 2500.00,
                'item1_rendimentos_autor': 25000.00,
                'item2_darf_paga': 2500.00,
                'item4_rendimentos_bruto': 25000.00,
                'item5_rt_calculados': 9090.91,
                'item9_despesas_totais': 7500.00,
                'item14_inss': None,
                'item15_irrf': 2500.00,
            }
        }
    ]
    
    # Gerar PDFs
    pasta = "/home/ubuntu/restituicaoia/teste_pdfs_ana_carmen"
    pdfs = gerar_pdfs_cliente(cliente, exercicios, pasta)
    
    print(f"\n📦 Total de PDFs gerados: {len(pdfs)}")
    for pdf in pdfs:
        print(f"   - {pdf['tipo']} DIRPF {pdf['ano']}: {pdf['caminho']}")
