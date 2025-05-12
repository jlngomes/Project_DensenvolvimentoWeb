import express from 'express';
import session from 'express-session';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// Configuração do diretório
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configurações importantes para sessão e CORS
app.set('trust proxy', 1);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Configuração de sessão
app.use(session({
    secret: 'finwise_seguro_123!@#',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        secure: false,
        httpOnly: true,
        sameSite: 'strict'
    }
}));

// Banco de dados
let db;
(async () => {
    try {
        db = await open({
            filename: path.join(__dirname, 'database.db'),
            driver: sqlite3.Database
        });

        // Criar tabelas
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                email TEXT UNIQUE,
                telefone TEXT,
                password TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                type TEXT CHECK(type IN ('income', 'expense')),
                description TEXT,
                category TEXT,
                amount REAL,
                date TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS salaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                amount REAL,
                effective_date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        console.log('✅ Banco de dados conectado e tabelas verificadas');
    } catch (err) {
        console.error('❌ Erro no banco de dados:', err);
        process.exit(1);
    }
})();

// Middleware de autenticação
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        if (req.originalUrl.includes('/api')) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/login.html');
    }
    next();
}

// Rotas de Autenticação
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await db.get(
            'SELECT id, nome, email FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        
        if (user) {
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.userName = user.nome;
            
            return res.json({ 
                success: true,
                redirect: '/dashboard.html',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'E-mail ou senha incorretos' 
            });
        }
    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
});

app.post('/api/register', async (req, res) => {
    const { nome, email, telefone, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'As senhas não coincidem' 
        });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'A senha deve ter pelo menos 6 caracteres' 
        });
    }

    try {
        const result = await db.run(
            'INSERT INTO users (nome, email, telefone, password) VALUES (?, ?, ?, ?)',
            [nome, email, telefone, password]
        );
        
        res.json({ 
            success: true,
            message: 'Cadastro realizado com sucesso!',
            userId: result.lastID
        });
    } catch (err) {
        const message = err.message.includes('UNIQUE') 
            ? 'E-mail já cadastrado' 
            : 'Erro ao cadastrar usuário';
        res.status(400).json({ 
            success: false, 
            message 
        });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).json({ success: false });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

app.get('/api/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                nome: req.session.userName,
                email: req.session.userEmail
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Rotas da Dashboard
app.get('/api/user-data', requireAuth, async (req, res) => {
    try {
        const user = await db.get(
            'SELECT id, nome, email FROM users WHERE id = ?',
            [req.session.userId]
        );
        
        const salary = await db.get(
            'SELECT amount FROM salaries WHERE user_id = ? ORDER BY effective_date DESC LIMIT 1',
            [req.session.userId]
        );
        
        res.json({ 
            success: true, 
            user,
            salary: salary?.amount || 0
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erro no servidor' });
    }
});

app.post('/api/save-salary', requireAuth, async (req, res) => {
    const { amount } = req.body;
    
    try {
        await db.run(
            'INSERT INTO salaries (user_id, amount) VALUES (?, ?)',
            [req.session.userId, amount]
        );
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erro ao salvar salário' });
    }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
    const { type, description, category, amount, date } = req.body;
    
    try {
        await db.run(
            'INSERT INTO transactions (user_id, type, description, category, amount, date) VALUES (?, ?, ?, ?, ?, ?)',
            [req.session.userId, type, description, category, amount, date || new Date().toISOString()]
        );
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erro ao salvar transação' });
    }
});

app.get('/api/transactions', requireAuth, async (req, res) => {
    try {
        const transactions = await db.all(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 50',
            [req.session.userId]
        );
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erro ao buscar transações' });
    }
});

app.get('/api/financial-summary', requireAuth, async (req, res) => {
    try {
        const income = await db.get(
            'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = "income"',
            [req.session.userId]
        );
        
        const expenses = await db.get(
            'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = "expense"',
            [req.session.userId]
        );
        
        const categories = await db.all(
            `SELECT category, SUM(amount) as total 
             FROM transactions 
             WHERE user_id = ? AND type = "expense" 
             GROUP BY category`,
            [req.session.userId]
        );
        
        const salary = await db.get(
            'SELECT amount FROM salaries WHERE user_id = ? ORDER BY effective_date DESC LIMIT 1',
            [req.session.userId]
        );
        
        res.json({
            success: true,
            summary: {
                salary: salary?.amount || 0,
                income: income.total || 0,
                expenses: expenses.total || 0,
                balance: (salary?.amount || 0) + (income.total || 0) - (expenses.total || 0),
                categories
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erro ao calcular resumo' });
    }
});

// Rotas para páginas HTML
const serveHtml = (fileName) => (req, res) => {
    res.sendFile(path.join(__dirname, fileName));
};

// Páginas públicas
app.get('/', serveHtml('index.html'));
app.get('/index.html', serveHtml('index.html'));
app.get('/login.html', serveHtml('login.html'));
app.get('/contato.html', serveHtml('contato.html'));
app.get('/sobre.html', serveHtml('sobre.html'));

// Páginas protegidas
app.get('/dashboard.html', requireAuth, serveHtml('dashboard.html'));
app.get('/recurso.html', requireAuth, serveHtml('recurso.html'));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🟢 Servidor FinWise rodando na porta ${PORT}`);
    console.log(`\n🔗 URLs importantes:`);
    console.log(`- Página inicial: http://localhost:${PORT}`);
    console.log(`- Login: http://localhost:${PORT}/login.html`);
    console.log(`- Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`\n📊 Banco de dados: database.db`);
    console.log(`\n🛑 Pressione Ctrl+C para encerrar\n`);
});