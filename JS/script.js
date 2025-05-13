// JavaScript para animações e interatividade
document.addEventListener('DOMContentLoaded', function() {
    // ========== ANIMAÇÃO DE DIGITAÇÃO ==========
    function setupTypingAnimation() {
        const element = document.querySelector('.typing-subtitle');
        if (!element) return;

        const texts = [
            "Pequenas Mudanças, Grandes Conquistas!",
            "Controle Financeiro Simplificado", 
            "Liberdade Financeira em Suas Mãos"
        ];
        let currentTextIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        const pauseBetweenTexts = 2000;

        function type() {
            const currentText = texts[currentTextIndex];
            
            if (isDeleting) {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                typingSpeed = pauseBetweenTexts;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentTextIndex = (currentTextIndex + 1) % texts.length;
                typingSpeed = 500;
            }

            setTimeout(type, typingSpeed);
        }

        setTimeout(type, 1000);
    }

    // ========== DARK MODE TOGGLE ==========
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Atualiza ícones
        document.querySelector('.dark-mode-icon').style.display = newTheme === 'light' ? 'inline' : 'none';
        document.querySelector('.light-mode-icon').style.display = newTheme === 'dark' ? 'inline' : 'none';
    }

    if (darkModeToggle) {
        // Verificar preferência salva ou do sistema
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            htmlElement.setAttribute('data-theme', 'dark');
        }
        
        // Configurar ícones iniciais
        document.querySelector('.dark-mode-icon').style.display = 
            htmlElement.getAttribute('data-theme') === 'light' ? 'inline' : 'none';
        document.querySelector('.light-mode-icon').style.display = 
            htmlElement.getAttribute('data-theme') === 'dark' ? 'inline' : 'none';
        
        darkModeToggle.addEventListener('click', toggleTheme);
    }

    // ========== MENU HAMBURGUER ==========
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
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
    // ========== NAVBAR FIXA COM SCROLL ==========
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    if (header) {
        const headerHeight = header.offsetHeight;
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                header.style.top = `-${headerHeight}px`;
            } else {
                header.style.top = '0';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // ========== CONTADOR DE ESTATÍSTICAS ==========
    const statCounts = document.querySelectorAll('.stat-count');
    
    if (statCounts.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const targetNumber = parseInt(target.getAttribute('data-count'));
                    let count = 0;
                    const duration = 2000;
                    const interval = Math.floor(duration / targetNumber);
                    
                    const counter = setInterval(() => {
                        count++;
                        target.textContent = count;
                        
                        if (count >= targetNumber) {
                            clearInterval(counter);
                        }
                    }, interval);
                    
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        statCounts.forEach(counter => {
            observer.observe(counter);
        });
    }

    // ========== SLIDER DE DEPOIMENTOS ==========
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    
    if (testimonialDots.length > 0 && testimonialCards.length > 0) {
        let currentIndex = 0;
        
        function showTestimonial(index) {
            testimonialDots.forEach(dot => dot.classList.remove('active'));
            testimonialCards.forEach(card => card.classList.remove('active'));
            
            testimonialDots[index].classList.add('active');
            testimonialCards[index].classList.add('active');
            currentIndex = index;
        }
        
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => showTestimonial(index));
        });
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = testimonialCards.length - 1;
                showTestimonial(newIndex);
            });
            
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= testimonialCards.length) newIndex = 0;
                showTestimonial(newIndex);
            });
        }
        
        // Rotação automática
        setInterval(() => {
            let newIndex = currentIndex + 1;
            if (newIndex >= testimonialCards.length) newIndex = 0;
            showTestimonial(newIndex);
        }, 5000);
    }

    // ========== FORMULÁRIO NEWSLETTER ==========
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (!emailInput.value) {
                showMessage('Por favor, insira um e-mail válido.', 'error');
                return;
            }
            
            // Simulação de sucesso
            showMessage('Inscrição realizada com sucesso!', 'success');
            emailInput.value = '';
        });
    }

    // ========== REDIRECIONAMENTO DE BOTÕES ==========
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Começar') || this.textContent.includes('Criar')) {
                window.location.href = 'login.html';
            }
        });
    });

    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const featuresSection = document.querySelector('.features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ========== FUNÇÃO PARA MENSAGENS ==========
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.message-alert');
        if (existingMessage) existingMessage.remove();
        
        const messageElement = document.createElement('div');
        messageElement.className = `message-alert ${type}`;
        messageElement.textContent = message;
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.classList.add('hide');
            setTimeout(() => messageElement.remove(), 300);
        }, 3000);
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
    
    // ========== INICIALIZAÇÃO ==========
    setupTypingAnimation();
    
    // Inicializa AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Atualiza o ano no rodapé
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});