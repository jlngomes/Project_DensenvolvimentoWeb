const ERROR_STYLES = `
    <style id="login-error-styles">
        .login-error-message {
            color: #d32f2f;
            background-color: #fdecea;
            padding: 12px 16px;
            border-radius: 4px;
            border-left: 4px solid #d32f2f;
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: fadeIn 0.3s ease;
        }
        
        .login-error-message::before {
            content: "⚠";
            font-size: 18px;
        }
        
        .login-field-error {
            border-color: #d32f2f !important;
            background-color: #fff6f6 !important;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
    </style>
`;

/**
 * Mostra mensagem de erro estilizada no login
 * @param {boolean} show - Mostrar ou esconder
 * @param {string} message - Mensagem personalizada
 */
function showLoginError(show, message = 'Usuário ou senha incorretos') {
    // Adiciona estilos dinâmicos se não existirem
    if (!document.getElementById('login-error-styles')) {
        document.head.insertAdjacentHTML('beforeend', ERROR_STYLES);
    }
    
    // Elementos do DOM
    let errorContainer = document.getElementById('login-error-container');
    const emailField = document.getElementById('login-email');
    const passwordField = document.getElementById('login-password');
    
    // Cria container de erro se não existir
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'login-error-container';
        const loginForm = document.getElementById('login-form');
        loginForm.insertBefore(errorContainer, loginForm.firstChild);
    }
    
    if (show) {
        // Mostra mensagem de erro
        errorContainer.innerHTML = `
            <div class="login-error-message">
                ${message}
            </div>
        `;
        
        // Adiciona efeitos visuais aos campos
        emailField.classList.add('login-field-error');
        passwordField.classList.add('login-field-error');
        emailField.style.animation = 'shake 0.5s';
        passwordField.style.animation = 'shake 0.5s';
        
        // Remove animação após execução
        setTimeout(() => {
            emailField.style.animation = '';
            passwordField.style.animation = '';
        }, 500);
    } else {
        // Limpa erros
        errorContainer.innerHTML = '';
        emailField.classList.remove('login-field-error');
        passwordField.classList.remove('login-field-error');
    }
}

/**
 * Configura o formulário de login com tratamento de erros
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        showLoginError(false); // Reseta erros
        
        // Configura estado do botão
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
        
        // Dados do formulário
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // Requisição para API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Login bem-sucedido
                showAlert('✔ Login realizado! Redirecionando...', true, 1000);
                setTimeout(() => {
                    window.location.href = result.redirect || '/dashboard.html';
                }, 1200);
            } else {
                // Login falhou
                showLoginError(true, result.message || 'Credenciais inválidas');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            // Erro de conexão
            showLoginError(true, 'Erro ao conectar com o servidor');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            console.error('Erro no login:', error);
        }
    });
}

/**
 * Mostra alerta temporário na tela
 * @param {string} message - Texto da mensagem
 * @param {boolean} isSuccess - Tipo de alerta (sucesso/erro)
 * @param {number} duration - Tempo de exibição (ms)
 */
function showAlert(message, isSuccess, duration = 3000) {
    const alert = document.createElement('div');
    alert.className = `alert ${isSuccess ? 'success' : 'error'}`;
    alert.textContent = message;
    document.body.prepend(alert);

    // Adiciona z-index maior que o header (1000)
    alert.style.zIndex = '1001';
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, duration);
}

/**
 * Configura o formulário de cadastro
 */
function setupRegisterForm() {
    const registerForm = document.getElementById('cadastro-form');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('cadastro-nome').value,
            email: document.getElementById('cadastro-email').value,
            telefone: document.getElementById('cadastro-phone').value,
            password: document.getElementById('cadastro-password').value,
            confirmPassword: document.getElementById('cadastro-confirm-password').value
        };
        
        // Validações
        if (!document.getElementById('terms').checked) {
            showAlert('Você deve aceitar os termos e condições', false);
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            showAlert('As senhas não coincidem', false);
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('✔ Cadastro realizado! Faça login.', true);
                document.querySelector('.tab-btn[data-target="login-form"]').click();
                document.getElementById('login-email').value = formData.email;
                document.getElementById('login-password').focus();
            } else {
                showAlert(result.message || 'Erro no cadastro', false);
            }
        } catch (error) {
            showAlert('Erro ao conectar com o servidor', false);
            console.error('Erro:', error);
        }
    });
}

/**
 * Configura o sistema de tabs (login/cadastro)
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const target = button.dataset.target;
            
            // Atualiza tabs ativas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mostra o formulário correto
            document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            
            // Limpa erros ao trocar de tab
            showLoginError(false);
        });
    });
}

/**
 * Configura o toggle para mostrar/esconder senha
 */
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.password-input').querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🔒';
        });
    });
}

/**
 * Configura máscara para telefone
 */
function setupPhoneMask() {
    const phoneInput = document.getElementById('cadastro-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) formattedValue = `(${value.substring(0, 2)}`;
            if (value.length > 2) formattedValue += `) ${value.substring(2, 7)}`;
            if (value.length > 7) formattedValue += `-${value.substring(7, 11)}`;
            
            e.target.value = formattedValue;
        });
    }
}

/**
 * Verifica se o usuário já está logado
 */
async function checkSession() {
    try {
        const response = await fetch('/api/check-session', {
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) throw new Error('Erro na verificação');
        
        const data = await response.json();
        
        if (data.loggedIn) {
            window.location.href = '/dashboard.html';
            return true;
        }
        return false;
    } catch (error) {
        console.error('Falha na verificação de sessão:', error);
        return false;
    }
}

/**
 * Configura o toggle do tema escuro
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    
    // Verifica preferência do usuário ou tema salvo
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Aplica o tema inicial
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Alterna o tema
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// INICIALIZAÇÃO DO SISTEMA

document.addEventListener('DOMContentLoaded', function() {
    // Verifica sessão primeiro
    checkSession().then(loggedIn => {
        if (!loggedIn) {
            // Configura todos os componentes
            setupTabs();
            setupLoginForm();
            setupRegisterForm();
            setupPasswordToggles();
            setupPhoneMask();
            setupDarkModeToggle(); // Adiciona o toggle do tema escuro
        }
    });
});