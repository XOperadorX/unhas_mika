const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'mikaela-unhas-secret-2026-troque-em-producao';
const JWT_EXPIRA = '7d';

// ==========================================
// VERSÃO DO SISTEMA
// ==========================================
const VERSAO = {
  numero: '1.2.0',
  nome: 'Unhas Mikaela',
  data: '2026-10-11',
  autor: 'Mikaela',
  historico: [
    { versao: '1.2.0', data: '2026-10-11', mudancas: ['Educação financeira turbinada', 'Insights inteligentes', 'Exportação CSV finanças', 'Gráfico otimizado (1 query)'] },
    { versao: '1.1.0', data: '2026-10-11', mudancas: ['Excluir caixa do histórico', 'Otimização de performance', 'Versionamento'] },
    { versao: '1.0.0', data: '2026-10-01', mudancas: ['Versão inicial'] }
  ]
};

console.log(`\n╔════════════════════════════════════════╗`);
console.log(`║   💅 ${VERSAO.nome.padEnd(30)}║`);
console.log(`║   📦 Versão ${VERSAO.numero.padEnd(25)}║`);
console.log(`║   📅 ${VERSAO.data.padEnd(32)}║`);
console.log(`╚════════════════════════════════════════╝`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/loja', express.static('loja'));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ==========================================
// UPLOAD
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `prod_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ==========================================
// BANCO
// ==========================================
const db = new Database('banco.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    cargo TEXT NOT NULL,
    ativo INTEGER DEFAULT 1,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT,
    observacoes TEXT,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT,
    preco REAL DEFAULT 0,
    custo REAL DEFAULT 0,
    quantidade INTEGER DEFAULT 0,
    minimo INTEGER DEFAULT 5,
    maximo INTEGER DEFAULT 100,
    foto TEXT,
    descricao TEXT,
    publicar_loja INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS caixa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    valor_inicial REAL DEFAULT 0,
    status TEXT DEFAULT 'aberto',
    abertura TEXT,
    fechamento TEXT,
    saldo_final REAL DEFAULT 0,
    usuario_id INTEGER,
    usuario_nome TEXT
  );

  CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caixa_id INTEGER NOT NULL,
    data TEXT,
    hora TEXT,
    descricao TEXT,
    valor REAL,
    tipo TEXT,
    categoria TEXT DEFAULT 'Essencial',
    usuario_id INTEGER,
    usuario_nome TEXT,
    agendamento_id INTEGER,
    estornada INTEGER DEFAULT 0,
    motivo_estorno TEXT,
    FOREIGN KEY (caixa_id) REFERENCES caixa(id)
  );

  CREATE TABLE IF NOT EXISTS atendimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    cliente_nome TEXT,
    data TEXT,
    hora TEXT,
    servicos TEXT,
    valor REAL,
    valor_previsto REAL,
    pagamento TEXT,
    profissional_id INTEGER,
    profissional_nome TEXT,
    comissao REAL DEFAULT 0,
    status TEXT DEFAULT 'feito',
    taxa_percentual REAL DEFAULT 30,
    taxa_cobrada REAL DEFAULT 0,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_nome TEXT,
    cliente_telefone TEXT,
    cliente_endereco TEXT,
    itens TEXT,
    total REAL,
    status TEXT DEFAULT 'pendente',
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS config_financeira (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    percentual_essencial REAL DEFAULT 50,
    percentual_desejo REAL DEFAULT 30,
    percentual_investimento REAL DEFAULT 20,
    meta_economia_mensal REAL DEFAULT 0,
    reserva_atual REAL DEFAULT 0,
    reserva_meta REAL DEFAULT 0,
    atualizado_em TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// Migrações
try {
  const t = (tab) => db.prepare(`PRAGMA table_info(${tab})`).all().map(c => c.name);
  if (!t('caixa').includes('usuario_id')) {
    db.exec("ALTER TABLE caixa ADD COLUMN usuario_id INTEGER");
    db.exec("ALTER TABLE caixa ADD COLUMN usuario_nome TEXT");
  }
  if (!t('movimentacoes').includes('usuario_id')) {
    db.exec("ALTER TABLE movimentacoes ADD COLUMN usuario_id INTEGER");
    db.exec("ALTER TABLE movimentacoes ADD COLUMN usuario_nome TEXT");
  }
  if (!t('movimentacoes').includes('agendamento_id')) {
    db.exec("ALTER TABLE movimentacoes ADD COLUMN agendamento_id INTEGER");
  }
  if (!t('movimentacoes').includes('estornada')) {
    db.exec("ALTER TABLE movimentacoes ADD COLUMN estornada INTEGER DEFAULT 0");
  }
  if (!t('movimentacoes').includes('motivo_estorno')) {
    db.exec("ALTER TABLE movimentacoes ADD COLUMN motivo_estorno TEXT");
  }
  if (!t('atendimentos').includes('profissional_id')) {
    db.exec("ALTER TABLE atendimentos ADD COLUMN profissional_id INTEGER");
    db.exec("ALTER TABLE atendimentos ADD COLUMN profissional_nome TEXT");
    db.exec("ALTER TABLE atendimentos ADD COLUMN comissao REAL DEFAULT 0");
  }
  if (!t('atendimentos').includes('status')) {
    db.exec("ALTER TABLE atendimentos ADD COLUMN status TEXT DEFAULT 'feito'");
  }
  if (!t('atendimentos').includes('valor_previsto')) {
    db.exec("ALTER TABLE atendimentos ADD COLUMN valor_previsto REAL");
  }
  if (!t('atendimentos').includes('taxa_percentual')) {
    db.exec("ALTER TABLE atendimentos ADD COLUMN taxa_percentual REAL DEFAULT 30");
  }
  if (!t('atendimentos').includes('taxa_cobrada')) {
    db.exec("ALTER TABLE atendimentos ADD COLUMN taxa_cobrada REAL DEFAULT 0");
  }
  if (!t('produtos').includes('maximo')) db.exec("ALTER TABLE produtos ADD COLUMN maximo INTEGER DEFAULT 100");
  if (!t('produtos').includes('foto')) db.exec("ALTER TABLE produtos ADD COLUMN foto TEXT");
  if (!t('produtos').includes('descricao')) db.exec("ALTER TABLE produtos ADD COLUMN descricao TEXT");
  if (!t('produtos').includes('publicar_loja')) db.exec("ALTER TABLE produtos ADD COLUMN publicar_loja INTEGER DEFAULT 1");
} catch (e) { console.log('Migração:', e.message); }

// Índices
try {
  db.exec("CREATE INDEX IF NOT EXISTS idx_mov_caixa ON movimentacoes(caixa_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_mov_data ON movimentacoes(data)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_caixa_data ON caixa(data)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_atend_data ON atendimentos(data)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_atend_prof ON atendimentos(profissional_id)");
} catch (e) { console.log('Índices:', e.message); }

// ==========================================
// SEED
// ==========================================
const totalUsers = db.prepare('SELECT COUNT(*) as n FROM usuarios').get().n;
if (totalUsers === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)')
    .run('Administradora', 'admin@mikaela.com', hash, 'admin');
  console.log('\n🔑 Usuário padrão: admin@mikaela.com / admin123\n');
}

// ==========================================
// CARGOS
// ==========================================
const CARGOS = {
  admin:    { nome: '👑 Administradora',      nivel: 5, comissao: 0    },
  lider:    { nome: '💅 Manicure Líder',       nivel: 4, comissao: 0.10 },
  podologa: { nome: '🦶 Podóloga',            nivel: 4, comissao: 0.50 },
  master:   { nome: '⭐ Nail Designer Master', nivel: 3, comissao: 0.40 },
  pleno:    { nome: '✨ Manicure Pleno',        nivel: 2, comissao: 0.50 },
  junior:   { nome: '🌱 Manicure Júnior',       nivel: 1, comissao: 0.50 },
  auxiliar: { nome: '🌿 Auxiliar (Iniciante)',  nivel: 0, comissao: 0.30 }
};

function temPermissao(cargo, recurso) {
  const nivel = CARGOS[cargo]?.nivel ?? -1;
  const regras = {
    'usuarios': 5, 'caixa_abrir': 2, 'caixa_fechar': 3, 'caixa_ver_todos': 4,
    'clientes_edit': 2, 'clientes_del': 3, 'produtos_edit': 3, 'produtos_del': 3,
    'atendimentos_todos': 3, 'relatorios': 3, 'loja_gerenciar': 3, 'config': 5
  };
  return nivel >= (regras[recurso] ?? 0);
}

// ==========================================
// MIDDLEWARES
// ==========================================
function auth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ erro: 'Não autenticado' });
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ erro: 'Sessão expirada' });
  }
}

function requirePerm(recurso) {
  return (req, res, next) => {
    if (!temPermissao(req.usuario.cargo, recurso)) {
      return res.status(403).json({ erro: 'Sem permissão para: ' + recurso });
    }
    next();
  };
}

// ==========================================
// VERSÃO
// ==========================================
app.get('/api/versao', (req, res) => { res.json(VERSAO); });

// ==========================================
// AUTH
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }
  const token = jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo },
    JWT_SECRET, { expiresIn: JWT_EXPIRA }
  );
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ ok: true, usuario: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo }, token });
});

app.post('/api/auth/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
app.get('/api/auth/me', auth, (req, res) => res.json(req.usuario));

app.put('/api/auth/senha', auth, (req, res) => {
  const { senha_atual, senha_nova } = req.body;
  if (!senha_nova || senha_nova.length < 6) return res.status(400).json({ erro: 'Senha nova precisa ter ao menos 6 caracteres' });
  const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!bcrypt.compareSync(senha_atual, user.senha_hash)) return res.status(401).json({ erro: 'Senha atual incorreta' });
  const hash = bcrypt.hashSync(senha_nova, 10);
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(hash, req.usuario.id);
  res.json({ ok: true });
});

// ==========================================
// USUÁRIOS
// ==========================================
app.get('/api/usuarios', auth, requirePerm('usuarios'), (req, res) => {
  res.json(db.prepare('SELECT id, nome, email, cargo, ativo, criado_em FROM usuarios ORDER BY nome').all());
});
app.post('/api/usuarios', auth, requirePerm('usuarios'), (req, res) => {
  const { nome, email, senha, cargo } = req.body;
  if (!nome || !email || !senha || !cargo) return res.status(400).json({ erro: 'Campos obrigatórios' });
  if (!CARGOS[cargo]) return res.status(400).json({ erro: 'Cargo inválido' });
  if (senha.length < 6) return res.status(400).json({ erro: 'Senha mínima: 6 caracteres' });
  try {
    const hash = bcrypt.hashSync(senha, 10);
    const info = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)')
      .run(nome, email.toLowerCase().trim(), hash, cargo);
    res.json({ id: info.lastInsertRowid });
  } catch (e) { res.status(400).json({ erro: 'Email já cadastrado' }); }
});
app.put('/api/usuarios/:id', auth, requirePerm('usuarios'), (req, res) => {
  const { nome, email, cargo, ativo, senha } = req.body;
  if (senha) {
    const hash = bcrypt.hashSync(senha, 10);
    db.prepare('UPDATE usuarios SET nome=?, email=?, cargo=?, ativo=?, senha_hash=? WHERE id=?')
      .run(nome, email.toLowerCase().trim(), cargo, ativo ? 1 : 0, hash, req.params.id);
  } else {
    db.prepare('UPDATE usuarios SET nome=?, email=?, cargo=?, ativo=? WHERE id=?')
      .run(nome, email.toLowerCase().trim(), cargo, ativo ? 1 : 0, req.params.id);
  }
  res.json({ ok: true });
});
app.delete('/api/usuarios/:id', auth, requirePerm('usuarios'), (req, res) => {
  if (parseInt(req.params.id) === req.usuario.id) return res.status(400).json({ erro: 'Você não pode se excluir' });
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
app.get('/api/cargos', auth, (req, res) => res.json(CARGOS));

// ==========================================
// UPLOAD
// ==========================================
app.post('/api/upload', auth, upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Sem arquivo' });
  res.json({ caminho: '/uploads/' + req.file.filename });
});

// ==========================================
// CLIENTES
// ==========================================
app.get('/api/clientes', auth, (req, res) => res.json(db.prepare('SELECT * FROM clientes ORDER BY nome').all()));
app.post('/api/clientes', auth, requirePerm('clientes_edit'), (req, res) => {
  const { nome, telefone, endereco, observacoes } = req.body;
  const info = db.prepare('INSERT INTO clientes (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)').run(nome, telefone, endereco, observacoes);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/clientes/:id', auth, requirePerm('clientes_edit'), (req, res) => {
  const { nome, telefone, endereco, observacoes } = req.body;
  db.prepare('UPDATE clientes SET nome=?, telefone=?, endereco=?, observacoes=? WHERE id=?')
    .run(nome, telefone, endereco, observacoes, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/clientes/:id', auth, requirePerm('clientes_del'), (req, res) => {
  db.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ==========================================
// PRODUTOS
// ==========================================
app.get('/api/produtos', auth, (req, res) => res.json(db.prepare('SELECT * FROM produtos ORDER BY nome').all()));
app.post('/api/produtos', auth, requirePerm('produtos_edit'), (req, res) => {
  const { nome, categoria, preco, custo, quantidade, minimo, maximo, foto, descricao, publicar_loja } = req.body;
  const info = db.prepare(
    `INSERT INTO produtos (nome, categoria, preco, custo, quantidade, minimo, maximo, foto, descricao, publicar_loja)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(nome, categoria, preco, custo, quantidade, minimo || 5, maximo || 100, foto || null, descricao || '', publicar_loja ? 1 : 0);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/produtos/:id', auth, requirePerm('produtos_edit'), (req, res) => {
  const { nome, categoria, preco, custo, quantidade, minimo, maximo, foto, descricao, publicar_loja } = req.body;
  db.prepare(
    `UPDATE produtos SET nome=?, categoria=?, preco=?, custo=?, quantidade=?, minimo=?, maximo=?, foto=?, descricao=?, publicar_loja=? WHERE id=?`
  ).run(nome, categoria, preco, custo, quantidade, minimo, maximo, foto, descricao, publicar_loja ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/produtos/:id', auth, requirePerm('produtos_del'), (req, res) => {
  db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ==========================================
// LOJA PÚBLICA
// ==========================================
app.get('/api/loja/produtos', (req, res) => {
  res.json(db.prepare('SELECT id, nome, categoria, preco, quantidade, foto, descricao FROM produtos WHERE publicar_loja = 1 AND quantidade > 0 ORDER BY nome').all());
});
app.post('/api/loja/pedido', (req, res) => {
  const { cliente_nome, cliente_telefone, cliente_endereco, itens, total } = req.body;
  if (!cliente_nome || !itens) return res.status(400).json({ erro: 'Dados incompletos' });
  const info = db.prepare('INSERT INTO pedidos (cliente_nome, cliente_telefone, cliente_endereco, itens, total) VALUES (?, ?, ?, ?, ?)')
    .run(cliente_nome, cliente_telefone, cliente_endereco, JSON.stringify(itens), total);
  itens.forEach(it => {
    db.prepare('UPDATE produtos SET quantidade = MAX(0, quantidade - ?) WHERE id = ?').run(it.qtd, it.id);
  });
  res.json({ id: info.lastInsertRowid, ok: true });
});
app.get('/api/loja/pedidos', auth, (req, res) => {
  const lista = db.prepare('SELECT * FROM pedidos ORDER BY id DESC').all();
  res.json(lista.map(p => ({ ...p, itens: JSON.parse(p.itens || '[]') })));
});
app.put('/api/loja/pedidos/:id', auth, requirePerm('loja_gerenciar'), (req, res) => {
  db.prepare('UPDATE pedidos SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ ok: true });
});

// ==========================================
// CAIXA
// ==========================================
app.get('/api/caixa/hoje', auth, (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  res.json(db.prepare("SELECT * FROM caixa WHERE data = ? AND status = 'aberto'").get(hoje) || null);
});

app.post('/api/caixa/abrir', auth, requirePerm('caixa_abrir'), (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  const hora = new Date().toLocaleTimeString('pt-BR');
  const info = db.prepare(
    "INSERT INTO caixa (data, valor_inicial, status, abertura, usuario_id, usuario_nome) VALUES (?, ?, 'aberto', ?, ?, ?)"
  ).run(hoje, req.body.valor_inicial || 0, hora, req.usuario.id, req.usuario.nome);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/caixa/:id/fechar', auth, requirePerm('caixa_fechar'), (req, res) => {
  const hora = new Date().toLocaleTimeString('pt-BR');
  const movs = db.prepare('SELECT * FROM movimentacoes WHERE caixa_id = ? AND (estornada IS NULL OR estornada = 0)').all(req.params.id);
  const entradas = movs.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
  const saidas = movs.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
  const cx = db.prepare('SELECT * FROM caixa WHERE id = ?').get(req.params.id);
  const saldoFinal = cx.valor_inicial + entradas - saidas;
  db.prepare("UPDATE caixa SET status='fechado', fechamento=?, saldo_final=? WHERE id=?").run(hora, saldoFinal, req.params.id);
  res.json({ ok: true, saldo_final: saldoFinal });
});

app.get('/api/caixa/historico', auth, (req, res) => {
  const lista = db.prepare(`
    SELECT
      c.*,
      COALESCE(SUM(CASE WHEN m.tipo = 'entrada' AND (m.estornada IS NULL OR m.estornada = 0) THEN m.valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN m.tipo = 'saida' AND (m.estornada IS NULL OR m.estornada = 0) THEN m.valor ELSE 0 END), 0) AS saidas,
      COUNT(CASE WHEN (m.estornada IS NULL OR m.estornada = 0) THEN 1 END) AS qtd_mov
    FROM caixa c
    LEFT JOIN movimentacoes m ON m.caixa_id = c.id
    GROUP BY c.id
    ORDER BY c.data DESC, c.id DESC
    LIMIT 60
  `).all();

  res.json(lista.map(cx => ({
    ...cx,
    saldo_atual: cx.valor_inicial + cx.entradas - cx.saidas
  })));
});

app.get('/api/caixa/:id/csv', auth, (req, res) => {
  const cx = db.prepare('SELECT * FROM caixa WHERE id = ?').get(req.params.id);
  if (!cx) return res.status(404).json({ erro: 'Caixa não encontrado' });
  const movs = db.prepare('SELECT * FROM movimentacoes WHERE caixa_id = ? ORDER BY id ASC').all(cx.id);
  let csv = `Relatório de Caixa - ${cx.data}\n`;
  csv += `Abertura: ${cx.abertura || '-'} | Fechamento: ${cx.fechamento || '-'}\n`;
  csv += `Valor inicial: R$ ${(cx.valor_inicial || 0).toFixed(2).replace('.', ',')}\n\n`;
  csv += 'ID;Hora;Descrição;Tipo;Categoria;Valor;Usuário;Estornada\n';
  movs.forEach(m => {
    csv += `${m.id};${m.hora};"${(m.descricao || '').replace(/"/g, "'")}";${m.tipo};${m.categoria || ''};${(m.valor || 0).toFixed(2).replace('.', ',')};${m.usuario_nome || ''};${m.estornada ? 'SIM' : 'Não'}\n`;
  });
  const ativas = movs.filter(m => !m.estornada);
  const entradas = ativas.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
  const saidas = ativas.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
  const saldo = cx.valor_inicial + entradas - saidas;
  csv += `\nTOTAL ENTRADAS;R$ ${entradas.toFixed(2).replace('.', ',')}\n`;
  csv += `TOTAL SAÍDAS;R$ ${saidas.toFixed(2).replace('.', ',')}\n`;
  csv += `SALDO;R$ ${saldo.toFixed(2).replace('.', ',')}\n`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="caixa-${cx.data}.csv"`);
  res.send('\ufeff' + csv);
});

app.get('/api/caixa/historico/csv', auth, (req, res) => {
  const lista = db.prepare(`
    SELECT
      c.*,
      COALESCE(SUM(CASE WHEN m.tipo = 'entrada' AND (m.estornada IS NULL OR m.estornada = 0) THEN m.valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN m.tipo = 'saida' AND (m.estornada IS NULL OR m.estornada = 0) THEN m.valor ELSE 0 END), 0) AS saidas
    FROM caixa c
    LEFT JOIN movimentacoes m ON m.caixa_id = c.id
    GROUP BY c.id
    ORDER BY c.data DESC
  `).all();

  let csv = 'Histórico de Caixas\n\n';
  csv += 'Data;Abertura;Fechamento;Valor Inicial;Entradas;Saídas;Saldo Final;Responsável;Status\n';
  lista.forEach(cx => {
    const saldo = cx.valor_inicial + cx.entradas - cx.saidas;
    csv += `${cx.data};${cx.abertura || '-'};${cx.fechamento || '-'};${(cx.valor_inicial || 0).toFixed(2).replace('.', ',')};${cx.entradas.toFixed(2).replace('.', ',')};${cx.saidas.toFixed(2).replace('.', ',')};${saldo.toFixed(2).replace('.', ',')};"${cx.usuario_nome || ''}";${cx.status}\n`;
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="historico-caixa.csv"`);
  res.send('\ufeff' + csv);
});

app.delete('/api/caixa/:id', auth, requirePerm('caixa_fechar'), (req, res) => {
  const id = parseInt(req.params.id);
  const cx = db.prepare('SELECT * FROM caixa WHERE id = ?').get(id);

  if (!cx) return res.status(404).json({ erro: 'Caixa não encontrado' });

  if (cx.status === 'aberto') {
    return res.status(400).json({ erro: 'Não é possível excluir um caixa ABERTO. Feche-o primeiro.' });
  }

  const movs = db.prepare('SELECT COUNT(*) as n FROM movimentacoes WHERE caixa_id = ?').get(id).n;

  const apagar = db.transaction(() => {
    db.prepare('DELETE FROM movimentacoes WHERE caixa_id = ?').run(id);
    db.prepare('DELETE FROM caixa WHERE id = ?').run(id);
  });

  try {
    apagar();
    res.json({
      ok: true,
      removido: {
        id: cx.id,
        data: cx.data,
        valor_inicial: cx.valor_inicial,
        saldo_final: cx.saldo_final,
        movimentacoes_removidas: movs
      }
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao excluir: ' + e.message });
  }
});

// ==========================================
// MOVIMENTAÇÕES
// ==========================================
app.get('/api/movimentacoes/:caixaId', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM movimentacoes WHERE caixa_id = ? ORDER BY id DESC').all(req.params.caixaId));
});
app.post('/api/movimentacoes', auth, (req, res) => {
  const { caixa_id, descricao, valor, tipo, categoria } = req.body;
  const hoje = new Date().toISOString().split('T')[0];
  const hora = new Date().toLocaleTimeString('pt-BR');
  const info = db.prepare(
    'INSERT INTO movimentacoes (caixa_id, data, hora, descricao, valor, tipo, categoria, usuario_id, usuario_nome) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(caixa_id, hoje, hora, descricao, valor, tipo, categoria || 'Essencial', req.usuario.id, req.usuario.nome);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/movimentacoes/:id', auth, requirePerm('caixa_fechar'), (req, res) => {
  const { descricao, valor, tipo, categoria } = req.body;
  db.prepare('UPDATE movimentacoes SET descricao=?, valor=?, tipo=?, categoria=? WHERE id=?')
    .run(descricao, valor, tipo, categoria, req.params.id);
  res.json({ ok: true });
});
app.put('/api/movimentacoes/:id/estornar', auth, requirePerm('caixa_fechar'), (req, res) => {
  const { motivo } = req.body;
  const mov = db.prepare('SELECT * FROM movimentacoes WHERE id = ?').get(req.params.id);
  if (!mov) return res.status(404).json({ erro: 'Não encontrada' });
  if (mov.estornada) return res.status(400).json({ erro: 'Já estornada' });
  const tipoInverso = mov.tipo === 'entrada' ? 'saida' : 'entrada';
  db.prepare(`
    INSERT INTO movimentacoes (caixa_id, data, hora, descricao, valor, tipo, categoria, usuario_id, usuario_nome, estornada, motivo_estorno)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    mov.caixa_id, new Date().toISOString().split('T')[0], new Date().toLocaleTimeString('pt-BR'),
    `ESTORNO: ${mov.descricao}`, mov.valor, tipoInverso, mov.categoria,
    req.usuario.id, req.usuario.nome, motivo || 'Estorno manual'
  );
  db.prepare('UPDATE movimentacoes SET estornada = 1, motivo_estorno = ? WHERE id = ?')
    .run(motivo || 'Estornada pelo admin', req.params.id);
  res.json({ ok: true });
});
app.delete('/api/movimentacoes/:id', auth, requirePerm('caixa_fechar'), (req, res) => {
  db.prepare('DELETE FROM movimentacoes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ==========================================
// ATENDIMENTOS
// ==========================================
app.get('/api/atendimentos', auth, (req, res) => {
  let lista;
  if (temPermissao(req.usuario.cargo, 'atendimentos_todos')) {
    lista = db.prepare('SELECT * FROM atendimentos ORDER BY data DESC, hora DESC, id DESC').all();
  } else {
    lista = db.prepare('SELECT * FROM atendimentos WHERE profissional_id = ? ORDER BY data DESC, hora DESC, id DESC').all(req.usuario.id);
  }
  res.json(lista);
});

app.get('/api/atendimentos/data/:data', auth, (req, res) => {
  let lista;
  if (temPermissao(req.usuario.cargo, 'atendimentos_todos')) {
    lista = db.prepare('SELECT * FROM atendimentos WHERE data = ? ORDER BY hora ASC').all(req.params.data);
  } else {
    lista = db.prepare('SELECT * FROM atendimentos WHERE profissional_id = ? AND data = ? ORDER BY hora ASC').all(req.usuario.id, req.params.data);
  }
  res.json(lista);
});

app.post('/api/atendimentos', auth, (req, res) => {
  const { cliente_id, cliente_nome, data, hora, servicos, valor, valor_previsto, pagamento, status, taxa_percentual } = req.body;
  const horaFinal = hora || new Date().toLocaleTimeString('pt-BR').slice(0, 5);
  const statusFinal = status || 'feito';
  const comissaoPct = CARGOS[req.usuario.cargo]?.comissao || 0;

  const valorComissao = statusFinal === 'feito' ? (valor || 0) : 0;
  const comissao = valorComissao * comissaoPct;

  const info = db.prepare(`
    INSERT INTO atendimentos (cliente_id, cliente_nome, data, hora, servicos, valor, valor_previsto, pagamento, profissional_id, profissional_nome, comissao, status, taxa_percentual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cliente_id, cliente_nome, data, horaFinal, servicos,
    statusFinal === 'feito' ? (valor || 0) : 0,
    valor_previsto || valor || 0,
    pagamento || 'Dinheiro',
    req.usuario.id, req.usuario.nome, comissao,
    statusFinal, taxa_percentual || 30
  );

  if (statusFinal === 'feito' && valor > 0) {
    const hoje = new Date().toISOString().split('T')[0];
    const cx = db.prepare("SELECT * FROM caixa WHERE data = ? AND status = 'aberto'").get(hoje);
    if (cx) {
      db.prepare(`
        INSERT INTO movimentacoes (caixa_id, data, hora, descricao, valor, tipo, categoria, usuario_id, usuario_nome)
        VALUES (?, ?, ?, ?, ?, 'entrada', 'Essencial', ?, ?)
      `).run(cx.id, hoje, horaFinal, `Atendimento: ${cliente_nome}`, valor, req.usuario.id, req.usuario.nome);
    }
  }

  res.json({ id: info.lastInsertRowid, comissao });
});

app.put('/api/atendimentos/:id/compareceu', auth, requirePerm('atendimentos_todos'), (req, res) => {
  const at = db.prepare('SELECT * FROM atendimentos WHERE id = ?').get(req.params.id);
  if (!at) return res.status(404).json({ erro: 'Não encontrado' });
  if (at.status !== 'agendado') return res.status(400).json({ erro: 'Status atual: ' + at.status });

  const { valor, pagamento } = req.body;
  const valorFinal = valor || at.valor_previsto || 0;
  const pag = pagamento || 'Dinheiro';

  const u = db.prepare('SELECT cargo FROM usuarios WHERE id = ?').get(at.profissional_id);
  const pct = CARGOS[u?.cargo]?.comissao || 0;
  const comissao = valorFinal * pct;

  db.prepare(`UPDATE atendimentos SET status='feito', valor=?, pagamento=?, comissao=? WHERE id=?`)
    .run(valorFinal, pag, comissao, req.params.id);

  const hoje = new Date().toISOString().split('T')[0];
  const cx = db.prepare("SELECT * FROM caixa WHERE data = ? AND status = 'aberto'").get(hoje);
  if (cx && valorFinal > 0) {
    db.prepare(`
      INSERT INTO movimentacoes (caixa_id, data, hora, descricao, valor, tipo, categoria, usuario_id, usuario_nome)
      VALUES (?, ?, ?, ?, ?, 'entrada', 'Essencial', ?, ?)
    `).run(cx.id, hoje, new Date().toLocaleTimeString('pt-BR'), `Atendimento: ${at.cliente_nome}`, valorFinal, req.usuario.id, req.usuario.nome);
  }

  res.json({ ok: true, comissao });
});

app.put('/api/atendimentos/:id/faltou', auth, requirePerm('atendimentos_todos'), (req, res) => {
  const at = db.prepare('SELECT * FROM atendimentos WHERE id = ?').get(req.params.id);
  if (!at) return res.status(404).json({ erro: 'Não encontrado' });
  if (at.status !== 'agendado') return res.status(400).json({ erro: 'Status atual: ' + at.status });

  const valorPrev = at.valor_previsto || 0;
  const taxa = valorPrev * ((at.taxa_percentual || 30) / 100);

  db.prepare(`UPDATE atendimentos SET status='faltou', taxa_cobrada=?, valor=? WHERE id=?`)
    .run(taxa, taxa, req.params.id);

  const hoje = new Date().toISOString().split('T')[0];
  const cx = db.prepare("SELECT * FROM caixa WHERE data = ? AND status = 'aberto'").get(hoje);
  if (cx && taxa > 0) {
    db.prepare(`
      INSERT INTO movimentacoes (caixa_id, data, hora, descricao, valor, tipo, categoria, usuario_id, usuario_nome)
      VALUES (?, ?, ?, ?, ?, 'entrada', 'Desejo', ?, ?)
    `).run(cx.id, hoje, new Date().toLocaleTimeString('pt-BR'), `Taxa de falta: ${at.cliente_nome} (${at.taxa_percentual}%)`, taxa, req.usuario.id, req.usuario.nome);
  }

  res.json({ ok: true, taxa_cobrada: taxa });
});

app.put('/api/atendimentos/:id', auth, requirePerm('atendimentos_todos'), (req, res) => {
  const { data, hora, servicos, valor, pagamento } = req.body;
  const at = db.prepare('SELECT * FROM atendimentos WHERE id = ?').get(req.params.id);
  if (!at) return res.status(404).json({ erro: 'Não encontrado' });

  const u = db.prepare('SELECT cargo FROM usuarios WHERE id = ?').get(at.profissional_id);
  const pct = CARGOS[u?.cargo]?.comissao || 0;
  const comissao = at.status === 'feito' ? valor * pct : 0;

  db.prepare(`UPDATE atendimentos SET data=?, hora=?, servicos=?, valor=?, pagamento=?, comissao=? WHERE id=?`)
    .run(data, hora, servicos, valor, pagamento, comissao, req.params.id);
  res.json({ ok: true, comissao });
});

app.delete('/api/atendimentos/:id', auth, requirePerm('atendimentos_todos'), (req, res) => {
  db.prepare('DELETE FROM atendimentos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ==========================================
// RELATÓRIOS
// ==========================================
app.get('/api/relatorios/comissoes', auth, requirePerm('relatorios'), (req, res) => {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(mes)) return res.status(400).json({ erro: 'Formato inválido' });

  const resumo = db.prepare(`
    SELECT
      COUNT(*) as total_atendimentos,
      COALESCE(SUM(valor), 0) as total_faturado,
      COALESCE(SUM(comissao), 0) as total_comissao,
      COALESCE(AVG(valor), 0) as ticket_medio
    FROM atendimentos
    WHERE substr(data, 1, 7) = ? AND status = 'feito'
  `).get(mes);

  const profissionais = db.prepare(`
    SELECT
      profissional_id,
      profissional_nome,
      COUNT(*) as qtd_atendimentos,
      COALESCE(SUM(valor), 0) as total_faturado,
      COALESCE(SUM(comissao), 0) as total_comissao,
      COALESCE(AVG(valor), 0) as ticket_medio
    FROM atendimentos
    WHERE substr(data, 1, 7) = ? AND profissional_id IS NOT NULL AND status = 'feito'
    GROUP BY profissional_id
    ORDER BY total_faturado DESC
  `).all(mes);

  profissionais.forEach(p => {
    const u = db.prepare('SELECT cargo FROM usuarios WHERE id = ?').get(p.profissional_id);
    p.cargo = u?.cargo || 'desconhecido';
    p.percentual = CARGOS[p.cargo]?.comissao || 0;
  });

  const atendimentos = db.prepare(`
    SELECT id, data, hora, cliente_nome, servicos, valor, comissao, profissional_id, profissional_nome, pagamento, status
    FROM atendimentos
    WHERE substr(data, 1, 7) = ? AND status = 'feito'
    ORDER BY data DESC, hora DESC
  `).all(mes);

  const atendimentosPorProf = {};
  atendimentos.forEach(a => {
    if (!atendimentosPorProf[a.profissional_id]) atendimentosPorProf[a.profissional_id] = [];
    atendimentosPorProf[a.profissional_id].push(a);
  });

  res.json({ mes, resumo, profissionais, atendimentosPorProf });
});

app.get('/api/relatorios/comissoes/csv', auth, requirePerm('relatorios'), (req, res) => {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  const dados = db.prepare(`
    SELECT profissional_nome, COUNT(*) as qtd, SUM(valor) as total_faturado, SUM(comissao) as total_comissao
    FROM atendimentos
    WHERE substr(data, 1, 7) = ? AND profissional_id IS NOT NULL AND status = 'feito'
    GROUP BY profissional_id
    ORDER BY total_faturado DESC
  `).all(mes);

  let csv = 'Profissional;Atendimentos;Faturado (R$);Comissão (R$)\n';
  dados.forEach(d => {
    csv += `"${d.profissional_nome}";${d.qtd};${d.total_faturado.toFixed(2).replace('.', ',')};${d.total_comissao.toFixed(2).replace('.', ',')}\n`;
  });
  const totalFat = dados.reduce((s, d) => s + d.total_faturado, 0);
  const totalCom = dados.reduce((s, d) => s + d.total_comissao, 0);
  const totalQtd = dados.reduce((s, d) => s + d.qtd, 0);
  csv += `"TOTAL";${totalQtd};${totalFat.toFixed(2).replace('.', ',')};${totalCom.toFixed(2).replace('.', ',')}\n`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="comissoes-${mes}.csv"`);
  res.send('\ufeff' + csv);
});

// ==========================================
// EDUCAÇÃO FINANCEIRA — v1.2.0
// ==========================================
app.get('/api/educacao/config', auth, (req, res) => {
  let cfg = db.prepare('SELECT * FROM config_financeira ORDER BY id DESC LIMIT 1').get();
  if (!cfg) {
    db.prepare('INSERT INTO config_financeira DEFAULT VALUES').run();
    cfg = db.prepare('SELECT * FROM config_financeira ORDER BY id DESC LIMIT 1').get();
  }
  res.json(cfg);
});

app.put('/api/educacao/config', auth, requirePerm('relatorios'), (req, res) => {
  const { percentual_essencial, percentual_desejo, percentual_investimento, meta_economia_mensal, reserva_atual, reserva_meta } = req.body;
  const soma = (percentual_essencial || 0) + (percentual_desejo || 0) + (percentual_investimento || 0);
  if (Math.abs(soma - 100) > 0.01) return res.status(400).json({ erro: 'Soma precisa ser 100%' });
  db.prepare(`
    UPDATE config_financeira SET
      percentual_essencial = ?, percentual_desejo = ?, percentual_investimento = ?,
      meta_economia_mensal = ?, reserva_atual = ?, reserva_meta = ?,
      atualizado_em = datetime('now','localtime')
    WHERE id = (SELECT MAX(id) FROM config_financeira)
  `).run(percentual_essencial, percentual_desejo, percentual_investimento, meta_economia_mensal || 0, reserva_atual || 0, reserva_meta || 0);
  res.json({ ok: true });
});

app.get('/api/educacao-financeira', auth, (req, res) => {
  try {
    const mes = req.query.mes || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) return res.status(400).json({ erro: 'Mês inválido' });

    let cfg = db.prepare('SELECT * FROM config_financeira ORDER BY id DESC LIMIT 1').get();
    if (!cfg) {
      db.prepare('INSERT INTO config_financeira DEFAULT VALUES').run();
      cfg = db.prepare('SELECT * FROM config_financeira ORDER BY id DESC LIMIT 1').get();
    }

    const movs = db.prepare(`
      SELECT tipo, valor, categoria
      FROM movimentacoes
      WHERE substr(data, 1, 7) = ? AND (estornada IS NULL OR estornada = 0)
    `).all(mes);

    const entradas = movs.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
    const saidasArr = movs.filter(m => m.tipo === 'saida');

    const porCategoria = { Essencial: 0, Desejo: 0, Investimento: 0, Outros: 0 };
    saidasArr.forEach(m => {
      const cat = porCategoria[m.categoria] !== undefined ? m.categoria : 'Outros';
      porCategoria[cat] += m.valor;
    });
    const totalSaidas = Object.values(porCategoria).reduce((s, v) => s + v, 0);

    const metas = {
      Essencial: entradas * (cfg.percentual_essencial / 100),
      Desejo: entradas * (cfg.percentual_desejo / 100),
      Investimento: entradas * (cfg.percentual_investimento / 100)
    };
    const progresso = {};
    const statusCat = {};
    Object.keys(metas).forEach(k => {
      progresso[k] = metas[k] > 0 ? (porCategoria[k] / metas[k]) * 100 : (porCategoria[k] > 0 ? 100 : 0);
      if (progresso[k] === 0) statusCat[k] = 'vazio';
      else if (progresso[k] > 100) statusCat[k] = 'estourado';
      else if (progresso[k] > 80) statusCat[k] = 'atencao';
      else statusCat[k] = 'ok';
    });

    const economizado = entradas - totalSaidas;
    const metaEconomia = cfg.meta_economia_mensal || 0;
    const progressoEconomia = metaEconomia > 0 ? (economizado / metaEconomia) * 100 : 0;

    const [ano, m] = mes.split('-').map(Number);
    const dataAnt = new Date(ano, m - 2, 1);
    const mesAnterior = `${dataAnt.getFullYear()}-${String(dataAnt.getMonth() + 1).padStart(2, '0')}`;

    const movsAnt = db.prepare(`
      SELECT tipo, valor FROM movimentacoes
      WHERE substr(data, 1, 7) = ? AND (estornada IS NULL OR estornada = 0)
    `).all(mesAnterior);

    const entradasAnt = movsAnt.filter(x => x.tipo === 'entrada').reduce((s, x) => s + x.valor, 0);
    const saidasAnt = movsAnt.filter(x => x.tipo === 'saida').reduce((s, x) => s + x.valor, 0);
    const economizadoAnt = entradasAnt - saidasAnt;

    const variacao = {
      entradas: entradasAnt > 0 ? ((entradas - entradasAnt) / entradasAnt) * 100 : null,
      saidas: saidasAnt > 0 ? ((totalSaidas - saidasAnt) / saidasAnt) * 100 : null,
      economia: economizadoAnt !== 0 ? ((economizado - economizadoAnt) / Math.abs(economizadoAnt)) * 100 : null,
      economiaAbs: economizado - economizadoAnt
    };

    const seisMesesAtras = new Date(ano, m - 6, 1);
    const inicioStr = `${seisMesesAtras.getFullYear()}-${String(seisMesesAtras.getMonth() + 1).padStart(2, '0')}-01`;
    const fimStr = mes + '-31';

    const todasMovs = db.prepare(`
      SELECT substr(data, 1, 7) AS mes, tipo, valor
      FROM movimentacoes
      WHERE data >= ? AND data <= ? AND (estornada IS NULL OR estornada = 0)
    `).all(inicioStr, fimStr);

    const evolucao = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ano, m - 1 - i, 1);
      const mesStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const movsMes = todasMovs.filter(x => x.mes === mesStr);
      const e = movsMes.filter(x => x.tipo === 'entrada').reduce((s, x) => s + x.valor, 0);
      const sa = movsMes.filter(x => x.tipo === 'saida').reduce((s, x) => s + x.valor, 0);
      evolucao.push({
        mes: mesStr,
        label: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][d.getMonth()],
        entradas: e, saidas: sa, economia: e - sa
      });
    }

    const ult3 = evolucao.slice(-3);
    const mediaEntradas = ult3.reduce((s, e) => s + e.entradas, 0) / 3;
    const mediaSaidas = ult3.reduce((s, e) => s + e.saidas, 0) / 3;

    const insights = [];
    if (entradas === 0 && totalSaidas === 0) {
      insights.push({ tipo: 'info', texto: '📊 Nenhuma movimentação neste mês ainda.' });
    }
    if (statusCat.Essencial === 'estourado') insights.push({ tipo: 'aviso', texto: `⚠️ Essencial estourou ${progresso.Essencial.toFixed(0)}% da meta.` });
    if (statusCat.Desejo === 'estourado') insights.push({ tipo: 'aviso', texto: `⚠️ Desejo passou ${progresso.Desejo.toFixed(0)}% da meta.` });
    if (statusCat.Investimento === 'estourado' && progresso.Investimento > 150) insights.push({ tipo: 'ok', texto: `🎉 Investiu ${progresso.Investimento.toFixed(0)}% — muito acima da meta!` });
    if (statusCat.Investimento === 'ok' && progresso.Investimento >= 100) insights.push({ tipo: 'ok', texto: '✅ Meta de investimento cumprida!' });
    if (statusCat.Investimento === 'vazio' && entradas > 0) insights.push({ tipo: 'aviso', texto: '💡 Você ainda não investiu nada este mês.' });
    if (totalSaidas > mediaSaidas * 1.2 && mediaSaidas > 0) insights.push({ tipo: 'aviso', texto: `📈 Gastos ${((totalSaidas / mediaSaidas - 1) * 100).toFixed(0)}% acima da média dos últimos 3 meses.` });
    if (totalSaidas < mediaSaidas * 0.8 && mediaSaidas > 0) insights.push({ tipo: 'ok', texto: `📉 Gastos ${((1 - totalSaidas / mediaSaidas) * 100).toFixed(0)}% abaixo da média. Continue assim!` });
    if (economizado < 0) insights.push({ tipo: 'aviso', texto: `🚨 Você gastou ${formatarDinheiro(Math.abs(economizado))} mais do que ganhou.` });
    if (economizado > 0 && metaEconomia > 0 && progressoEconomia >= 100) insights.push({ tipo: 'ok', texto: `🎯 Meta de economia batida (${progressoEconomia.toFixed(0)}%)!` });
    if (porCategoria.Outros > 0) insights.push({ tipo: 'info', texto: `📌 ${formatarDinheiro(porCategoria.Outros)} em "Outros" — categorize melhor.` });
    if (!insights.length) insights.push({ tipo: 'ok', texto: '✅ Tudo em ordem por aqui!' });

    const reservaAtual = cfg.reserva_atual || 0;
    const reservaMeta = cfg.reserva_meta || 0;
    const reservaPct = reservaMeta > 0 ? Math.min((reservaAtual / reservaMeta) * 100, 100) : 0;
    const mesesCobertos = totalSaidas > 0 ? (reservaAtual / totalSaidas) : (mediaSaidas > 0 ? (reservaAtual / mediaSaidas) : 0);

    res.json({
      mes,
      config: cfg,
      totalEntradas: entradas,
      totalSaidas,
      economizado,
      metaEconomia,
      progressoEconomia,
      porCategoria,
      metas,
      progresso,
      statusCat,
      variacao,
      evolucao,
      insights,
      media: { entradas: mediaEntradas, saidas: mediaSaidas },
      reserva: {
        atual: reservaAtual,
        meta: reservaMeta,
        percentual: reservaPct,
        mesesCobertos: parseFloat(mesesCobertos.toFixed(1))
      }
    });
  } catch (e) {
    console.error('Erro educação financeira:', e);
    res.status(500).json({ erro: 'Erro ao calcular: ' + e.message });
  }
});

app.get('/api/educacao-financeira/csv', auth, requirePerm('relatorios'), (req, res) => {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  const movs = db.prepare(`
    SELECT data, hora, descricao, tipo, categoria, valor, usuario_nome
    FROM movimentacoes
    WHERE substr(data, 1, 7) = ? AND (estornada IS NULL OR estornada = 0)
    ORDER BY data, id
  `).all(mes);

  let csv = `Relatório Financeiro — ${mes}\n\n`;
  csv += 'Data;Hora;Descrição;Tipo;Categoria;Valor;Usuário\n';
  let ent = 0, sai = 0;
  movs.forEach(m => {
    if (m.tipo === 'entrada') ent += m.valor; else sai += m.valor;
    csv += `${m.data};${m.hora};"${(m.descricao || '').replace(/"/g, "'")}";${m.tipo};${m.categoria};${m.valor.toFixed(2).replace('.', ',')};${m.usuario_nome || ''}\n`;
  });
  csv += `\nTOTAL ENTRADAS;R$ ${ent.toFixed(2).replace('.', ',')}\n`;
  csv += `TOTAL SAÍDAS;R$ ${sai.toFixed(2).replace('.', ',')}\n`;
  csv += `ECONOMIA;R$ ${(ent - sai).toFixed(2).replace('.', ',')}\n`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="financas-${mes}.csv"`);
  res.send('\ufeff' + csv);
});

function formatarDinheiro(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

// ==========================================
// START
// ==========================================
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando!`);
  console.log(`   📦 Versão:        ${VERSAO.numero}`);
  console.log(`   📱 Painel Admin:  http://localhost:${PORT}`);
  console.log(`   🛍️  Loja Online:   http://localhost:${PORT}/loja\n`);
});