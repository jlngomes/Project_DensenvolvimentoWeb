// JavaScript para animações e interatividade
document.addEventListener('DOMContentLoaded', function() {
    // Animação dos cards de recursos, se existirem na página
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length > 0) {
        featureCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'opacity 0.5s, transform 0.5s';
            }, index * 200);
        });
    }
    
    // Verificando se estamos na página inicial, onde existem estes botões
    const primaryBtn = document.querySelector('.btn-primary');
    const secondaryBtn = document.querySelector('.btn-secondary');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function() {
            // Redirecionando para a página de login quando clicar em "Começar Agora"
            window.location.href = 'login.html';
        });
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', function() {
            // Scroll suave para a seção de recursos
            const featuresSection = document.querySelector('.features');
            if (featuresSection) {
                featuresSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Dark Mode Toggle - isso deve funcionar em todas as páginas
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    
    if (darkModeToggle) {
        // Verificar preferência salva no localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
        }
        
        // Verificar preferência do sistema
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        if (!savedTheme && prefersDarkScheme.matches) {
            htmlElement.setAttribute('data-theme', 'dark');
        }
        
        // Função para alternar o tema
        function toggleTheme() {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }
        
        // Adicionar evento de clique ao botão
        darkModeToggle.addEventListener('click', toggleTheme);
    }
    
    // Adicionando animações para a página Sobre, se estiver nela
    const featureItems = document.querySelectorAll('.feature-item');
    if (featureItems.length > 0) {
        featureItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.5s, transform 0.5s';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            }, index * 150);
        });
    }
    
    const differentialCards = document.querySelectorAll('.differential-card');
    if (differentialCards.length > 0) {
        differentialCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s, transform 0.5s';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 150);
        });
    }
    
    // Animação de digitação para o subtítulo
    const typingElement = document.querySelector('.typing-subtitle');
    if (typingElement) { 
        const fullText = "Pequenas Mudanças, Grandes Conquistas!";
        let speed = 70; // Velocidade da digitação
        let pauseDuration = 2000; // Tempo de pausa entre ciclos
        let deleteSpeed = 30; // Velocidade para apagar o texto

        
        let i = 0;
        let isDeleting = false;
        let isWaiting = false;
        
        function typeWriter() {
            if (isWaiting) {
                isWaiting = false;
                isDeleting = true;
                setTimeout(typeWriter, pauseDuration);
                return;
            }
            
            if (!isDeleting) {
                // Digitando
                if (i < fullText.length) {
                    typingElement.textContent += fullText.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                } else {
                    // Terminou de digitar
                    isWaiting = true;
                    setTimeout(typeWriter, pauseDuration);
                }
            } else {
                // Apagando
                if (typingElement.textContent.length > 0) {
                    typingElement.textContent = typingElement.textContent.slice(0, -1);
                    setTimeout(typeWriter, deleteSpeed);
                } else {
                    // Terminou de apagar
                    isDeleting = false;
                    i = 0;
                    setTimeout(typeWriter, 500); // Pausa antes de começar a digitar novamente
                }
            }

        }
        
        // Iniciar animação de digitação
        setTimeout(typeWriter, 1000); // Pequeno atraso antes de começar
    }

    // ========== CÓDIGO DA PÁGINA DE LOGIN/CADASTRO ==========
    
    // Gerenciar as abas de login e cadastro (se estiver na página de login)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.form');
    
    if (tabButtons.length > 0 && forms.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover a classe 'active' de todos os botões e formulários
                tabButtons.forEach(btn => btn.classList.remove('active'));
                forms.forEach(form => form.classList.remove('active'));
                
                // Adicionar a classe 'active' ao botão clicado e ao formulário correspondente
                button.classList.add('active');
                const targetForm = document.getElementById(button.getAttribute('data-target'));
                targetForm.classList.add('active');
            });
        });
    }
    
    // Gerenciar os botões de mostrar/esconder senha
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    if (togglePasswordButtons.length > 0) {
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const passwordInput = button.previousElementSibling;
                
                // Alternar entre mostrar e esconder a senha
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    button.textContent = '👁️‍🗨️';
                } else {
                    passwordInput.type = 'password';
                    button.textContent = '👁️';
                }
            });
        });
    }
    
    // Validação do formulário de login
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                showMessage('Preencha todos os campos!', 'error');
                return;
            }
            
            // Simulação de login bem-sucedido
            showMessage('Login realizado com sucesso!', 'success');
            
            // Aqui você pode adicionar redirecionamento para página principal
            // ou integração com backend para verificação de credenciais
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
    
    // Validação do formulário de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('cadastro-nome').value;
            const email = document.getElementById('cadastro-email').value;
            const phone = document.getElementById('cadastro-phone').value;
            const password = document.getElementById('cadastro-password').value;
            const confirmPassword = document.getElementById('cadastro-confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            if (!nome || !email || !password || !confirmPassword) {
                showMessage('Preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem!', 'error');
                return;
            }
            
            if (!terms) {
                showMessage('É necessário aceitar os termos e condições!', 'error');
                return;
            }
            
            // Simulação de cadastro bem-sucedido
            showMessage('Cadastro realizado com sucesso!', 'success');
            
            // Aqui você pode adicionar redirecionamento para página principal
            // ou integração com backend para envio dos dados de cadastro
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
    
    // Função para exibir mensagens
    function showMessage(message, type) {
        // Verificar se já existe uma mensagem e removê-la
        const existingMessage = document.querySelector('.message-alert');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Criar elemento de mensagem
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-alert', type);
        messageElement.textContent = message;
        
        // Adicionar ao DOM
        document.body.appendChild(messageElement);
        
        // Remover após alguns segundos
        setTimeout(() => {
            messageElement.classList.add('hide');
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }, 3000);
    }
    
    // Adicionar CSS para as mensagens (apenas se estiver na página de login/cadastro)
    if (document.querySelector('.login-container')) {
        const style = document.createElement('style');
        style.textContent = `
            .message-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                animation: slideIn 0.3s forwards;
            }
            
            .message-alert.success {
                background-color: var(--secondary-color);
            }
            
            .message-alert.error {
                background-color: #e74c3c;
            }
            
            .message-alert.hide {
                animation: slideOut 0.3s forwards;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Funcionalidade de navbar fixa com scroll
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
            // Scroll para baixo - esconde a navbar
            header.style.top = `-${headerHeight}px`;
        } else {
            // Scroll para cima - mostra a navbar
            header.style.top = '0';
        }
        
        lastScrollTop = scrollTop;
    });
});

// Atualiza o ano no rodapé
document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
    }
});