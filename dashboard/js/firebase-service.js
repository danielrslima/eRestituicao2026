/**
 * FIREBASE SERVICE - Dashboard e-Restituição
 * ============================================
 * Serviço para buscar dados reais do Firebase Firestore
 * 
 * IMPORTANTE: Este arquivo NÃO altera nenhuma lógica de cálculo.
 * Apenas busca e exibe dados já salvos no Firestore.
 * 
 * Coleção: calculos2026
 */

// Importar Firebase via CDN (já carregado no HTML)
// Este arquivo assume que o Firebase SDK está disponível globalmente

const FirebaseService = {
    db: null,
    initialized: false,

    /**
     * Inicializa a conexão com o Firebase
     */
    async init() {
        if (this.initialized) return true;

        try {
            // Verificar se Firebase está disponível
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK não carregado');
                return false;
            }

            // Inicializar Firebase se ainda não foi
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }

            this.db = firebase.firestore();
            this.initialized = true;
            console.log('✅ Firebase Service inicializado - Coleção:', window.COLECAO_CALCULOS);
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            return false;
        }
    },

    /**
     * Busca todos os cálculos do Firestore
     * @returns {Array} Lista de cálculos
     */
    async buscarTodosCalculos() {
        if (!await this.init()) return [];

        try {
            const snapshot = await this.db.collection(window.COLECAO_CALCULOS)
                .orderBy('createdAt', 'desc')
                .get();

            const calculos = [];
            snapshot.forEach(doc => {
                calculos.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ ${calculos.length} cálculos encontrados no Firebase`);
            return calculos;
        } catch (error) {
            console.error('❌ Erro ao buscar cálculos:', error);
            return [];
        }
    },

    /**
     * Busca um cálculo específico por ID
     * @param {string} id - ID do documento
     * @returns {Object|null} Dados do cálculo
     */
    async buscarCalculoPorId(id) {
        if (!await this.init()) return null;

        try {
            const doc = await this.db.collection(window.COLECAO_CALCULOS).doc(id).get();
            
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar cálculo:', error);
            return null;
        }
    },

    /**
     * Busca cálculos por CPF
     * @param {string} cpf - CPF do cliente
     * @returns {Array} Lista de cálculos do cliente
     */
    async buscarCalculosPorCPF(cpf) {
        if (!await this.init()) return [];

        try {
            // Limpar CPF para busca
            const cpfLimpo = cpf.replace(/\D/g, '');
            
            const snapshot = await this.db.collection(window.COLECAO_CALCULOS)
                .where('cliente.cpf', '==', cpfLimpo)
                .get();

            const calculos = [];
            snapshot.forEach(doc => {
                calculos.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return calculos;
        } catch (error) {
            console.error('❌ Erro ao buscar por CPF:', error);
            return [];
        }
    },

    /**
     * Busca estatísticas gerais para o Dashboard
     * @returns {Object} Estatísticas
     */
    async buscarEstatisticas() {
        const calculos = await this.buscarTodosCalculos();
        
        const stats = {
            totalCalculos: calculos.length,
            totalClientes: new Set(calculos.map(c => c.cliente?.cpf)).size,
            valorTotalRestituicao: 0,
            calculosHoje: 0,
            calculosSemana: 0,
            calculosMes: 0,
            pagamentosPendentes: 0,
            pagamentosConfirmados: 0
        };

        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - 7);
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        calculos.forEach(calc => {
            // Somar valor de restituição
            if (calc.totais?.irpfTotalRestituir) {
                stats.valorTotalRestituicao += calc.totais.irpfTotalRestituir / 100; // centavos para reais
            }

            // Contar por período
            if (calc.createdAt) {
                const dataCalculo = new Date(calc.createdAt);
                if (dataCalculo.toDateString() === hoje.toDateString()) {
                    stats.calculosHoje++;
                }
                if (dataCalculo >= inicioSemana) {
                    stats.calculosSemana++;
                }
                if (dataCalculo >= inicioMes) {
                    stats.calculosMes++;
                }
            }

            // Contar pagamentos
            if (calc.status?.pagamento === 'confirmado' || calc.status?.pagamento === 'pago') {
                stats.pagamentosConfirmados++;
            } else {
                stats.pagamentosPendentes++;
            }
        });

        return stats;
    },

    /**
     * Converte dados do Firebase para formato de cliente do Dashboard
     * @param {Object} calculo - Dados do cálculo do Firebase
     * @returns {Object} Cliente formatado para o Dashboard
     */
    converterParaCliente(calculo) {
        const cliente = calculo.cliente || {};
        const totais = calculo.totais || {};
        const status = calculo.status || {};

        // Determinar status do cliente baseado no pagamento
        let statusCliente = 'calculado';
        if (status.pagamento === 'confirmado' || status.pagamento === 'pago') {
            if (status.kitIR === 'enviado') {
                statusCliente = 'enviado';
            } else {
                statusCliente = 'pago_basico';
            }
        }

        return {
            id: calculo.id,
            nome: cliente.nomeCompleto || 'Nome não informado',
            cpf: FirebaseUtils.formatarCPF(cliente.cpf || ''),
            email: cliente.email || '',
            telefones: [
                { numero: FirebaseUtils.formatarTelefone(cliente.telefone || ''), tipo: 'proprio', nomeResponsavel: '' }
            ],
            dataNascimento: cliente.dataNascimento || '',
            dataInclusao: calculo.createdAt || '',
            casos: [
                {
                    casoId: calculo.id,
                    numeroProcesso: calculo.processo?.numeroProcesso || '',
                    status: statusCliente,
                    valorRestituicao: (totais.irpfTotalRestituir || 0) / 100, // centavos para reais
                    dataCalculo: calculo.createdAt ? calculo.createdAt.split('T')[0] : ''
                }
            ],
            tipo: 'externo',
            indicadoPor: null,
            parceiroId: null,
            // Dados originais do Firebase para referência
            _firebase: calculo
        };
    },

    /**
     * Busca todos os clientes (convertidos do Firebase)
     * @returns {Array} Lista de clientes formatados
     */
    async buscarTodosClientes() {
        const calculos = await this.buscarTodosCalculos();
        return calculos.map(calc => this.converterParaCliente(calc));
    }
};

// Exportar para uso global
window.FirebaseService = FirebaseService;

console.log('✅ Firebase Service carregado');
