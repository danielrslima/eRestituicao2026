/* ========================================
   LOGIN - DASHBOARD e-RESTITUIÇÃO
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Se já estiver logado, redirecionar para o dashboard
    if (auth.estaLogado()) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');
    const btnLogin = form.querySelector('.btn-login');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        
        // Mostrar loading
        btnLogin.classList.add('loading');
        btnLogin.textContent = 'Entrando...';
        errorDiv.style.display = 'none';
        
        // Simular delay de autenticação
        setTimeout(() => {
            const resultado = auth.login(email, senha);
            
            if (resultado.sucesso) {
                // Redirecionar para o dashboard
                window.location.href = 'index.html';
            } else {
                // Mostrar erro
                errorDiv.style.display = 'flex';
                errorDiv.innerHTML = '<span>❌</span> ' + resultado.erro;
                btnLogin.classList.remove('loading');
                btnLogin.textContent = 'Entrar';
            }
        }, 800);
    });
});

// Função para mostrar/esconder senha
function togglePassword() {
    const input = document.getElementById('senha');
    const icon = document.getElementById('eyeIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}
