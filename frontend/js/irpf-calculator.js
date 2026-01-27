/**
 * MOTOR DE CÁLCULO DE IRPF - e-Restituição
 * Versão JavaScript para Frontend
 * Data: 25/01/2026
 * Identificação: MOTOR-JS-V2.0-25JAN
 */

// Índices IPCA-E (2020-2026)
const IPCA_E_INDICES = {
  "2020-01": 1.39532486, "2020-02": 1.385487896, "2020-03": 1.382446513,
  "2020-04": 1.382170079, "2020-05": 1.382308310, "2020-06": 1.390512333,
  "2020-07": 1.390234286, "2020-08": 1.386076058, "2020-09": 1.382895398,
  "2020-10": 1.376700247, "2020-11": 1.363879777, "2020-12": 1.352921116,
  "2021-01": 1.338730572, "2021-02": 1.328369292, "2021-03": 1.322023579,
  "2021-04": 1.309842048, "2021-05": 1.302029868, "2021-06": 1.296326034,
  "2021-07": 1.285655096, "2021-08": 1.276464552, "2021-09": 1.265204234,
  "2021-10": 1.250943478, "2021-11": 1.236110156, "2021-12": 1.221814922,
  "2022-01": 1.212358525, "2022-02": 1.205367395, "2022-03": 1.193551237,
  "2022-04": 1.182319205, "2022-05": 1.162212921, "2022-06": 1.155396084,
  "2022-07": 1.147478483, "2022-08": 1.145988698, "2022-09": 1.154415934,
  "2022-10": 1.158703135, "2022-11": 1.156852172, "2022-12": 1.150753180,
  "2023-01": 1.144800219, "2023-02": 1.138538259, "2023-03": 1.129950634,
  "2023-04": 1.122207403, "2023-05": 1.115847074, "2023-06": 1.110185130,
  "2023-07": 1.109741234, "2023-08": 1.110518597, "2023-09": 1.107417827,
  "2023-10": 1.103555383, "2023-11": 1.101242773, "2023-12": 1.097620625,
  "2024-01": 1.093247635, "2024-02": 1.089869041, "2024-03": 1.081433856,
  "2024-04": 1.077554660, "2024-05": 1.075296537, "2024-06": 1.070585959,
  "2024-07": 1.066426894, "2024-08": 1.063237182, "2024-09": 1.061220863,
  "2024-10": 1.059843067, "2024-11": 1.054150653, "2024-12": 1.047655191,
  "2025-01": 1.044105233, "2025-02": 1.042957979, "2025-03": 1.030285468,
  "2025-04": 1.023733573, "2025-05": 1.019350367, "2025-06": 1.015693869,
  "2025-07": 1.013059913, "2025-08": 1.009727811, "2025-09": 1.011143412,
  "2025-10": 1.006313109, "2025-11": 1.004505000, "2025-12": 1.002500000,
  "2026-01": 1.000000000
};

// Tabelas IR
const TABELA_IR_2015_2023 = [
  { min: 0, max: 1903.98, aliquota: 0, deducao: 0 },
  { min: 1903.99, max: 2826.65, aliquota: 0.075, deducao: 142.80 },
  { min: 2826.66, max: 3751.05, aliquota: 0.15, deducao: 354.80 },
  { min: 3751.06, max: 4664.68, aliquota: 0.225, deducao: 636.13 },
  { min: 4664.69, max: Infinity, aliquota: 0.275, deducao: 869.36 }
];

const TABELA_IR_2024_FEV = [
  { min: 0, max: 2259.20, aliquota: 0, deducao: 0 },
  { min: 2259.21, max: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { min: 2826.66, max: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { min: 3751.06, max: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { min: 4664.69, max: Infinity, aliquota: 0.275, deducao: 896.00 }
];

const TABELA_IR_2026 = [
  { min: 0, max: 2428.80, aliquota: 0, deducao: 0 },
  { min: 2428.81, max: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { min: 2826.66, max: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { min: 3751.06, max: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { min: 4664.69, max: Infinity, aliquota: 0.275, deducao: 908.73 }
];

function arredondarFinanceiro(valor) {
  return Math.round(valor * 100) / 100;
}

function getIpcaCoefficient(date, useDeflation) {
  if (!useDeflation) return 1;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return IPCA_E_INDICES[`${year}-${month}`] || 1;
}

function getExercicioFiscal(date) {
  return date.getUTCFullYear() + 1;
}

function getTabelaIRPorExercicio(exercicio) {
  const anoCalendario = exercicio - 1;
  if (anoCalendario <= 2023) return TABELA_IR_2015_2023;
  if (anoCalendario <= 2025) return TABELA_IR_2024_FEV;
  return TABELA_IR_2026;
}

function calcularIRDevido(baseCalculo, numeroMeses, exercicio) {
  if (baseCalculo <= 0 || numeroMeses <= 0) return 0;
  const tabela = getTabelaIRPorExercicio(exercicio);
  const rra = baseCalculo / numeroMeses;
  let aliquota = 0, deducao = 0;
  for (const faixa of tabela) {
    if (rra >= faixa.min && (faixa.max === Infinity || rra <= faixa.max)) {
      aliquota = faixa.aliquota;
      deducao = faixa.deducao;
      break;
    }
  }
  return Math.max(0, (aliquota * rra - deducao) * numeroMeses);
}

function parseDataUTC(dataStr) {
  if (!dataStr) return null;
  let ano, mes, dia;
  if (dataStr.includes('/')) {
    [dia, mes, ano] = dataStr.split('/').map(Number);
  } else {
    [ano, mes, dia] = dataStr.split('-').map(Number);
  }
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function limparValorBR(valor) {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  return parseFloat(valor.toString().replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0;
}

function formatarMoedaBR(valor, incluirSimbolo = true) {
  const numero = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
  const formatado = numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return incluirSimbolo ? `R$ ${formatado}` : formatado;
}

function calcularIRPF(dados) {
  const { brutoHomologado, tributavelHomologado, numeroMeses, alvaras, darfs, honorarios = [], usarDeflacao = true } = dados;
  
  const anosUnicos = new Set();
  alvaras.forEach(a => {
    const d = a.data instanceof Date ? a.data : parseDataUTC(a.data);
    if (d) anosUnicos.add(d.getUTCFullYear());
  });
  
  const ehMesmoAno = anosUnicos.size === 1;
  const usarDeflacaoAjustado = ehMesmoAno ? false : usarDeflacao;
  
  if (brutoHomologado <= 0 || !alvaras || alvaras.length === 0) {
    return { totalIrpf: 0, descricaoTotal: 'Sem dados', exercicios: [], proporcaoTributavel: 0, totalAlvarasDeflacionados: 0, totalDarfOriginal: 0 };
  }
  
  const proporcaoTributavel = tributavelHomologado / brutoHomologado;
  
  const alvarasProc = alvaras.map((a, i) => {
    const data = a.data instanceof Date ? a.data : parseDataUTC(a.data);
    const valor = limparValorBR(a.valor);
    const exercicio = getExercicioFiscal(data);
    const indiceIpca = getIpcaCoefficient(data, usarDeflacaoAjustado);
    return { index: i, valorOriginal: valor, data, exercicio, indiceIpca, valorDeflacionado: valor * indiceIpca };
  });
  
  const totalAlvarasDeflacionados = alvarasProc.reduce((s, a) => s + a.valorDeflacionado, 0);
  const totalDarfOriginal = darfs.reduce((s, d) => s + limparValorBR(d.valor), 0);
  
  const alvarasCalc = alvarasProc.map(a => {
    const proporcaoAlvara = totalAlvarasDeflacionados > 0 ? a.valorDeflacionado / totalAlvarasDeflacionados : 0;
    const darfProporcional = ehMesmoAno ? totalDarfOriginal : (totalDarfOriginal * proporcaoAlvara) / a.indiceIpca;
    const mesesProporcionais = numeroMeses * proporcaoAlvara;
    const rtAlvara = (a.valorOriginal + darfProporcional) * proporcaoTributavel;
    return { ...a, proporcaoAlvara, darfProporcional, mesesProporcionais, rtAlvara };
  });
  
  const honorariosProc = honorarios.map((h, i) => {
    const valor = limparValorBR(h.valor);
    const exercicio = h.anoPago + 1;
    return { index: i, valor, anoPago: h.anoPago, exercicio, rtHonorario: valor * proporcaoTributavel };
  });
  
  const todosExercicios = [...new Set([...alvarasCalc.map(a => a.exercicio), ...honorariosProc.map(h => h.exercicio)])].sort();
  
  const resultadosExercicios = [];
  for (const exercicio of todosExercicios) {
    const somaRtAlvara = alvarasCalc.filter(a => a.exercicio === exercicio).reduce((s, a) => s + a.rtAlvara, 0);
    const somaRtHonorarios = honorariosProc.filter(h => h.exercicio === exercicio).reduce((s, h) => s + h.rtHonorario, 0);
    const rendimentosTributaveis = Math.max(0, somaRtAlvara - somaRtHonorarios);
    const irrf = alvarasCalc.filter(a => a.exercicio === exercicio).reduce((s, a) => s + a.darfProporcional, 0);
    const meses = alvarasCalc.filter(a => a.exercicio === exercicio).reduce((s, a) => s + a.mesesProporcionais, 0);
    if (somaRtAlvara === 0 && somaRtHonorarios === 0) continue;
    const irDevido = calcularIRDevido(rendimentosTributaveis, meses, exercicio);
    const irpf = arredondarFinanceiro(irrf - irDevido);
    resultadosExercicios.push({
      exercicio, rendimentosTributaveis: arredondarFinanceiro(rendimentosTributaveis),
      irrf: arredondarFinanceiro(irrf), irDevido: arredondarFinanceiro(irDevido),
      numeroMeses: arredondarFinanceiro(meses), irpf, descricao: irpf >= 0 ? 'Imposto a Restituir' : 'Imposto a Pagar'
    });
  }
  
  const totalIrpf = arredondarFinanceiro(resultadosExercicios.reduce((s, r) => s + r.irpf, 0));
  
  return {
    totalIrpf, descricaoTotal: totalIrpf >= 0 ? 'Imposto a Restituir' : 'Imposto a Pagar',
    exercicios: resultadosExercicios, proporcaoTributavel: arredondarFinanceiro(proporcaoTributavel),
    totalAlvarasDeflacionados: arredondarFinanceiro(totalAlvarasDeflacionados),
    totalDarfOriginal: arredondarFinanceiro(totalDarfOriginal), tipoCalculo: ehMesmoAno ? 'mesmo_ano' : 'multi_anos'
  };
}

window.IRPFCalculator = { calcular: calcularIRPF, limparValorBR, formatarMoedaBR, parseDataUTC, arredondarFinanceiro };
console.log('✅ Motor de Cálculo IRPF carregado (v2.0 - 25/01/2026)');
