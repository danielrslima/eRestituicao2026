"""
Gerador de PDF - Planilha RT (Demonstrativo de Apuração das Verbas Tributáveis)
Fiel ao layout original do documento de referência
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import black, white, HexColor
from reportlab.pdfgen import canvas
import os
from datetime import datetime

# Cores do documento
COR_VERDE = HexColor('#1a7f37')
COR_LARANJA = HexColor('#ff6600')
COR_CINZA_ESCURO = HexColor('#333333')
COR_CINZA_MEDIO = HexColor('#666666')
COR_CINZA_CLARO = HexColor('#f0f0f0')
COR_BORDA = HexColor('#999999')
COR_HEADER = HexColor('#333333')

def formatar_moeda(valor, sem_cifrao=False):
    """Formata valor para moeda brasileira"""
    if valor is None or valor == 0:
        return "-"
    formatado = f"{valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return formatado if sem_cifrao else f"R$ {formatado}"

def formatar_percentual(valor):
    """Formata valor para percentual"""
    if valor is None:
        return "-"
    return f"{valor:.4f}%".replace(".", ",")

def desenhar_tabela_simples(c, x, y, largura, dados, col_widths, header_bg=COR_HEADER):
    """Desenha uma tabela simples com header escuro"""
    altura_linha = 7 * mm
    
    for i, linha in enumerate(dados):
        y_linha = y - (i * altura_linha)
        
        # Header (primeira linha)
        if i == 0:
            c.setFillColor(header_bg)
            c.rect(x, y_linha - altura_linha, largura, altura_linha, fill=True, stroke=False)
            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 9)
        else:
            # Linhas alternadas
            if i % 2 == 0:
                c.setFillColor(COR_CINZA_CLARO)
                c.rect(x, y_linha - altura_linha, largura, altura_linha, fill=True, stroke=False)
            c.setFillColor(black)
            c.setFont("Helvetica", 9)
        
        # Borda da linha
        c.setStrokeColor(COR_BORDA)
        c.rect(x, y_linha - altura_linha, largura, altura_linha, fill=False, stroke=True)
        
        # Conteúdo das células
        x_atual = x
        for j, (celula, largura_col) in enumerate(zip(linha, col_widths)):
            # Alinhamento: primeira coluna à esquerda, demais à direita
            if j == 0:
                c.drawString(x_atual + 2*mm, y_linha - altura_linha + 2*mm, str(celula))
            else:
                c.drawRightString(x_atual + largura_col - 2*mm, y_linha - altura_linha + 2*mm, str(celula))
            x_atual += largura_col
    
    return y - (len(dados) * altura_linha)


def gerar_planilha_rt(dados, caminho_saida):
    """
    Gera o PDF da Planilha RT
    
    dados = {
        'cliente': {
            'nome': 'JOSE RAMOS CONCEIÇÃO',
            'cpf': '003.003.987-86',
            'data_nascimento': '25/08/1969'
        },
        'processo': {
            'numero': '0001971-78.2015.5.17.0007',
            'comarca': 'Vitória-ES',
            'vara': '7a. Vara do Trabalho'
        },
        'fonte': {
            'cnpj': '33.592.510/0001-54',
            'nome': 'VALE S/A'
        },
        'calculo': {
            'ano_dirpf': 2021,
            'mes_recebimento': 'DEZEMBRO',
            'meses_discutidos': 58,
            
            # Itens 1-3
            'item1_rendimentos_autor': 2315218.05,
            'item2_darf_paga': 220597.31,
            'item3_total_causa': 2535815.36,
            
            # Itens 4-10
            'item4_rendimentos_bruto': 2533329.85,
            'item5_rt_calculados': 985527.96,
            'item6_proporcao_rt': 38.9048,
            'item7_rendimentos_isentos': 1549260.42,
            'item8_rt_normal': 986554.94,
            'item9_despesas_totais': 694572.02,
            'item10_proporcao_despesas': 270222.14,
            
            # Itens 11-18
            'item13_rendimentos_tributaveis': 716332.80,
            'item14_inss': None,
            'item15_irrf': 220597.31,
            'item18_rendimentos_isentos': 1549260.42
        }
    }
    """
    
    # Criar canvas
    c = canvas.Canvas(caminho_saida, pagesize=A4)
    largura, altura = A4
    
    # Margens
    margem_esq = 20 * mm
    margem_dir = 20 * mm
    margem_sup = 15 * mm
    largura_util = largura - margem_esq - margem_dir
    
    y = altura - margem_sup
    
    # ========================================
    # LOGO IR360 (usando imagem real)
    # ========================================
    
    # Caminho do logo
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'assets', 'logo_ir360.jpg')
    
    # Se o logo existir, usar a imagem; senão, desenhar manualmente
    if os.path.exists(logo_path):
        # Usar imagem do logo - centralizado
        logo_largura = 70 * mm
        logo_altura = 25 * mm
        logo_x = (largura - logo_largura) / 2
        c.drawImage(logo_path, logo_x, y - logo_altura, width=logo_largura, height=logo_altura, preserveAspectRatio=True, mask='auto')
    else:
        # Fallback: desenhar logo manualmente
        logo_centro = largura/2
        logo_y_pos = y - 10*mm
        
        # Círculo laranja com gradiente (simplificado)
        c.setFillColor(COR_LARANJA)
        c.circle(logo_centro - 45*mm, logo_y_pos, 10*mm, fill=True, stroke=False)
        # Corte branco no círculo
        c.setFillColor(white)
        c.circle(logo_centro - 42*mm, logo_y_pos + 3*mm, 4*mm, fill=True, stroke=False)
        
        # Texto "IR360" em azul escuro
        COR_AZUL_ESCURO = HexColor('#1e2a4a')
        c.setFillColor(COR_AZUL_ESCURO)
        c.setFont("Helvetica-Bold", 48)
        c.drawString(logo_centro - 30*mm, logo_y_pos - 8*mm, "IR360")
    
    y -= 35 * mm
    
    # ========================================
    # TÍTULO PRINCIPAL
    # ========================================
    
    # Caixa do título
    titulo_altura = 12 * mm
    c.setFillColor(COR_CINZA_CLARO)
    c.rect(margem_esq, y - titulo_altura, largura_util * 0.65, titulo_altura, fill=True, stroke=True)
    
    c.setFillColor(black)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margem_esq + 3*mm, y - 5*mm, "DEMONSTRATIVO DE APURAÇÃO DAS VERBAS TRIBUTÁVEIS")
    c.drawString(margem_esq + 3*mm, y - 10*mm, "REFERENTES À RECLAMAÇÃO TRABALHISTA")
    
    # DIRPF e ANO
    x_dirpf = margem_esq + largura_util * 0.65
    c.rect(x_dirpf, y - titulo_altura, largura_util * 0.2, titulo_altura, fill=False, stroke=True)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(x_dirpf + largura_util * 0.1, y - 7*mm, "DIRPF")
    
    x_ano = x_dirpf + largura_util * 0.2
    c.rect(x_ano, y - titulo_altura, largura_util * 0.15, titulo_altura, fill=False, stroke=True)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(x_ano + largura_util * 0.075, y - 8*mm, str(dados['calculo']['ano_dirpf']))
    
    y -= titulo_altura + 5*mm
    
    # ========================================
    # DADOS DO CONTRIBUINTE
    # ========================================
    
    c.setFillColor(COR_HEADER)
    c.rect(margem_esq, y - 6*mm, largura_util, 6*mm, fill=True, stroke=False)
    c.setFillColor(white)
    c.setFont("Helvetica-BoldOblique", 9)
    c.drawCentredString(largura/2, y - 4.5*mm, "DADOS DO CONTRIBUINTE")
    
    y -= 6*mm
    
    # Tabela contribuinte
    dados_contribuinte = [
        ["Nome do Cliente:", dados['cliente']['nome']],
        ["CPF:", dados['cliente']['cpf']],
        ["Data de Nascimento:", dados['cliente']['data_nascimento']]
    ]
    
    for i, (campo, valor) in enumerate(dados_contribuinte):
        c.setFillColor(COR_CINZA_CLARO if i % 2 == 0 else white)
        c.rect(margem_esq, y - 6*mm, largura_util * 0.35, 6*mm, fill=True, stroke=True)
        c.rect(margem_esq + largura_util * 0.35, y - 6*mm, largura_util * 0.65, 6*mm, fill=False, stroke=True)
        
        c.setFillColor(black)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(margem_esq + 2*mm, y - 4.5*mm, campo)
        c.setFont("Helvetica", 9)
        c.drawCentredString(margem_esq + largura_util * 0.35 + largura_util * 0.325, y - 4.5*mm, valor)
        
        y -= 6*mm
    
    y -= 5*mm
    
    # ========================================
    # DADOS DO PROCESSO
    # ========================================
    
    c.setFillColor(COR_HEADER)
    c.rect(margem_esq, y - 6*mm, largura_util, 6*mm, fill=True, stroke=False)
    c.setFillColor(white)
    c.setFont("Helvetica-BoldOblique", 9)
    c.drawCentredString(largura/2, y - 4.5*mm, "DADOS DO PROCESSO")
    
    y -= 6*mm
    
    dados_processo = [
        ["Nº Processo", dados['processo']['numero']],
        ["Comarca:", dados['processo']['comarca']],
        ["Vara:", dados['processo']['vara']]
    ]
    
    for i, (campo, valor) in enumerate(dados_processo):
        c.setFillColor(COR_CINZA_CLARO if i % 2 == 0 else white)
        c.rect(margem_esq, y - 6*mm, largura_util * 0.35, 6*mm, fill=True, stroke=True)
        c.rect(margem_esq + largura_util * 0.35, y - 6*mm, largura_util * 0.65, 6*mm, fill=False, stroke=True)
        
        c.setFillColor(black)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(margem_esq + 2*mm, y - 4.5*mm, campo)
        c.setFont("Helvetica", 9)
        c.drawCentredString(margem_esq + largura_util * 0.35 + largura_util * 0.325, y - 4.5*mm, valor)
        
        y -= 6*mm
    
    y -= 5*mm
    
    # ========================================
    # ITENS 1-3 (VALORES DA CAUSA)
    # ========================================
    
    itens_1_3 = [
        ["1 - TOTAL DE RENDIMENTOS RETIRADO PELO AUTOR:", formatar_moeda(dados['calculo']['item1_rendimentos_autor'])],
        ["2 - TOTAL DE DARF PAGA:", formatar_moeda(dados['calculo']['item2_darf_paga'])],
        ["3 - TOTAL DA CAUSA", formatar_moeda(dados['calculo']['item3_total_causa'])]
    ]
    
    for i, (campo, valor) in enumerate(itens_1_3):
        bg = COR_CINZA_CLARO if i < 2 else HexColor('#e0e0e0')
        c.setFillColor(bg)
        c.rect(margem_esq, y - 6*mm, largura_util * 0.75, 6*mm, fill=True, stroke=True)
        c.rect(margem_esq + largura_util * 0.75, y - 6*mm, largura_util * 0.25, 6*mm, fill=True, stroke=True)
        
        c.setFillColor(black)
        font = "Helvetica-Bold" if i == 2 else "Helvetica"
        c.setFont(font, 9)
        c.drawString(margem_esq + 2*mm, y - 4.5*mm, campo)
        c.drawRightString(largura - margem_dir - 2*mm, y - 4.5*mm, valor)
        
        y -= 6*mm
    
    y -= 5*mm
    
    # ========================================
    # APURAÇÃO DOS RENDIMENTOS ISENTOS (4-10)
    # ========================================
    
    c.setFillColor(COR_HEADER)
    c.rect(margem_esq, y - 6*mm, largura_util, 6*mm, fill=True, stroke=False)
    c.setFillColor(white)
    c.setFont("Helvetica-BoldOblique", 9)
    c.drawCentredString(largura/2, y - 4.5*mm, "APURAÇÃO DOS RENDIMENTOS ISENTOS DE TRIBUTAÇÃO")
    
    y -= 6*mm
    
    itens_4_10 = [
        ["4 - RENDIMENTOS BRUTO HOMOLOGADO/ATUALIZADO", formatar_moeda(dados['calculo']['item4_rendimentos_bruto'])],
        ["5 - RENDIMENTOS TRIBUTÁVEIS CALCULADOS NA MESMA DATA BASE", formatar_moeda(dados['calculo']['item5_rt_calculados'])],
        ["6 - PROPORÇÃO DE RENDIMENTOS TRIBUTÁVEIS", formatar_percentual(dados['calculo']['item6_proporcao_rt'])],
        ["7 - TOTAL DE RENDIMENTOS ISENTOS", formatar_moeda(dados['calculo']['item7_rendimentos_isentos'])],
        ["8 - RENDIMENTOS SUJEITOS À TRIBUTAÇÃO NORMAL", formatar_moeda(dados['calculo']['item8_rt_normal'])],
        ["9 - TOTAL DE DESPESAS PAGAS COM ADVOGADO, PERITO E CUSTAS:", formatar_moeda(dados['calculo']['item9_despesas_totais'])],
        ["10 - PROPORÇÃO A DEDUZIR DE DESPESAS PAGAS", formatar_moeda(dados['calculo']['item10_proporcao_despesas'])]
    ]
    
    for i, (campo, valor) in enumerate(itens_4_10):
        c.setFillColor(COR_CINZA_CLARO if i % 2 == 0 else white)
        c.rect(margem_esq, y - 6*mm, largura_util * 0.75, 6*mm, fill=True, stroke=True)
        c.rect(margem_esq + largura_util * 0.75, y - 6*mm, largura_util * 0.25, 6*mm, fill=True, stroke=True)
        
        c.setFillColor(black)
        c.setFont("Helvetica", 9)
        c.drawString(margem_esq + 2*mm, y - 4.5*mm, campo)
        c.drawRightString(largura - margem_dir - 2*mm, y - 4.5*mm, valor)
        
        y -= 6*mm
    
    y -= 5*mm
    
    # ========================================
    # VALORES ESPERADOS DA DECLARAÇÃO (11-18)
    # ========================================
    
    c.setFillColor(COR_HEADER)
    c.rect(margem_esq, y - 6*mm, largura_util, 6*mm, fill=True, stroke=False)
    c.setFillColor(white)
    c.setFont("Helvetica-BoldOblique", 9)
    c.drawCentredString(largura/2, y - 4.5*mm, "VALORES ESPERADOS DA DECLARAÇÃO DE AJUSTE ANUAL DO IR")
    
    y -= 6*mm
    
    itens_11_18 = [
        ["11 - CNPJ:", dados['fonte']['cnpj']],
        ["12 - FONTE PAGADORA:", dados['fonte']['nome']],
        ["13 - RENDIMENTOS TRIBUTÁVEIS", formatar_moeda(dados['calculo']['item13_rendimentos_tributaveis'])],
        ["14 - CONTRIBUIÇÃO PREVIDÊNCIA OFICIAL (INSS):", formatar_moeda(dados['calculo']['item14_inss']) if dados['calculo']['item14_inss'] else "-"],
        ["15 - IMPOSTO DE RENDA RETIDO NA FONTE", formatar_moeda(dados['calculo']['item15_irrf'])],
        ["16 - MÊS DO RECEBIMENTO", dados['calculo']['mes_recebimento']],
        ["17 - MESES DISCUTIDOS NA AÇÃO", f"{dados['calculo']['meses_discutidos']:.2f}".replace(".", ",")],
        ["18 - RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS:", formatar_moeda(dados['calculo']['item18_rendimentos_isentos'])]
    ]
    
    for i, (campo, valor) in enumerate(itens_11_18):
        c.setFillColor(COR_CINZA_CLARO if i % 2 == 0 else white)
        c.rect(margem_esq, y - 6*mm, largura_util * 0.75, 6*mm, fill=True, stroke=True)
        c.rect(margem_esq + largura_util * 0.75, y - 6*mm, largura_util * 0.25, 6*mm, fill=True, stroke=True)
        
        c.setFillColor(black)
        c.setFont("Helvetica", 9)
        c.drawString(margem_esq + 2*mm, y - 4.5*mm, campo)
        c.drawRightString(largura - margem_dir - 2*mm, y - 4.5*mm, str(valor))
        
        y -= 6*mm
    
    # Salvar
    c.save()
    
    return caminho_saida


# Função de teste
if __name__ == "__main__":
    # Dados de teste (José Ramos)
    dados_teste = {
        'cliente': {
            'nome': 'JOSE RAMOS CONCEIÇÃO',
            'cpf': '003.003.987-86',
            'data_nascimento': '25/08/1969'
        },
        'processo': {
            'numero': '0001971-78.2015.5.17.0007',
            'comarca': 'Vitória-ES',
            'vara': '7a. Vara do Trabalho'
        },
        'fonte': {
            'cnpj': '33.592.510/0001-54',
            'nome': 'VALE S/A'
        },
        'calculo': {
            'ano_dirpf': 2021,
            'mes_recebimento': 'DEZEMBRO',
            'meses_discutidos': 58,
            
            # Itens 1-3
            'item1_rendimentos_autor': 2315218.05,
            'item2_darf_paga': 220597.31,
            'item3_total_causa': 2535815.36,
            
            # Itens 4-10
            'item4_rendimentos_bruto': 2533329.85,
            'item5_rt_calculados': 985527.96,
            'item6_proporcao_rt': 38.9048,
            'item7_rendimentos_isentos': 1549260.42,
            'item8_rt_normal': 986554.94,
            'item9_despesas_totais': 694572.02,
            'item10_proporcao_despesas': 270222.14,
            
            # Itens 11-18
            'item13_rendimentos_tributaveis': 716332.80,
            'item14_inss': None,
            'item15_irrf': 220597.31,
            'item18_rendimentos_isentos': 1549260.42
        }
    }
    
    caminho = "/home/ubuntu/restituicaoia/teste_planilha_rt.pdf"
    gerar_planilha_rt(dados_teste, caminho)
    print(f"PDF gerado em: {caminho}")
