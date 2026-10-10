# 💅 Unhas Mikaela — Sistema de Gestão

Sistema completo de gestão para salão de unhas, com **painel administrativo**, **loja online** e **aplicativo PWA offline** para iPhone.

![Versão](https://img.shields.io/badge/versão-1.0.0-e91e63)
![Node](https://img.shields.io/badge/node-%3E%3D18-4caf50)
![Licença](https://img.shields.io/badge/licença-MIT-blue)

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
- Histórico completo de todos os caixas
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
- Detalhamento por profissional (expandir card)
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

### 💾 Backup
- Exportação de TODOS os dados em `.json`
- Restauração completa
- Apagar tudo com recriação do admin padrão

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
└── 🗄️ Legado
    └── legado/
        ├── gerenciador-unhas.html
        └── iphone.html

        