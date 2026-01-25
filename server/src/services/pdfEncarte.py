"""
Gerador de Encarte (Páginas de Capa) para Kit IR
Padrão visual: Logo e-Restituição no topo + Título centralizado + Logo IR360 no rodapé
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color, black, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Diretório base
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')

# Cores
COR_LARANJA = Color(0.95, 0.45, 0.15)  # Laranja do logo
COR_VERMELHO = Color(0.85, 0.25, 0.25)  # Vermelho do logo
COR_VERDE = Color(0.35, 0.65, 0.35)  # Verde

def desenhar_logo_colorido(c, x, y, tamanho=15):
    """
    Desenha o logo colorido (círculos) no rodapé esquerdo
    """
    # Círculo 1 - Laranja (topo esquerdo)
    c.setFillColor(COR_LARANJA)
    c.circle(x, y + tamanho*0.8, tamanho*0.35, fill=1, stroke=0)
    
    # Círculo 2 - Vermelho (topo direito)
    c.setFillColor(COR_VERMELHO)
    c.circle(x + tamanho*0.6, y + tamanho*0.8, tamanho*0.35, fill=1, stroke=0)
    
    # Círculo 3 - Laranja claro (meio esquerdo)
    c.setFillColor(Color(0.98, 0.6, 0.3))
    c.circle(x, y + tamanho*0.3, tamanho*0.35, fill=1, stroke=0)
    
    # Círculo 4 - Vermelho escuro (meio direito)
    c.setFillColor(Color(0.75, 0.2, 0.2))
    c.circle(x + tamanho*0.6, y + tamanho*0.3, tamanho*0.35, fill=1, stroke=0)
    
    # Círculo 5 - Laranja (baixo esquerdo)
    c.setFillColor(COR_LARANJA)
    c.circle(x, y - tamanho*0.2, tamanho*0.35, fill=1, stroke=0)
    
    # Círculo 6 - Vermelho (baixo direito)
    c.setFillColor(COR_VERMELHO)
    c.circle(x + tamanho*0.6, y - tamanho*0.2, tamanho*0.35, fill=1, stroke=0)

def gerar_encarte(titulo, output_path, subtitulo=None):
    """
    Gera um encarte (página de capa) com o padrão visual IR360
    
    Layout:
    - TOPO: Logo e-Restituição centralizado
    - CENTRO: Título do encarte
    - RODAPÉ: Logo colorido + Endereço (esquerda) | Logo IR360 (direita)
    
    Args:
        titulo: Texto principal do encarte (ex: "ESCLARECIMENTOS")
        output_path: Caminho para salvar o PDF
        subtitulo: Texto secundário opcional (ex: para "CÁLCULOS HOMOLOGADOS" seria duas linhas)
    
    Returns:
        Caminho do arquivo gerado
    """
    
    # Criar canvas
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Margem
    margem = 2.5 * cm
    
    # ========================================
    # TOPO - LOGO E-RESTITUIÇÃO CENTRALIZADO
    # ========================================
    
    logo_erestituicao_path = os.path.join(ASSETS_DIR, 'logo_e_restituicao.jpg')
    logo_y = height - 4 * cm  # 4cm do topo
    
    if os.path.exists(logo_erestituicao_path):
        # Centralizar o logo - AUMENTADO
        logo_width = 8 * cm
        logo_height = 2.5 * cm
        logo_x = (width - logo_width) / 2
        c.drawImage(logo_erestituicao_path, logo_x, logo_y, 
                    width=logo_width, height=logo_height, preserveAspectRatio=True)
    else:
        # Fallback: desenhar texto "e-Restituição"
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(COR_VERDE)
        texto = "e-Restituição"
        texto_width = c.stringWidth(texto, "Helvetica-Bold", 28)
        c.drawString((width - texto_width) / 2, logo_y + 0.5*cm, texto)
    
    # ========================================
    # CENTRO - TÍTULO DO ENCARTE
    # ========================================
    
    # Posição vertical do título (centro da página)
    titulo_y = height / 2
    
    # Configurar fonte do título
    c.setFont("Helvetica-Bold", 48)
    c.setFillColor(black)
    
    if subtitulo:
        # Título em duas ou mais linhas
        linhas = titulo.split('\n') if '\n' in titulo else [titulo]
        if subtitulo:
            linhas.append(subtitulo)
        
        # Calcular altura total - ESPAÇAMENTO MAIOR
        espacamento = 80
        altura_total = len(linhas) * espacamento
        y_inicio = titulo_y + altura_total / 2 - 30
        
        for i, linha in enumerate(linhas):
            texto_width = c.stringWidth(linha, "Helvetica-Bold", 48)
            x = (width - texto_width) / 2
            c.drawString(x, y_inicio - (i * espacamento), linha)
    else:
        # Título em uma linha
        texto_width = c.stringWidth(titulo, "Helvetica-Bold", 48)
        x = (width - texto_width) / 2
        c.drawString(x, titulo_y, titulo)
    
    # ========================================
    # RODAPÉ
    # ========================================
    
    rodape_y = 3 * cm
    
    # Endereço (esquerda) - SEM logo colorido
    c.setFont("Helvetica", 9)
    c.setFillColor(black)
    endereco_x = margem
    c.drawString(endereco_x, rodape_y + 1.2*cm, "Rua Quirino dos Santos, 271 – CJ.51 – Barra Funda")
    c.drawString(endereco_x, rodape_y + 0.6*cm, "São Paulo – SP – CEP 01141-020")
    c.drawString(endereco_x, rodape_y, "WhatsApp (11) 93713-9391")
    
    # Logo IR360 (direita) - usar imagem se disponível
    logo_ir360_path = os.path.join(ASSETS_DIR, 'logo_ir360.jpg')
    if os.path.exists(logo_ir360_path):
        c.drawImage(logo_ir360_path, width - margem - 4*cm, rodape_y - 0.3*cm, 
                    width=4*cm, height=1.5*cm, preserveAspectRatio=True)
    else:
        # Desenhar texto IR360 como fallback
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(Color(0.1, 0.1, 0.2))  # Azul escuro
        c.drawString(width - margem - 3*cm, rodape_y + 0.5*cm, "IR360")
    
    # Salvar
    c.save()
    
    return output_path


def gerar_encarte_multilinhas(linhas, output_path):
    """
    Gera um encarte com múltiplas linhas de título
    
    Args:
        linhas: Lista de strings para cada linha do título
        output_path: Caminho para salvar o PDF
    
    Returns:
        Caminho do arquivo gerado
    """
    
    # Criar canvas
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Margem
    margem = 2.5 * cm
    
    # ========================================
    # TOPO - LOGO E-RESTITUIÇÃO CENTRALIZADO
    # ========================================
    
    logo_erestituicao_path = os.path.join(ASSETS_DIR, 'logo_e_restituicao.jpg')
    logo_y = height - 4 * cm
    
    if os.path.exists(logo_erestituicao_path):
        logo_width = 8 * cm
        logo_height = 2.5 * cm
        logo_x = (width - logo_width) / 2
        c.drawImage(logo_erestituicao_path, logo_x, logo_y, 
                    width=logo_width, height=logo_height, preserveAspectRatio=True)
    else:
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(COR_VERDE)
        texto = "e-Restituição"
        texto_width = c.stringWidth(texto, "Helvetica-Bold", 28)
        c.drawString((width - texto_width) / 2, logo_y + 0.5*cm, texto)
    
    # ========================================
    # CENTRO - TÍTULO DO ENCARTE (MÚLTIPLAS LINHAS)
    # ========================================
    
    c.setFont("Helvetica-Bold", 48)
    c.setFillColor(black)
    
    # Calcular espaçamento entre linhas (80pt conforme padrão)
    espacamento = 80
    altura_total = len(linhas) * espacamento
    
    # Posição Y inicial (centralizado na página)
    y_inicio = (height / 2) + (altura_total / 2) - 30
    
    for i, linha in enumerate(linhas):
        texto_width = c.stringWidth(linha, "Helvetica-Bold", 48)
        x = (width - texto_width) / 2
        c.drawString(x, y_inicio - (i * espacamento), linha)
    
    # ========================================
    # RODAPÉ
    # ========================================
    
    rodape_y = 3 * cm
    
    # Endereço (esquerda)
    c.setFont("Helvetica", 9)
    c.setFillColor(black)
    endereco_x = margem
    c.drawString(endereco_x, rodape_y + 1.2*cm, "Rua Quirino dos Santos, 271 – CJ.51 – Barra Funda")
    c.drawString(endereco_x, rodape_y + 0.6*cm, "São Paulo – SP – CEP 01141-020")
    c.drawString(endereco_x, rodape_y, "WhatsApp (11) 93713-9391")
    
    # Logo IR360 (direita)
    logo_ir360_path = os.path.join(ASSETS_DIR, 'logo_ir360.jpg')
    if os.path.exists(logo_ir360_path):
        c.drawImage(logo_ir360_path, width - margem - 4*cm, rodape_y - 0.3*cm, 
                    width=4*cm, height=1.5*cm, preserveAspectRatio=True)
    else:
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(Color(0.1, 0.1, 0.2))
        c.drawString(width - margem - 3*cm, rodape_y + 0.5*cm, "IR360")
    
    # Salvar
    c.save()
    
    return output_path


def gerar_encarte_esclarecimentos(output_path):
    """Gera encarte de Esclarecimentos"""
    return gerar_encarte("ESCLARECIMENTOS", output_path)


def gerar_encarte_calculos_homologados(output_path):
    """Gera encarte de Cálculos Homologados"""
    return gerar_encarte("CÁLCULOS", output_path, subtitulo="HOMOLOGADOS")


def gerar_encarte_homologacao_calculos(output_path):
    """Gera encarte de Homologação de Cálculos"""
    return gerar_encarte("HOMOLOGAÇÃO DE", output_path, subtitulo="CÁLCULOS")


def gerar_encarte_planilha_rt(output_path):
    """Gera encarte de Planilha de Apuração de Rendimento Tributável"""
    # Texto em 5 linhas conforme o modelo original
    linhas = ["PLANILHA", "DE", "APURAÇÃO DE", "RENDIMENTO", "TRIBUTÁVEL"]
    return gerar_encarte_multilinhas(linhas, output_path)


def gerar_encarte_requerimento(output_path):
    """Gera encarte de Requerimento"""
    return gerar_encarte("REQUERIMENTO", output_path)


def gerar_encarte_documentos_principais(output_path):
    """Gera encarte de Documentos Principais"""
    return gerar_encarte("DOCUMENTOS", output_path, subtitulo="PRINCIPAIS")


def gerar_encarte_alvara(output_path):
    """Gera encarte de Alvará"""
    return gerar_encarte("ALVARÁ", output_path)


def gerar_encarte_sentenca(output_path):
    """Gera encarte de Sentença"""
    return gerar_encarte("SENTENÇA", output_path)


def gerar_encarte_personalizado(titulo, output_path, subtitulo=None):
    """
    Gera encarte personalizado com título customizado
    
    Args:
        titulo: Título principal
        output_path: Caminho para salvar
        subtitulo: Subtítulo opcional
    """
    return gerar_encarte(titulo, output_path, subtitulo)


# Lista de encarte padrão disponíveis
ENCARTES_PADRAO = {
    'esclarecimentos': {
        'nome': 'Esclarecimentos',
        'funcao': gerar_encarte_esclarecimentos
    },
    'calculos_homologados': {
        'nome': 'Cálculos Homologados',
        'funcao': gerar_encarte_calculos_homologados
    },
    'homologacao_calculos': {
        'nome': 'Homologação de Cálculos',
        'funcao': gerar_encarte_homologacao_calculos
    },
    'planilha_rt': {
        'nome': 'Planilha RT',
        'funcao': gerar_encarte_planilha_rt
    },
    'requerimento': {
        'nome': 'Requerimento',
        'funcao': gerar_encarte_requerimento
    },
    'documentos_principais': {
        'nome': 'Documentos Principais',
        'funcao': gerar_encarte_documentos_principais
    },
    'alvara': {
        'nome': 'Alvará',
        'funcao': gerar_encarte_alvara
    },
    'sentenca': {
        'nome': 'Sentença',
        'funcao': gerar_encarte_sentenca
    }
}


# ========================================
# TESTE
# ========================================
if __name__ == "__main__":
    # Criar diretório de teste
    teste_dir = os.path.join(BASE_DIR, 'teste_encartes')
    os.makedirs(teste_dir, exist_ok=True)
    
    # Gerar todos os encarte padrão
    for key, info in ENCARTES_PADRAO.items():
        output = os.path.join(teste_dir, f"Encarte_{key}.pdf")
        info['funcao'](output)
        print(f"✅ Gerado: {output}")
    
    # Gerar encarte personalizado
    output_custom = os.path.join(teste_dir, "Encarte_personalizado.pdf")
    gerar_encarte_personalizado("ACORDO", output_custom, subtitulo="JUDICIAL")
    print(f"✅ Gerado: {output_custom}")
    
    print(f"\n📁 Encarte salvos em: {teste_dir}")
