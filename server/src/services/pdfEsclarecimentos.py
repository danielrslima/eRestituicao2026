"""
Gerador de PDF - Esclarecimentos sobre Rendimentos Recebidos Acumuladamente
Fiel ao layout original do documento de referência
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import black, white, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
from datetime import datetime

# Cores do documento
COR_VERDE = HexColor('#1a7f37')
COR_CINZA_ESCURO = HexColor('#333333')
COR_CINZA_CLARO = HexColor('#f5f5f5')
COR_BORDA = HexColor('#cccccc')

def formatar_moeda(valor):
    """Formata valor para moeda brasileira"""
    if valor is None or valor == 0:
        return "R$ 0,00"
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

def formatar_percentual(valor):
    """Formata valor para percentual"""
    if valor is None:
        return "-"
    return f"{valor:.4f}%".replace(".", ",")

def quebrar_texto(texto, fonte, tamanho, largura_max, canvas_obj):
    """Quebra texto em múltiplas linhas respeitando a largura máxima"""
    palavras = texto.split()
    linhas = []
    linha_atual = ""
    
    for palavra in palavras:
        teste = linha_atual + " " + palavra if linha_atual else palavra
        if canvas_obj.stringWidth(teste, fonte, tamanho) < largura_max:
            linha_atual = teste
        else:
            if linha_atual:
                linhas.append(linha_atual)
            linha_atual = palavra
    
    if linha_atual:
        linhas.append(linha_atual)
    
    return linhas

def gerar_esclarecimentos(dados, caminho_saida):
    """
    Gera o PDF de Esclarecimentos
    """
    
    # Criar canvas
    c = canvas.Canvas(caminho_saida, pagesize=A4)
    largura, altura = A4
    
    # Margens ajustadas para evitar texto fora da margem
    margem_esq = 25 * mm
    margem_dir = 25 * mm
    margem_sup = 20 * mm
    largura_util = largura - margem_esq - margem_dir
    
    y = altura - margem_sup
    
    # ========================================
    # CABEÇALHO COM LOGO e-Restituição
    # ========================================
    
    # Caminho do logo e-Restituição
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'assets', 'logo_e_restituicao.jpg')
    
    if os.path.exists(logo_path):
        # Usar imagem do logo CENTRALIZADO
        logo_largura = 50 * mm
        logo_altura = 15 * mm
        logo_x = (largura - logo_largura) / 2  # Centralizar horizontalmente
        c.drawImage(logo_path, logo_x, y - logo_altura + 5*mm, width=logo_largura, height=logo_altura, preserveAspectRatio=True, mask='auto')
    else:
        # Fallback: texto estilizado CENTRALIZADO
        c.setFillColor(COR_VERDE)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(largura/2, y, "● e-Restituição")
        c.setFillColor(black)
    
    y -= 18 * mm
    
    # Linha separadora
    c.setStrokeColor(COR_BORDA)
    c.setLineWidth(1)
    c.line(margem_esq, y, largura - margem_dir, y)
    
    y -= 8 * mm
    
    # ========================================
    # TÍTULO PRINCIPAL
    # ========================================
    
    c.setFillColor(black)
    c.setFont("Helvetica-Bold", 10)
    titulo1 = "ESCLARECIMENTOS SOBRE OS RENDIMENTOS RECEBIDOS ACUMULADAMENTE AO SETOR DE"
    titulo2 = "MALHA FISCAL DA RECEITA FEDERAL DO BRASIL"
    
    c.drawCentredString(largura/2, y, titulo1)
    y -= 5 * mm
    c.drawCentredString(largura/2, y, titulo2)
    
    y -= 10 * mm
    
    # Linha separadora
    c.line(margem_esq, y, largura - margem_dir, y)
    
    y -= 12 * mm
    
    # ========================================
    # DADOS DO CONTRIBUINTE
    # ========================================
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margem_esq, y, f"CONTRIBUINTE: {dados['cliente']['nome']}")
    
    # DIRPF no canto direito
    c.drawRightString(largura - margem_dir, y, f"DIRPF {dados['calculo']['ano_dirpf']}")
    
    y -= 5 * mm
    c.setFont("Helvetica", 10)
    c.drawString(margem_esq, y, f"CPF: {dados['cliente']['cpf']}")
    
    y -= 5 * mm
    c.drawString(margem_esq, y, f"DATA DE NASCIMENTO: {dados['cliente']['data_nascimento']}")
    
    y -= 10 * mm
    
    # ========================================
    # A) DADOS DA AÇÃO
    # ========================================
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margem_esq, y, "A) DADOS DA AÇÃO:")
    
    y -= 6 * mm
    c.setFont("Helvetica", 9)
    
    # Item 1) - CORRIGIDO: Agora começa com "1)"
    texto_acao = f"1) Os valores declarados se referem a rendimento recebido de forma acumulada, referente a Ação Judicial Trabalhista, processo n.º {dados['processo']['numero']} que tramitou perante a {dados['processo']['vara']}."
    
    # Quebrar texto em linhas respeitando margem
    linhas = quebrar_texto(texto_acao, "Helvetica", 9, largura_util, c)
    for linha in linhas:
        c.drawString(margem_esq, y, linha)
        y -= 4 * mm
    
    y -= 6 * mm
    
    # ========================================
    # B) VALORES E DATAS
    # ========================================
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margem_esq, y, "B) VALORES E DATAS:")
    
    y -= 7 * mm
    c.setFont("Helvetica", 9)
    
    # Item 2 - com quebra de linha
    texto2 = f"2) O valor total levantado pelo(a) contribuinte, referente ao exercício foi de {formatar_moeda(dados['calculo']['valor_total_exercicio'])};"
    linhas = quebrar_texto(texto2, "Helvetica", 9, largura_util, c)
    for linha in linhas:
        c.drawString(margem_esq, y, linha)
        y -= 4 * mm
    y -= 2 * mm
    
    # Item 3 - com quebra de linha
    texto3 = f"3) O imposto de renda no valor total de {formatar_moeda(dados['calculo']['imposto_retido_fonte'])}, foi retido pela {dados['fonte']['nome']} - CNPJ n.º {dados['fonte']['cnpj']}, conforme documento(s) anexo(s);"
    linhas = quebrar_texto(texto3, "Helvetica", 9, largura_util, c)
    for linha in linhas:
        c.drawString(margem_esq, y, linha)
        y -= 4 * mm
    y -= 2 * mm
    
    # Item 4 - com quebra de linha
    texto4 = f"4) O valor bruto da ação corresponde a soma entre o(s) alvará(s)/mandado(s) de levantamento e o imposto de renda retido, o que equivale, neste caso, ao valor de {formatar_moeda(dados['calculo']['valor_bruto_acao'])} (Item 3, da planilha);"
    linhas = quebrar_texto(texto4, "Helvetica", 9, largura_util, c)
    for linha in linhas:
        c.drawString(margem_esq, y, linha)
        y -= 4 * mm
    y -= 2 * mm
    
    # Item 5 - com quebra de linha
    texto5 = f"5) O valor atualizado apurado de {formatar_moeda(dados['calculo']['valor_atualizado_rt'])} (Item 8, da planilha), referente ao(s) Rendimento(s) Tributável(is), equivale(m) a {formatar_percentual(dados['calculo']['percentual_rt'])} do valor bruto da ação (Item 3), conforme apurado em planilha anexa;"
    linhas = quebrar_texto(texto5, "Helvetica", 9, largura_util, c)
    for linha in linhas:
        c.drawString(margem_esq, y, linha)
        y -= 4 * mm
    y -= 2 * mm
    
    # Item 6 - com quebra de linha
    texto6 = f"6) O valor total apurado de despesas dedutíveis¹ com a ação judicial, sobre a mesma proporção dos rendimentos tributáveis, nos exatos termos da Lei, foi de {formatar_moeda(dados['calculo']['despesas_dedutiveis'])}."
    linhas = quebrar_texto(texto6, "Helvetica", 9, largura_util, c)
    for linha in linhas:
        c.drawString(margem_esq, y, linha)
        y -= 4 * mm
    
    y -= 8 * mm
    
    # ========================================
    # TABELA RRA DIRPF
    # ========================================
    
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(largura/2, y, "CAMPOS E VALORES DECLARADOS NA FICHA DE RRA* DA DIRPF,")
    y -= 5 * mm
    c.drawCentredString(largura/2, y, "NA OPÇÃO DE TRIBUTAÇÃO EXCLUSIVA NA FONTE")
    
    y -= 8 * mm
    
    # Tabela
    dados_tabela = [
        ["A) RENDIMENTOS TRIBUTÁVEIS RECEBIDOS:", formatar_moeda(dados['calculo']['rra_rendimentos_tributaveis'])],
        ["B) INSS RECLAMANTE:", formatar_moeda(dados['calculo']['rra_inss_reclamante'])],
        ["C) IMPOSTO DE RENDA RETIDO NA FONTE:", formatar_moeda(dados['calculo']['rra_imposto_retido'])],
        ["D) Nº DE MESES DISCUTIDOS NA AÇÃO:", f"{dados['calculo']['rra_meses_discutidos']:.2f}".replace(".", ",")]
    ]
    
    tabela_y = y
    c.setFont("Helvetica", 9)
    
    for i, (campo, valor) in enumerate(dados_tabela):
        # Fundo alternado
        if i % 2 == 0:
            c.setFillColor(COR_CINZA_CLARO)
            c.rect(margem_esq, tabela_y - 5*mm, largura_util, 6*mm, fill=True, stroke=False)
        
        c.setFillColor(black)
        c.drawString(margem_esq + 2*mm, tabela_y - 3.5*mm, campo)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(largura - margem_dir - 2*mm, tabela_y - 3.5*mm, valor)
        c.setFont("Helvetica", 9)
        
        # Borda
        c.setStrokeColor(COR_BORDA)
        c.rect(margem_esq, tabela_y - 5*mm, largura_util, 6*mm, fill=False, stroke=True)
        
        tabela_y -= 6 * mm
    
    y = tabela_y - 8 * mm
    
    # ========================================
    # FICHA DE RENDIMENTOS ISENTOS
    # ========================================
    
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(largura/2, y, "FICHA DE RENDIMENTOS ISENTOS")
    
    y -= 8 * mm
    
    # Linha única
    c.setFillColor(COR_CINZA_CLARO)
    c.rect(margem_esq, y - 5*mm, largura_util, 6*mm, fill=True, stroke=False)
    c.setFillColor(black)
    c.setFont("Helvetica", 9)
    c.drawString(margem_esq + 2*mm, y - 3.5*mm, "RENDIMENTOS ISENTOS:")
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(largura - margem_dir - 2*mm, y - 3.5*mm, formatar_moeda(dados['calculo']['rendimentos_isentos']))
    c.setStrokeColor(COR_BORDA)
    c.rect(margem_esq, y - 5*mm, largura_util, 6*mm, fill=False, stroke=True)
    
    y -= 15 * mm
    
    # ========================================
    # OBSERVAÇÕES
    # ========================================
    
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margem_esq, y, "Obs.:")
    
    y -= 5 * mm
    c.setFont("Helvetica", 8)
    c.drawString(margem_esq, y, "a) Os honorários pagos, foram lançados na ficha de pagamentos, em item próprio;")
    
    y -= 4 * mm
    texto_obs_b = "b) O valor referente ao rendimento isento foi lançado na ficha de rendimentos isentos e não tributáveis, no item \"OUTROS\","
    c.drawString(margem_esq, y, texto_obs_b)
    y -= 4 * mm
    c.drawString(margem_esq, y, "com a denominação de \"Verbas Isentas Ação Judicial\", com os mesmos dados da Fonte Pagadora.")
    
    y -= 8 * mm
    
    # Linha e referência legal
    c.setStrokeColor(black)
    c.line(margem_esq, y, margem_esq + 50*mm, y)
    y -= 4 * mm
    c.setFont("Helvetica", 7)
    c.drawString(margem_esq, y, "1 Art. 12.A, §2º da Lei 7.713/88")
    
    # ========================================
    # RODAPÉ COM LOGO IR360
    # ========================================
    
    # Caminho do logo IR360 rodapé
    logo_rodape_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'assets', 'logo_ir360_rodape.png')
    
    y = 35 * mm
    
    if os.path.exists(logo_rodape_path):
        # Usar imagem do logo
        logo_largura = 40 * mm
        logo_altura = 18 * mm
        logo_x = (largura - logo_largura) / 2
        c.drawImage(logo_rodape_path, logo_x, y - logo_altura, width=logo_largura, height=logo_altura, preserveAspectRatio=True, mask='auto')
        y -= logo_altura + 3*mm
    else:
        # Fallback: texto estilizado
        c.setFillColor(COR_VERDE)
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(largura/2, y, "IR360")
    
    # Símbolo de marca registrada
    c.setFillColor(black)
    c.setFont("Helvetica", 8)
    c.drawCentredString(largura/2, y - 5*mm, "®")
    
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
            'vara': '7ª Vara do Trabalho de Vitória-ES'
        },
        'fonte': {
            'cnpj': '33.592.510/0001-54',
            'nome': 'Reclamada Vale S.A.'
        },
        'calculo': {
            'ano_dirpf': 2021,
            'valor_total_exercicio': 2533329.85,
            'imposto_retido_fonte': 220597.31,
            'valor_bruto_acao': 2535815.36,
            'valor_atualizado_rt': 986553.89,
            'percentual_rt': 38.9048,
            'despesas_dedutiveis': 270221.85,
            'rra_rendimentos_tributaveis': 716332.04,
            'rra_inss_reclamante': 0,
            'rra_imposto_retido': 220597.31,
            'rra_meses_discutidos': 58,
            'rendimentos_isentos': 1460122.49
        }
    }
    
    caminho = "/home/ubuntu/restituicaoia/teste_esclarecimentos.pdf"
    gerar_esclarecimentos(dados_teste, caminho)
    print(f"PDF gerado em: {caminho}")
