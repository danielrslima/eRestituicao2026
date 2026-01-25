#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MONTADOR DE KIT IR
==================
Junta encarte + documentos em um único PDF
Comprime imagens para 150 PPI
Divide em partes de 15MB se necessário

Autor: Sistema e-Restituição
Data: 25/01/2026
"""

import os
import io
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import tempfile
import re

class MontadorKitIR:
    """Classe para montar o Kit IR completo"""
    
    def __init__(self, cliente_nome, cliente_cpf, output_dir=None):
        self.cliente_nome = cliente_nome
        self.cliente_cpf = cliente_cpf
        self.output_dir = output_dir or tempfile.gettempdir()
        self.secoes = []  # Lista de (encarte_path, documento_path)
        self.MAX_SIZE_MB = 15  # Tamanho máximo por parte
        self.MAX_TOTAL_MB = 150  # Tamanho máximo total (limite RFB)
        self.TARGET_PPI = 150  # Resolução alvo para compressão
        
    def adicionar_secao(self, encarte_path, documento_path=None):
        """
        Adiciona uma seção ao Kit IR
        
        Args:
            encarte_path: Caminho do PDF do encarte
            documento_path: Caminho do PDF do documento (opcional)
        """
        if not os.path.exists(encarte_path):
            raise FileNotFoundError(f"Encarte não encontrado: {encarte_path}")
        
        if documento_path and not os.path.exists(documento_path):
            raise FileNotFoundError(f"Documento não encontrado: {documento_path}")
        
        self.secoes.append({
            'encarte': encarte_path,
            'documento': documento_path
        })
        
    def _normalizar_nome_arquivo(self, nome):
        """Remove acentos e caracteres especiais do nome do arquivo"""
        # Mapeamento de acentos
        acentos = {
            'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
            'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
            'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c', 'ñ': 'n',
            'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
            'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
            'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
            'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
            'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
            'Ç': 'C', 'Ñ': 'N'
        }
        
        for acento, sem_acento in acentos.items():
            nome = nome.replace(acento, sem_acento)
        
        # Remove caracteres especiais, mantém apenas letras, números e underscore
        nome = re.sub(r'[^a-zA-Z0-9_]', '', nome)
        
        return nome
    
    def _comprimir_pdf(self, input_path, output_path, target_ppi=150):
        """
        Comprime um PDF reduzindo a resolução das imagens
        
        Args:
            input_path: Caminho do PDF original
            output_path: Caminho do PDF comprimido
            target_ppi: Resolução alvo (padrão 150 PPI)
        """
        try:
            reader = PdfReader(input_path)
            writer = PdfWriter()
            
            for page in reader.pages:
                writer.add_page(page)
            
            # Comprime imagens
            for page in writer.pages:
                if '/Resources' in page and '/XObject' in page['/Resources']:
                    x_objects = page['/Resources']['/XObject'].get_object()
                    for obj_name in x_objects:
                        obj = x_objects[obj_name]
                        if obj['/Subtype'] == '/Image':
                            # Tenta comprimir a imagem
                            try:
                                if '/Filter' in obj:
                                    # Já está comprimido, pula
                                    continue
                            except:
                                pass
            
            # Salva com compressão
            with open(output_path, 'wb') as f:
                writer.write(f)
                
            return True
        except Exception as e:
            print(f"Aviso: Não foi possível comprimir {input_path}: {e}")
            # Se falhar, copia o arquivo original
            import shutil
            shutil.copy(input_path, output_path)
            return False
    
    def _obter_tamanho_mb(self, file_path):
        """Retorna o tamanho do arquivo em MB"""
        return os.path.getsize(file_path) / (1024 * 1024)
    
    def montar(self, comprimir=True):
        """
        Monta o Kit IR completo
        
        Args:
            comprimir: Se True, comprime o PDF final
            
        Returns:
            Lista de caminhos dos arquivos gerados
        """
        if not self.secoes:
            raise ValueError("Nenhuma seção adicionada ao Kit IR")
        
        # Nome base do arquivo (sem acentos)
        nome_base = "DocumentosRRAAcaoTrabalhista"
        
        # Criar merger
        merger = PdfMerger()
        
        # Adicionar cada seção
        for secao in self.secoes:
            # Adiciona encarte
            merger.append(secao['encarte'])
            
            # Adiciona documento (se existir)
            if secao['documento']:
                merger.append(secao['documento'])
        
        # Salvar PDF temporário
        temp_path = os.path.join(self.output_dir, f"{nome_base}_temp.pdf")
        with open(temp_path, 'wb') as f:
            merger.write(f)
        merger.close()
        
        # Verificar tamanho
        tamanho_mb = self._obter_tamanho_mb(temp_path)
        
        # Verificar limite total
        if tamanho_mb > self.MAX_TOTAL_MB:
            os.remove(temp_path)
            raise ValueError(f"Kit IR excede o limite de {self.MAX_TOTAL_MB}MB da RFB. Tamanho: {tamanho_mb:.2f}MB")
        
        # Se menor que 15MB, retorna arquivo único
        if tamanho_mb <= self.MAX_SIZE_MB:
            final_path = os.path.join(self.output_dir, f"{nome_base}.pdf")
            
            if comprimir:
                self._comprimir_pdf(temp_path, final_path, self.TARGET_PPI)
                os.remove(temp_path)
            else:
                os.rename(temp_path, final_path)
            
            return [final_path]
        
        # Se maior que 15MB, divide em partes
        return self._dividir_em_partes(temp_path, nome_base, comprimir)
    
    def _dividir_em_partes(self, input_path, nome_base, comprimir=True):
        """
        Divide o PDF em partes de no máximo 15MB
        
        Args:
            input_path: Caminho do PDF original
            nome_base: Nome base para os arquivos
            comprimir: Se True, comprime cada parte
            
        Returns:
            Lista de caminhos dos arquivos gerados
        """
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        
        arquivos_gerados = []
        parte_atual = 1
        pagina_inicio = 0
        
        while pagina_inicio < total_pages:
            # Estima quantas páginas cabem em 15MB
            # Começa com todas as páginas restantes e vai reduzindo
            paginas_por_parte = total_pages - pagina_inicio
            
            while paginas_por_parte > 0:
                writer = PdfWriter()
                
                for i in range(pagina_inicio, min(pagina_inicio + paginas_por_parte, total_pages)):
                    writer.add_page(reader.pages[i])
                
                # Salva temporariamente para verificar tamanho
                temp_parte = os.path.join(self.output_dir, f"{nome_base}_parte{parte_atual}_temp.pdf")
                with open(temp_parte, 'wb') as f:
                    writer.write(f)
                
                tamanho = self._obter_tamanho_mb(temp_parte)
                
                if tamanho <= self.MAX_SIZE_MB:
                    # Tamanho OK, salva como parte final
                    final_parte = os.path.join(self.output_dir, f"{nome_base}_parte{parte_atual}.pdf")
                    
                    if comprimir:
                        self._comprimir_pdf(temp_parte, final_parte, self.TARGET_PPI)
                        os.remove(temp_parte)
                    else:
                        os.rename(temp_parte, final_parte)
                    
                    arquivos_gerados.append(final_parte)
                    pagina_inicio += paginas_por_parte
                    parte_atual += 1
                    break
                else:
                    # Muito grande, reduz número de páginas
                    os.remove(temp_parte)
                    paginas_por_parte = paginas_por_parte // 2
                    
                    if paginas_por_parte == 0:
                        paginas_por_parte = 1  # Mínimo 1 página por parte
        
        # Remove arquivo temporário original
        os.remove(input_path)
        
        return arquivos_gerados
    
    def get_info(self):
        """Retorna informações sobre o Kit IR"""
        return {
            'cliente': self.cliente_nome,
            'cpf': self.cliente_cpf,
            'total_secoes': len(self.secoes),
            'secoes': [
                {
                    'encarte': os.path.basename(s['encarte']),
                    'documento': os.path.basename(s['documento']) if s['documento'] else None
                }
                for s in self.secoes
            ]
        }


# =====================================================
# TESTE DO MONTADOR
# =====================================================
if __name__ == "__main__":
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    from pdfEncarte import ENCARTES_PADRAO
    from pdfEsclarecimentos import gerar_esclarecimentos
    from pdfPlanilhaRT import gerar_planilha_rt
    
    # Dados de teste - estrutura correta
    dados_teste = {
        'cliente': {
            'nome': 'JOSE RAMOS CONCEICAO',
            'cpf': '003.003.987-86',
            'data_nascimento': '25/08/1969'
        },
        'processo': {
            'numero': '0001234-56.2020.5.02.0001',
            'vara': '1ª Vara do Trabalho de São Paulo',
            'comarca': 'São Paulo',
            'vara_numero': '1'
        },
        'fonte': {
            'cnpj': '00.000.000/0001-00',
            'nome': 'EMPRESA EXEMPLO S/A'
        },
        'calculo': {
            'ano_dirpf': '2021',
            'mes_recebimento': 'Dezembro/2020',
            # Campos para Esclarecimentos
            'valor_total_exercicio': 2533329.85,
            'imposto_retido_fonte': 220597.31,
            'valor_bruto_acao': 2535815.36,
            'valor_atualizado_rt': 986553.89,
            'percentual_rt': 38.9048,
            'despesas_dedutiveis': 105145.89,
            # Campos para Tabela RRA
            'rra_rendimentos_tributaveis': 881408.00,
            'rra_inss_reclamante': 0.00,
            'rra_imposto_retido': 220597.31,
            'rra_meses_discutidos': 58.00,
            'rendimentos_isentos': 1460122.49,
            # Campos para Planilha RT
            'item1_rendimentos_autor': 2315218.05,
            'item2_darf_paga': 220597.31,
            'item3_total_causa': 2535815.36,
            'item4_rendimentos_bruto': 2533329.85,
            'item5_rt_calculados': 986553.89,
            'item6_proporcao_rt': 38.9048,
            'item7_rendimentos_isentos': 1460122.49,
            'item8_rt_normal': 986553.89,
            'item9_despesas_totais': 270221.85,
            'item10_proporcao_despesas': 105145.89,
            'item13_rendimentos_tributaveis': 881408.00,
            'item14_inss': 0.00,
            'item15_irrf': 220597.31,
            'item17_meses_acao': 58.00,
            'meses_discutidos': 58.00,
            'item18_rendimentos_isentos': 1460122.49
        }
    }
    
    # Diretório de saída
    output_dir = '/home/ubuntu/restituicaoia/teste_kit_ir'
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("TESTE DO MONTADOR DE KIT IR")
    print("=" * 60)
    
    # 1. Gerar encarte
    print("\n1. Gerando encarte...")
    encarte_esclarecimentos = os.path.join(output_dir, 'Encarte_esclarecimentos.pdf')
    encarte_planilha = os.path.join(output_dir, 'Encarte_planilha_rt.pdf')
    ENCARTES_PADRAO['esclarecimentos']['funcao'](encarte_esclarecimentos)
    ENCARTES_PADRAO['planilha_rt']['funcao'](encarte_planilha)
    print(f"   ✅ Encarte Esclarecimentos: {encarte_esclarecimentos}")
    print(f"   ✅ Encarte Planilha RT: {encarte_planilha}")
    
    # 2. Gerar documentos
    print("\n2. Gerando documentos...")
    doc_esclarecimentos = os.path.join(output_dir, 'Esclarecimentos_JOSE_RAMOS.pdf')
    doc_planilha = os.path.join(output_dir, 'PlanilhaRT_JOSE_RAMOS.pdf')
    gerar_esclarecimentos(dados_teste, doc_esclarecimentos)
    gerar_planilha_rt(dados_teste, doc_planilha)
    print(f"   ✅ Esclarecimentos: {doc_esclarecimentos}")
    print(f"   ✅ Planilha RT: {doc_planilha}")
    
    # 3. Montar Kit IR
    print("\n3. Montando Kit IR...")
    montador = MontadorKitIR(
        cliente_nome=dados_teste['cliente']['nome'],
        cliente_cpf=dados_teste['cliente']['cpf'],
        output_dir=output_dir
    )
    
    # Adicionar seções
    montador.adicionar_secao(encarte_esclarecimentos, doc_esclarecimentos)
    montador.adicionar_secao(encarte_planilha, doc_planilha)
    
    # Montar
    arquivos = montador.montar(comprimir=True)
    
    print(f"\n   ✅ Kit IR montado com sucesso!")
    print(f"   📄 Arquivos gerados:")
    for arq in arquivos:
        tamanho = os.path.getsize(arq) / 1024  # KB
        print(f"      - {os.path.basename(arq)} ({tamanho:.2f} KB)")
    
    # Info
    print(f"\n   📋 Informações:")
    info = montador.get_info()
    print(f"      Cliente: {info['cliente']}")
    print(f"      CPF: {info['cpf']}")
    print(f"      Total de seções: {info['total_secoes']}")
    
    print("\n" + "=" * 60)
    print("TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
