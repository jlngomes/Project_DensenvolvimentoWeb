// Variáveis globais
let financialCharts = {
    evolution: null,
    expenses: null
};

// Inicialização da Dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    const session = await checkAuth();
    if (!session.loggedIn) {
        window.location.href = '/login.html';
        return;
    }

    // Carregar dados do usuário
    loadUserData(session.user.id);
    
    // Configurar eventos
    setupEventListeners();
    
    // Configurar logout
    document.getElementById('logout-btn').addEventListener('click', logout);
});

// Verificar autenticação
async function checkAuth() {
    try {
        const response = await fetch('/api/check-session', {
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        return { loggedIn: false };
    }
}

// Carregar dados do usuário
async function loadUserData(userId) {
    try {
        // Carregar dados do usuário
        const userResponse = await fetch('/api/user-data', {
            credentials: 'include'
        });
        const userData = await userResponse.json();
        
        if (userData.success) {
            document.getElementById('username-display').textContent = 
                userData.user.nome || userData.user.email.split('@')[0];
            
            // Atualizar salário
            if (userData.salary) {
                document.getElementById('current-salary').textContent = 
                    formatCurrency(userData.salary);
                document.getElementById('salary-input').value = 
                    userData.salary;
            }
        }
        
        // Carregar resumo financeiro
        await updateFinancialSummary();
        
        // Carregar transações
        await loadTransactions();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('Erro ao carregar dados financeiros', false);
    }
}

// Atualizar resumo financeiro
async function updateFinancialSummary() {
    try {
        const response = await fetch('/api/financial-summary', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            // Atualizar totais incluindo o salário
            const totalIncome = data.summary.salary + (data.summary.income || 0);
            
            document.getElementById('total-income').textContent = 
                formatCurrency(totalIncome);
            document.getElementById('total-expenses').textContent = 
                formatCurrency(data.summary.expenses || 0);
            
            const balance = totalIncome - (data.summary.expenses || 0);
            const balanceElement = document.getElementById('monthly-balance');
            const statusElement = document.getElementById('balance-status');
            
            balanceElement.textContent = formatCurrency(balance);
            
            if (balance > 0) {
                balanceElement.style.color = '#27ae60';
                statusElement.textContent = '(Positivo)';
                statusElement.style.color = '#27ae60';
            } else if (balance < 0) {
                balanceElement.style.color = '#e74c3c';
                statusElement.textContent = '(Negativo)';
                statusElement.style.color = '#e74c3c';
            } else {
                balanceElement.style.color = '#7f8c8d';
                statusElement.textContent = '(Neutro)';
                statusElement.style.color = '#7f8c8d';
            }
            
            // Atualizar gráficos
            updateCharts(data.summary);
        }
    } catch (error) {
        console.error('Erro ao atualizar resumo:', error);
    }
}

// Carregar transações
async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('statement-body');
            tbody.innerHTML = '';
            
            let runningBalance = 0;
            
            // Primeiro adiciona o salário como renda
            const salaryResponse = await fetch('/api/user-data', {
                credentials: 'include'
            });
            const salaryData = await salaryResponse.json();
            
            if (salaryData.success && salaryData.salary) {
                runningBalance += salaryData.salary;
                
                const salaryRow = document.createElement('tr');
                salaryRow.innerHTML = `
                    <td>${new Date().toLocaleDateString()}</td>
                    <td>Salário</td>
                    <td>Renda</td>
                    <td style="color:#27ae60">+ ${formatCurrency(salaryData.salary)}</td>
                    <td>${formatCurrency(runningBalance)}</td>
                `;
                tbody.appendChild(salaryRow);
            }
            
            // Adicionar transações
            data.transactions.forEach(trans => {
                const row = document.createElement('tr');
                
                if (trans.type === 'income') {
                    runningBalance += trans.amount;
                } else {
                    runningBalance -= trans.amount;
                }
                
                row.innerHTML = `
                    <td>${new Date(trans.date).toLocaleDateString()}</td>
                    <td>${trans.description}</td>
                    <td>${getCategoryName(trans.category)}</td>
                    <td style="color:${trans.type === 'income' ? '#27ae60' : '#e74c3c'}">
                        ${trans.type === 'income' ? '+' : '-'} ${formatCurrency(trans.amount)}
                    </td>
                    <td>${formatCurrency(runningBalance)}</td>
                `;
                
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

// Configurar gráficos
function updateCharts(summaryData) {
    const evolutionCtx = document.getElementById('financial-evolution-chart').getContext('2d');
    const expensesCtx = document.getElementById('expenses-distribution-chart').getContext('2d');
    
    // Destruir gráficos existentes
    if (financialCharts.evolution) financialCharts.evolution.destroy();
    if (financialCharts.expenses) financialCharts.expenses.destroy();
    
    // Gráfico de evolução (simplificado)
    financialCharts.evolution = new Chart(evolutionCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Saldo Mensal',
                data: [3000, 4200, 3800, 4500, 5000, summaryData.balance || 0],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Gráfico de despesas
    if (summaryData.categories && summaryData.categories.length > 0) {
        financialCharts.expenses = new Chart(expensesCtx, {
            type: 'doughnut',
            data: {
                labels: summaryData.categories.map(c => getCategoryName(c.category)),
                datasets: [{
                    data: summaryData.categories.map(c => c.total),
                    backgroundColor: [
                        '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Atualizar salário
    document.getElementById('update-salary').addEventListener('click', async function() {
        const salary = parseFloat(document.getElementById('salary-input').value);
        
        if (!isNaN(salary)) {
            try {
                const response = await fetch('/api/save-salary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: salary }),
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('current-salary').textContent = formatCurrency(salary);
                    showAlert('Salário atualizado com sucesso!', true);
                    await updateFinancialSummary();
                    await loadTransactions();
                }
            } catch (error) {
                showAlert('Erro ao atualizar salário', false);
            }
        }
    });
    
    // Adicionar despesa
    document.getElementById('add-expense').addEventListener('click', async function() {
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        
        if (description && !isNaN(amount) && amount > 0) {
            try {
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'expense',
                        description,
                        category,
                        amount
                    }),
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('Despesa adicionada com sucesso!', true);
                    document.getElementById('expense-description').value = '';
                    document.getElementById('expense-amount').value = '';
                    await updateFinancialSummary();
                    await loadTransactions();
                }
            } catch (error) {
                showAlert('Erro ao adicionar despesa', false);
            }
        }
    });
    
    // Simular investimento
    document.getElementById('simulate-btn').addEventListener('click', function() {
        const initialAmount = parseFloat(document.getElementById('initial-amount').value);
        const months = parseInt(document.getElementById('investment-months').value);
        const type = document.getElementById('investment-type').value;
        
        if (isNaN(initialAmount)) {
            showAlert('Valor inicial inválido', false);
            return;
        }
        
        if (isNaN(months)) {
            showAlert('Período inválido', false);
            return;
        }
        
        let rate;
        switch (type) {
            case 'selic': rate = 0.1015; break;
            case 'cdb': rate = 0.12; break;
            case 'lci': rate = 0.085; break;
            case 'tesouro': rate = 0.055 + 0.05; break;
            default: rate = 0.10;
        }
        
        const monthlyRate = Math.pow(1 + rate, 1/12) - 1;
        const finalAmount = initialAmount * Math.pow(1 + monthlyRate, months);
        const earnings = finalAmount - initialAmount;
        
        document.getElementById('final-amount').textContent = formatCurrency(finalAmount);
        document.getElementById('earnings-amount').textContent = formatCurrency(earnings);
    });
    
    // Baixar extrato
    document.getElementById('download-statement').addEventListener('click', function() {
        showAlert('Recurso de download será implementado em breve!', true);
    });
}

// Funções auxiliares
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function getCategoryName(category) {
    const categories = {
        'alimentacao': 'Alimentação',
        'moradia': 'Moradia',
        'transporte': 'Transporte',
        'lazer': 'Lazer',
        'outros': 'Outros'
    };
    return categories[category] || category;
}

function showAlert(message, isSuccess) {
    const alert = document.createElement('div');
    alert.className = `alert ${isSuccess ? 'success' : 'error'}`;
    alert.textContent = message;
    document.body.prepend(alert);
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            credentials: 'include'
        });
        if (response.ok) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}