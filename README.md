# 💅 Unhas Mikaela — Sistema de Gestão

Sistema completo de gestão para salão de unhas, com **painel administrativo**, **loja online** e **aplicativo PWA offline** para iPhone.

![Versão](https://img.shields.io/badge/versão-1.1.0-e91e63)
![Node](https://img.shields.io/badge/node-%3E%3D18-4caf50)
![Licença](https://img.shields.io/badge/licença-MIT-blue)
![Offline](https://img.shields.io/badge/offline-PWA-9c27b0)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Hierarquia de Cargos](#-hierarquia-de-cargos)
- [API REST](#-api-rest)
- [Banco de Dados](#-banco-de-dados)
- [PWA / iPhone](#-pwa--iphone)
- [Backup e Restauração](#-backup-e-restauração)
- [Deploy no Fly.io](#-deploy-no-flyio)
- [Histórico de Versões](#-histórico-de-versões)
- [Solução de Problemas](#-solução-de-problemas)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**Unhas Mikaela** é um sistema profissional de gestão desenvolvido sob medida para salões de manicure e nail design. Ele resolve a dor de cabeça de organizar:

- 💰 O dinheiro que entra e sai todos os dias
- 👤 Quem são seus clientes fiéis
- 📦 O que você tem em estoque (e o que está acabando)
- 📝 Os atendimentos agendados e os já realizados
- 👥 Quem trabalha com você e quanto cada uma deve receber
- 🎓 Como distribuir o lucro de forma inteligente (50/30/20)
- 🛍️ Vender produtos online sem precisar de Instagram

Funciona **100% offline** no celular (PWA) e tem uma **loja online pública** que pode ser compartilhada com clientes.

---

## ✨ Funcionalidades

### 💰 Caixa
- Abertura com valor inicial
- Lançamento de entradas e saídas categorizadas (Essencial / Desejo / Investimento)
- Fechamento com cálculo automático do saldo
- **Histórico completo** de todos os caixas
- **Excluir caixa do histórico** com confirmação dupla (aviso + digitar "EXCLUIR")
- **Estorno** de lançamentos errados (sem apagar o histórico)
- **Exportação em CSV** do dia ou do histórico completo

### 👤 Clientes
- Cadastro com nome, telefone, endereço e observações
- Busca e edição rápida
- Vinculação com atendimentos
- Campo de observações para preferências e alergias

### 📦 Produtos & Estoque
- Cadastro com foto, descrição e categoria
- Cálculo automático de **lucro** e **margem**
- Controle de estoque mínimo e máximo
- **Alertas automáticos** quando o estoque baixa
- Publicação na **loja online** (checkbox)

### 📝 Atendimentos (Agendamentos + Realizados)
- Agendamento para o futuro com **valor previsto**
- **Taxa de falta** configurável (padrão 30%)
- Registro direto de atendimento já feito
- Botões para **✅ Compareceu** / **❌ Faltou**
- Filtros por **data** e por **status**
- Cálculo automático de **comissão** ao confirmar

### 👥 Equipe & Hierarquia
- Cadastro de profissionais com **7 níveis de carreira**
- Sistema de **permissões por cargo**
- Cada profissional vê só os **próprios atendimentos** (exceto cargos maiores)
- Comissões diferentes por nível (10% a 50%)

### 📊 Relatórios de Comissão
- Resumo mensal: faturamento, comissões, atendimentos, ticket médio
- **Ranking** de profissionais com medalhas (🥇🥈🥉)
- Detalhamento por profissional (expandir card — mostra até 10 atendimentos)
- Navegação entre meses
- **Exportação em CSV**

### 🎓 Educação Financeira (Método 50/30/20)
- **Gráfico donut** com distribuição por categoria
- **Barras de progresso** das metas mensais
- **Reserva de emergência** com meta personalizada
- **Gráfico de evolução** dos últimos 6 meses
- **Insights automáticos** (avisos e elogios)
- Metas **100% personalizáveis**

### 🛍️ Loja Online
- Página pública (sem login)
- Filtro por categoria
- Carrinho de compras
- Envio de pedido com nome, telefone e endereço
- **Botão de WhatsApp** direto no pedido
- Baixa automática do estoque

### 💾 Backup
- Exportação de TODOS os dados em `.json`
- Restauração completa
- Apagar tudo com recriação do admin padrão

### 📦 Informações do Sistema
- Versão atual visível no cabeçalho
- Histórico de versões e mudanças
- Informações do banco e modo de operação

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js + Express |
| **Banco** | SQLite (better-sqlite3) |
| **Autenticação** | JWT (cookie httpOnly) + bcryptjs |
| **Upload** | Multer |
| **Frontend** | HTML5 + CSS3 + JavaScript puro (vanilla) |
| **PWA** | Service Worker + Manifest |
| **Ícones** | Emoji Unicode |

**Zero frameworks JS** (sem React, Vue, etc.) — tudo roda direto no navegador, leve e rápido.

---

## 📂 Estrutura de Pastas

```
gerenciador-unhas-mikaela/
│
├── 🔧 Backend
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── banco.db                  (gerado no 1º start)
│
├── 📱 PWA
│   ├── sw.js
│   ├── manifest.json             (você cria)
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── apple-touch-icon.png
│
├── 💅 Painel Admin
│   └── public/
│       └── index.html
│
├── 🛍️ Loja Online
│   └── loja/
│       └── index.html
│
├── 📖 Documentação
│   └── manual/
│       ├── manual.html
│       └── gerar-manual-pdf.html
│
├── 🖼️ Uploads
│   └── uploads/                  (fotos de produtos)
│
├── ☁️ Deploy
│   └── fly.toml                  (config Fly.io)
│
├── 📄 Docs
│   ├── README.md                 (este arquivo)
│   ├── rodar.txt                 (comandos rápidos)
│   └── Arquitetura Profissional.txt
│
└── 🗄️ Legado
    └── legado/
        ├── gerenciador-unhas.html
        └── iphone.html
```

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js 18+** ([baixe aqui](https://nodejs.org/))
- **npm** (vem com o Node)
- Terminal (Prompt de Comando, PowerShell ou Terminal do Mac/Linux)

### Passo a passo

```bash
# 1. Clone ou extraia o projeto
cd gerenciador-unhas-mikaela

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
```

Você verá no terminal:

```
╔════════════════════════════════════════╗
║   💅 Unhas Mikaela                     ║
║   📦 Versão 1.1.0                      ║
║   📅 2026-10-11                        ║
╚════════════════════════════════════════╝

🚀 Servidor rodando!
   📦 Versão:        1.1.0
   📱 Painel Admin:  http://localhost:3000
   🛍️  Loja Online:   http://localhost:3000/loja
```

### Primeiro acesso

Abra no navegador: **http://localhost:3000**

| Campo | Valor |
|---|---|
| 📧 Email | `admin@mikaela.com` |
| 🔑 Senha | `admin123` |

> ⚠️ **TROQUE A SENHA** no primeiro acesso! Vá em **👥 Equipe** → crie seu usuário → desative o admin.

---

## 📱 Como Usar

### No computador (durante testes)
Basta abrir `http://localhost:3000` no navegador.

### No celular (uso real)
Veja a seção [PWA / iPhone](#-pwa--iphone) para instalar como app nativo.

### Rotina diária recomendada

**🌅 Manhã:**
1. Abrir o caixa informando o valor inicial na gaveta

**☀️ Durante o dia:**
2. Lançar cada atendimento (agendado ou já feito)
3. Registrar entradas e saídas do caixa

**🌙 Noite:**
4. Fechar o caixa (sistema calcula o saldo final)
5. Conferir as comissões do dia

**📅 Semanalmente:**
6. Fazer backup dos dados
7. Conferir o estoque (alertas em laranja)

**📆 Mensalmente:**
8. Ver relatório de comissões e ranking
9. Analisar as finanças (50/30/20)

---

## 👥 Hierarquia de Cargos

| Cargo | Nível | Comissão | Permissões |
|---|---|---|---|
| 👑 Administradora | 5 | 0% | Tudo |
| 💅 Manicure Líder | 4 | 10% | Tudo menos usuários |
| 🦶 Podóloga | 4 | 50% | Atendimentos + estoque |
| ⭐ Nail Designer Master | 3 | 40% | Atendimentos + estoque |
| ✨ Manicure Pleno | 2 | 50% | Seus atendimentos |
| 🌱 Manicure Júnior | 1 | 50% | Seus atendimentos |
| 🌿 Auxiliar | 0 | 30% | Seus atendimentos |

**Regras de visibilidade:**
- **Admin, Líder, Master** → veem **todos** os atendimentos de todas as profissionais
- **Podóloga, Pleno, Júnior, Auxiliar** → veem **só os próprios** atendimentos

---

## 🔌 API REST

Todas as rotas (exceto login e loja pública) exigem autenticação via cookie `token`.

### 🔐 Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login (email + senha) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Dados do usuário logado |
| PUT | `/api/auth/senha` | Trocar senha |

### 📦 Versão

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/versao` | Informações da versão (público) |

### 👤 Clientes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/clientes` | Lista todos |
| POST | `/api/clientes` | Cadastra novo |
| PUT | `/api/clientes/:id` | Edita |
| DELETE | `/api/clientes/:id` | Exclui |

### 📦 Produtos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/produtos` | Lista todos |
| POST | `/api/produtos` | Cadastra novo |
| PUT | `/api/produtos/:id` | Edita |
| DELETE | `/api/produtos/:id` | Exclui |
| POST | `/api/upload` | Upload de foto |

### 💰 Caixa

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/caixa/hoje` | Caixa aberto hoje |
| POST | `/api/caixa/abrir` | Abre novo caixa |
| PUT | `/api/caixa/:id/fechar` | Fecha caixa |
| GET | `/api/caixa/historico` | Últimos 60 caixas |
| **DELETE** | **`/api/caixa/:id`** | **Exclui caixa do histórico** |
| GET | `/api/caixa/:id/csv` | Exporta caixa em CSV |
| GET | `/api/caixa/historico/csv` | Exporta histórico em CSV |

### 💳 Movimentações

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/movimentacoes/:caixaId` | Movimentações de um caixa |
| POST | `/api/movimentacoes` | Nova entrada/saída |
| PUT | `/api/movimentacoes/:id` | Edita |
| PUT | `/api/movimentacoes/:id/estornar` | Estorna |
| DELETE | `/api/movimentacoes/:id` | Exclui |

### 📝 Atendimentos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/atendimentos` | Lista (filtrada por cargo) |
| GET | `/api/atendimentos/data/:data` | Filtra por data |
| POST | `/api/atendimentos` | Cria agendamento ou atendimento |
| PUT | `/api/atendimentos/:id/compareceu` | Marca presença |
| PUT | `/api/atendimentos/:id/faltou` | Marca falta |
| PUT | `/api/atendimentos/:id` | Edita |
| DELETE | `/api/atendimentos/:id` | Exclui |

### 📊 Relatórios

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/relatorios/comissoes?mes=YYYY-MM` | Relatório mensal |
| GET | `/api/relatorios/comissoes/csv` | Exporta em CSV |

### 🎓 Educação Financeira

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/educacao/config` | Configurações de metas |
| PUT | `/api/educacao/config` | Atualiza metas |
| GET | `/api/educacao-financeira?mes=YYYY-MM` | Análise do mês |

### 👥 Usuários

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/usuarios` | Lista (só admin) |
| POST | `/api/usuarios` | Cadastra (só admin) |
| PUT | `/api/usuarios/:id` | Edita (só admin) |
| DELETE | `/api/usuarios/:id` | Exclui (só admin) |
| GET | `/api/cargos` | Lista de cargos disponíveis |

### 🛍️ Loja Online

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/loja/produtos` | Produtos publicados (público) |
| POST | `/api/loja/pedido` | Novo pedido (público) |
| GET | `/api/loja/pedidos` | Lista pedidos (admin) |
| PUT | `/api/loja/pedidos/:id` | Atualiza status |

---

## 🗄 Banco de Dados

**SQLite** (arquivo `banco.db` gerado automaticamente na primeira execução).

### Tabelas

- `usuarios` — profissionais com login
- `clientes` — cadastro de clientes
- `produtos` — estoque e produtos da loja
- `caixa` — abertura/fechamento diário
- `movimentacoes` — entradas e saídas
- `atendimentos` — agendamentos e atendimentos feitos
- `pedidos` — pedidos da loja online
- `config_financeira` — metas 50/30/20

### Índices (performance)

```sql
idx_mov_caixa   → movimentacoes(caixa_id)
idx_mov_data    → movimentacoes(data)
idx_caixa_data  → caixa(data)
idx_atend_data  → atendimentos(data)
idx_atend_prof  → atendimentos(profissional_id)
```

### Localização do banco

- **Desenvolvimento**: `./banco.db` (na raiz do projeto)
- **Fly.io (produção)**: `/data/banco.db` (volume persistente)

---

## 📱 PWA / iPhone

### Como instalar no iPhone

1. Abra o **Safari** (não Chrome)
2. Acesse a URL do sistema
3. Toque em **Compartilhar** (quadrado com seta)
4. Role e toque em **"Adicionar à Tela de Início"**
5. Confirme o nome **Unhas Mikaela**

O ícone rosa 💅 aparece na tela inicial. A partir daí, abre em tela cheia como app nativo.

### Como funciona offline

- **Service Worker** (`sw.js`) cacheia os arquivos estáticos (HTML, CSS, ícones)
- Chamadas à API **passam direto** (não são cacheadas — sempre dados frescos)
- Se estiver **offline**, o app mostra a versão em cache mas não consegue gravar

> ⚠️ **IMPORTANTE**: Para funcionar offline de verdade no iPhone, o servidor precisa estar acessível via HTTPS público (Fly.io, Vercel, Render, etc.). Não funciona com `localhost`.

---

## 💾 Backup e Restauração

### Exportar backup

1. Vá na aba **💾 Backup** (ou **👥 Equipe** → Informações do Sistema)
2. Toque em **📥 Baixar Backup (.json)**
3. Arquivo vai para pasta Downloads
4. Envie para **iCloud / Google Drive / WhatsApp**

### Restaurar backup

1. Vá na aba **💾 Backup**
2. Toque em **Escolher arquivo**
3. Selecione o `.json`
4. Confirme — os dados atuais serão substituídos

### Nome sugerido

`backup-mikaela-2026-10-11.json` (com a data)

### Recomendação

**Faça backup toda semana!** Como os dados ficam só no SQLite, se você perder o arquivo `banco.db`, perde tudo.

---

## ☁️ Deploy no Fly.io

O projeto já vem com `fly.toml` configurado para deploy gratuito no Fly.io.

### Pré-requisitos

```bash
# Instalar flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### Primeira vez

```bash
# Criar app (substitua por nome único)
fly launch --no-deploy

# Criar volume persistente para o banco
fly volumes create data --size 1 --region ams

# Deploy
fly deploy
```

### Atualizações futuras

```bash
fly deploy
```

### Variáveis de ambiente

Edite no painel do Fly.io:

| Variável | Valor |
|---|---|
| `JWT_SECRET` | Uma string longa aleatória (troque a padrão!) |
| `PORT` | `8080` |

### Estrutura do `fly.toml`

```toml
app = 'unhas-mika'
primary_region = 'ams'

[build]

[[mounts]]
  source = 'data'
  destination = '/data'
  auto_extend_size_threshold = 80
  auto_extend_size_increment = '1GB'
  auto_extend_size_limit = '10GB'

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']
```

---

## 📜 Histórico de Versões

### v1.1.0 — 2026-10-11
- ✅ **Excluir caixa do histórico** com confirmação dupla
- ✅ **Otimização de performance** na rota do histórico (1 query com JOIN)
- ✅ **Relatório limitado** a 10 atendimentos por profissional
- ✅ **Versionamento visível** em todo o app
- ✅ **Card de informações do sistema** com histórico de versões
- ✅ Correção do bug 404 ao excluir caixa
- ✅ Índices no banco para acelerar buscas

### v1.0.0 — 2026-10-01
- 🎉 Versão inicial
- 💰 Controle de caixa completo
- 👤 Cadastro de clientes
- 📦 Produtos e estoque com foto
- 📝 Atendimentos e agendamentos
- 👥 Equipe com 7 níveis hierárquicos
- 📊 Relatórios de comissão
- 🎓 Educação financeira 50/30/20
- 🛍️ Loja online pública
- 💾 Backup e restauração
- 📱 PWA instalável no iPhone

---

## 🆘 Solução de Problemas

### O servidor não inicia

```bash
# Verifique se a porta 3000 está livre
# Windows:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Ou mude a porta no server.js:
const PORT = 3001;
```

### Erro `Cannot find module`

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro `better-sqlite3` no Windows

Instale o **Visual Studio Build Tools**:

```bash
npm install --global windows-build-tools
# ou baixe em: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### App travando / lento

1. Verifique quantos registros existem:
   - Muitos atendimentos antigos? Arquive-os
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. No iPhone: feche o Safari (arraste para cima) e reabra

### Não aparece o botão "Excluir este dia"

- Só aparece em caixas **fechados** (não abertos)
- Só aparece se você for **Admin** ou **Líder** (nível 3+)

### Perdi todos os dados

- Restaure o backup mais recente
- Se não tiver backup: os dados foram perdidos (por isso é essencial fazer backup!)

---

## 📞 Suporte

| Canal | Contato |
|---|---|
| 👤 Administradora | Mikaela |
| 📧 Email | admin@mikaela.com |
| 💬 WhatsApp | (inserir número) |

---

## 📄 Licença

MIT License — Livre para uso pessoal e comercial.

```
Copyright (c) 2026 Mikaela

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**💅 Unhas Mikaela — Sistema de Gestão Profissional**

Versão 1.1.0 · 2026

Feito com ❤️ para organizar seu salão

</div>