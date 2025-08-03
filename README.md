# 📚 Product Catalog Generator App

> **Sistema completo de gestão comercial** com catálogo de produtos, clientes, pedidos e geração de documentos profissionais em PDF.

[![Deploy](https://img.shields.io/badge/Deploy-Firebase-orange)](https://catalog-generat.web.app)
[![Status](https://img.shields.io/badge/Status-Produção-brightgreen)]()
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.10.0-yellow)](https://firebase.google.com/)

## 🌐 **Acesso ao Sistema**

**🚀 [Acessar Aplicação](https://catalog-generat.web.app)**

## 📋 **Visão Geral**

Sistema moderno de gestão comercial que evolui de um simples catálogo de produtos para uma **solução completa de vendas**, incluindo:

- 📦 **Gestão de Produtos** - CRUD completo com upload de imagens
- 👥 **Gestão de Clientes** - Cadastro PF/PJ com validação de CPF/CNPJ  
- 🛒 **Sistema de Pedidos** - Criação, controle de status e gestão completa
- 📄 **Documentos Profissionais** - PDF A4 e cupons fiscais 58mm/80mm
- 🎨 **Catálogos Personalizados** - Geração automática com branding

## ✨ **Funcionalidades Principais**

### 📦 **Gerenciamento de Produtos**
- ✅ **CRUD Completo**: Criar, listar, editar, excluir produtos
- ✅ **Upload de Imagens**: Firebase Storage com otimização automática
- ✅ **Sistema de Marcas**: Gerenciamento dinâmico de marcas
- ✅ **Busca Avançada**: Filtros em tempo real por nome, marca, preço
- ✅ **Validações**: Preços, pesos, quantidades com Zod

### 👥 **Gestão de Clientes**
- ✅ **Tipos de Cliente**: Pessoa Física (CPF) e Pessoa Jurídica (CNPJ)
- ✅ **Validação Automática**: CPF/CNPJ, telefone, e-mail, CEP
- ✅ **Formatação Inteligente**: Máscaras automáticas para documentos
- ✅ **Busca Inteligente**: Por nome, documento, cidade, e-mail
- ✅ **Endereço Completo**: Cadastro completo com todos os dados

### 🛒 **Sistema de Pedidos**
- ✅ **Numeração Automática**: Sequencial (PED-2024-001, PED-2024-002...)
- ✅ **Controle de Status**: Em Aberto → Finalizado/Cancelado
- ✅ **Integração Total**: Cliente + Produtos + Cálculos automáticos
- ✅ **Ações Contextuais**: Editar, finalizar, cancelar baseado no status
- ✅ **Busca e Filtros**: Por número, cliente, status, valor

### 📄 **Geração de Documentos**
- ✅ **PDF A4 Profissional**: Layout corporativo com logo e cores
- ✅ **Cupom Fiscal**: 58mm/80mm para impressoras térmicas
- ✅ **Dois Formatos**: Escolha entre documento oficial ou cupom
- ✅ **Prévias**: Visualização antes de gerar o arquivo
- ✅ **Download Automático**: Nomes específicos para cada formato

### 🎨 **Catálogos Personalizados**
- ✅ **Design Profissional**: Layout moderno com gradientes
- ✅ **Logo Personalizado**: Upload e integração automática
- ✅ **Cores Configuráveis**: Personalização da identidade visual
- ✅ **Layout Otimizado**: Informações organizadas em 2 colunas

## 🚀 **Tecnologias Utilizadas**

### **Frontend**
- **React 18.3.1** + **TypeScript** - Interface moderna e tipada
- **Vite** - Build rápido e desenvolvimento otimizado
- **React Router DOM** - Navegação SPA completa
- **Tailwind CSS** - Estilização responsiva e moderna
- **shadcn/ui** - Componentes de UI profissionais (40+ componentes)

### **Estado e Formulários**
- **Context API** - Gerenciamento de estado global
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação robusta de dados
- **TanStack Query** - Cache e sincronização

### **Backend/Database**
- **Firebase Realtime Database** - Dados em tempo real
- **Firebase Storage** - Upload seguro de imagens
- **Firebase Authentication** - Sistema de login
- **Firebase Hosting** - Deploy automático

### **PDF e Funcionalidades**
- **jsPDF** - Geração de documentos PDF
- **html2canvas** - Captura de elementos
- **Lucide React** - Ícones modernos

## 📂 **Estrutura do Projeto**

```
src/
├── components/          # Componentes reutilizáveis
│   ├── auth/           # Autenticação
│   ├── clientes/       # Gestão de clientes
│   ├── pedidos/        # Sistema de pedidos
│   ├── products/       # Componentes de produtos
│   ├── pdf/            # Geração de PDF
│   └── ui/             # 40+ componentes shadcn/ui
├── contexts/           # Estado global
│   ├── AuthContext    # Autenticação
│   ├── ProductContext # Produtos e configurações
│   ├── ClienteContext # Gestão de clientes
│   └── PedidoContext  # Sistema de pedidos
├── pages/              # 15+ páginas da aplicação
├── hooks/              # Hooks customizados
├── types/              # Tipos TypeScript
└── lib/                # Utilitários e Firebase
```

## 🌐 **Páginas Disponíveis**

| Funcionalidade | Páginas | Descrição |
|----------------|---------|-----------|
| **Produtos** | `/`, `/gerenciar`, `/cadastrar`, `/editar/:id` | Catálogo e gestão completa |
| **Clientes** | `/clientes`, `/clientes/cadastrar`, `/clientes/editar/:id` | CRUD de clientes PF/PJ |
| **Pedidos** | `/pedidos`, `/pedidos/criar`, `/pedidos/editar/:id` | Sistema completo de vendas |
| **Sistema** | `/dashboard`, `/configuracoes`, `/login` | Painel e configurações |

## 🏃‍♂️ **Como Executar Localmente**

### **Pré-requisitos**
- Node.js 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm))
- npm ou yarn

### **Instalação**
```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Navegar para o diretório
cd product-catalog-generator-app

# 3. Instalar dependências
npm install

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Abrir no navegador
# http://localhost:5173
```

### **Scripts Disponíveis**
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Visualizar build local
npm run deploy   # Deploy para Firebase
```

## 🔥 **Firebase - Configuração**

O projeto utiliza Firebase para backend completo:

### **Databases**
```json
{
  "produtos": "Catálogo de produtos com imagens",
  "clientes": "Base de clientes PF/PJ", 
  "pedidos": "Sistema de vendas completo",
  "marcas": "Gerenciamento de marcas",
  "configuracoes": "Configurações do sistema"
}
```

### **Storage**
```
produtos/    # Imagens dos produtos
logos/       # Logos personalizados
```

## 🎯 **Casos de Uso**

### **Para Distribuidoras**
- Catálogo digital de produtos
- Gestão de clientes atacado/varejo
- Pedidos com controle de status
- Documentos profissionais

### **Para Vendedores**
- Apresentação de produtos
- Cadastro rápido de clientes
- Criação de pedidos no local
- Impressão de cupons

### **Para Gestores**
- Dashboard com métricas
- Controle completo de operações
- Relatórios em PDF
- Configurações personalizadas

## 📊 **Métricas do Projeto**

- **📁 Arquivos**: 80+ componentes TypeScript
- **📋 Funcionalidades**: 15+ páginas funcionais
- **🎨 Componentes UI**: 40+ elementos reutilizáveis
- **📄 Documentação**: 12 guias especializados (100KB+)
- **🔧 Tipos**: 100% tipado com TypeScript
- **✅ Status**: Produção estável

## 🔐 **Autenticação**

Sistema de login integrado com Firebase Authentication:
- Acesso restrito a usuários autenticados
- Proteção de rotas sensíveis
- Gerenciamento de sessão automático

## 📱 **Responsividade**

Interface totalmente responsiva:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Interface adaptada com navegação otimizada  
- **Mobile**: Design mobile-first com componentes touch-friendly

## 🚀 **Deploy**

**Produção**: [https://catalog-generat.web.app](https://catalog-generat.web.app)

### **Deploy Automático**
```bash
npm run deploy  # Build + Firebase deploy
```

## 📖 **Documentação Completa**

Para documentação técnica detalhada, consulte:
- **`DOCUMENTACAO_COMPLETA_PROJETO.md`** - Documentação principal (46KB)
- **`SISTEMA_CLIENTES_PEDIDOS_IMPLEMENTADO.md`** - Sistema de vendas
- **`IMPLEMENTACAO_PDF_PEDIDOS.md`** - Geração de documentos

## 🤝 **Contribuição**

Este é um projeto profissional em produção. Para alterações:
1. Criar branch feature
2. Implementar mudanças com testes
3. Atualizar documentação relevante
4. Submeter pull request

## 📝 **Licença**

Projeto proprietário - Todos os direitos reservados.

## 🛠️ Correções e Melhorias Recentes

- Corrigido: Seleção de produto no modal de pedido agora funciona corretamente, permitindo escolher o produto e a quantidade antes de adicionar ao pedido.
- Cadastro de cliente: agora apenas o nome é obrigatório, todos os outros campos são opcionais.
- Pedido: agora é possível criar pedido sem cliente, marcando a opção correspondente na tela de pedido.

---

**📅 Última Atualização**: 21/12/2024  
**🏆 Status**: Sistema completo em produção  
**⚡ Performance**: Otimizado para uso real 