# Documentação Técnica Detalhada do Projeto

Este documento detalha as funcionalidades e aspectos técnicos das páginas e componentes principais do projeto Gerador de Catálogos.

## Sumário

1.  [Estrutura Geral da Aplicação](#estrutura-geral-da-aplicação)
2.  [Páginas da Aplicação (`src/pages/`)](#páginas-da-aplicação-srcpages)
    *   [Login (`Login.tsx`)](#login-logintsx)
    *   [Index (`Index.tsx`) - Painel Principal](#index-indextsx---painel-principal)
    *   [ManageProducts (`ManageProducts.tsx`) - Gerenciar Produtos](#manageproducts-manageproductstsx---gerenciar-produtos)
    *   [ProductDetails (`ProductDetails.tsx`) - Detalhes do Produto](#productdetails-productdetailstsx---detalhes-do-produto)
    *   [CreateProduct (`CreateProduct.tsx`) - Cadastrar Produto](#createproduct-createproducttsx---cadastrar-produto)
    *   [EditProduct (`EditProduct.tsx`) - Editar Produto](#editproduct-editproducttsx---editar-produto)
    *   [Settings (`Settings.tsx`) - Configurações](#settings-settingstsx---configurações)
    *   [Dashboard (`Dashboard.tsx`)](#dashboard-dashboardtsx)
    *   [NotFound (`NotFound.tsx`) - Página Não Encontrada](#notfound-notfoundtsx---página-não-encontrada)
3.  [Componentes Reutilizáveis Principais (`src/components/`)](#componentes-reutilizáveis-principais-srccomponents)
    *   [ProductForm (`ProductForm.tsx`) - Formulário de Produto](#productform-productformtsx---formulário-de-produto)
    *   [ProductCard (`ProductCard.tsx`) - Card de Produto](#productcard-productcardtsx---card-de-produto)
    *   [PDFGenerator (`PDFGenerator.tsx`) - Gerador de Catálogo PDF](#pdfgenerator-pdfgeneratortsx---gerador-de-catálogo-pdf)

## Estrutura Geral da Aplicação

O ponto de entrada da aplicação é o arquivo `public/index.html`, que carrega `src/main.tsx`. Este, por sua vez, renderiza o componente principal `src/App.tsx`.

**`src/App.tsx`:**

*   **Propósito:** Define a estrutura de roteamento, provedores de contexto e layout principal da aplicação.
*   **Roteamento:** Utiliza `react-router-dom` para gerenciar as rotas.
    *   `/login`: Página de Login.
    *   Rotas protegidas (`RequireAuth`) sob o `MainLayout`:
        *   `/` (index): `Index.tsx`
        *   `/gerenciar`: `ManageProducts.tsx`
        *   `/detalhes/:id`: `ProductDetails.tsx`
        *   `/cadastrar`: `CreateProduct.tsx`
        *   `/editar/:id`: `EditProduct.tsx`
        *   `/configuracoes`: `Settings.tsx`
        *   `/dashboard`: `Dashboard.tsx`
    *   `*` (catch-all): `NotFound.tsx`
*   **Contextos:**
    *   `QueryClientProvider` (TanStack Query): Para gerenciamento de estado de requisições assíncronas.
    *   `TooltipProvider`: Para habilitar tooltips globalmente (componente da ShadCN/UI).
    *   `AuthProvider`: Gerencia o estado de autenticação do usuário.
    *   `ProductProvider`: Gerencia o estado dos produtos e configurações do catálogo.
*   **UI:**
    *   `Toaster` e `Sonner`: Para exibir notificações (toast messages).

## Páginas da Aplicação (`src/pages/`)

### Login (`Login.tsx`)

*   **Rota:** `/login`
*   **Propósito:** Autenticação de usuários (login e cadastro).
*   **Funcionalidades:**
    *   Interface com abas para Login e Cadastro.
    *   Validação de formulário com `react-hook-form` e `zod`.
    *   **Login:** Utiliza a função `login` do `AuthContext`.
    *   **Cadastro:** Utiliza `createUserWithEmailAndPassword` do Firebase Auth.
    *   Redireciona para `/gerenciar` ou página de origem após login.
    *   Redireciona se o usuário já estiver autenticado.
*   **Componentes UI (ShadCN/UI):** `Button`, `Input`, `Card`, `Form`, `Tabs`, `useToast`.
*   **Ícones:** `Package` (`lucide-react`).

### Index (`Index.tsx`) - Painel Principal

*   **Rota:** `/` (requer autenticação)
*   **Propósito:** Página inicial após o login, exibindo um resumo de informações e acesso rápido.
*   **Funcionalidades:**
    *   Cards de resumo (KPIs): Total de Produtos, Valor Total (fardos), Preço Médio (unitário).
    *   Gráfico "Top 5 Produtos por Preço" (fardo) usando `recharts`.
    *   Card de "Acesso Rápido" com links para: Gerenciar Produtos, Cadastrar Produto, Configurações, Dashboard.
*   **Contexto:** `useProducts` para dados dos produtos.
*   **Componentes UI:** `Card`, `Button`.
*   **Ícones (`lucide-react`):** `LayoutDashboard`, `Package`, `DollarSign`, `Inbox`, `Settings`.
*   **Utilitários:** `formatCurrency`.

### ManageProducts (`ManageProducts.tsx`) - Gerenciar Produtos

*   **Rota:** `/gerenciar` (requer autenticação)
*   **Propósito:** Listar, buscar, filtrar, excluir produtos e iniciar geração de catálogo.
*   **Funcionalidades:**
    *   Link para "Novo Produto" (`/cadastrar`).
    *   Componente `PDFGenerator`.
    *   Busca de produtos por nome.
    *   Alternar visualização: Grade (`ProductCard`) ou Lista (tabela).
    *   Botão para recarregar a página.
    *   Exibição de estado de carregamento (`Skeleton`) e mensagens para "nenhum produto".
    *   **Exclusão:** Confirmação com `AlertDialog` antes de chamar `deleteProduct` do contexto.
*   **Contexto:** `useProducts` para dados e ações dos produtos.
*   **Componentes UI:** `Button`, `ProductCard`, `PDFGenerator`, `Input`, `AlertDialog`, `Skeleton`.
*   **Ícones (`lucide-react`):** `Plus`, `RefreshCw`, `Search`, `List`, `Grid`.

### ProductDetails (`ProductDetails.tsx`) - Detalhes do Produto

*   **Rota:** `/detalhes/:id` (requer autenticação)
*   **Propósito:** Exibir informações detalhadas de um produto específico.
*   **Funcionalidades:**
    *   Busca produto pelo `id` da URL no `ProductContext`.
    *   Exibe mensagem de "Produto não encontrado" se aplicável.
    *   Mostra imagem do produto (com fallback e tratamento de URL de backend `VITE_BACKEND_URL`), nome, descrição, preço (`product.preco`), peso.
    *   Ações: "Editar" (link para `/editar/:id`), "Excluir" (com `AlertDialog`), "Voltar" (para `/gerenciar`).
*   **Contexto:** `useProducts`.
*   **Componentes UI:** `Card`, `Button`, `AlertDialog`.
*   **Variáveis de Ambiente:** `VITE_BACKEND_URL`.

### CreateProduct (`CreateProduct.tsx`) - Cadastrar Produto

*   **Rota:** `/cadastrar` (requer autenticação)
*   **Propósito:** Interface para adicionar um novo produto.
*   **Funcionalidades:**
    *   Exibe título "Cadastrar Novo Produto".
    *   Renderiza o componente `ProductForm` para a lógica de formulário.
*   **Componentes Delegados:** A maior parte da lógica está no `ProductForm.tsx`.

### EditProduct (`EditProduct.tsx`) - Editar Produto

*   **Rota:** `/editar/:id` (requer autenticação)
*   **Propósito:** Interface para modificar um produto existente.
*   **Funcionalidades:**
    *   Busca produto pelo `id` da URL no `ProductContext`.
    *   Exibe estado de carregamento (`Skeleton`) ou mensagem de "Produto não encontrado".
    *   Exibe título "Editar Produto".
    *   Renderiza `ProductForm` com `editingProduct` e `isEdit={true}`.
*   **Contexto:** `useProducts`.
*   **Componentes UI:** `Button`, `Skeleton`.
*   **Ícones (`lucide-react`):** `ArrowLeft`.
*   **Componentes Delegados:** `ProductForm.tsx`.

### Settings (`Settings.tsx`) - Configurações

*   **Rota:** `/configuracoes` (requer autenticação)
*   **Propósito:** Personalizar a aparência do catálogo PDF.
*   **Funcionalidades:**
    *   **Logo da Empresa:** Upload (JPG, PNG), preview.
    *   **Cor de Fundo do PDF:** Seleção via `input type="color"`, preview da cor.
    *   **Salvar:**
        *   Se novo logo, faz upload para `/api/upload-image` (usando `fetch` e `FormData`).
        *   Chama `updateCatalogConfig` do `ProductContext`.
*   **Contexto:** `useProducts` para `catalogConfig` e `updateCatalogConfig`.
*   **Componentes UI:** `Card`, `Input`, `Button`, `Label`.
*   **Ícones (`lucide-react`):** `Upload`, `Save`.
*   **API:** `/api/upload-image` (endpoint de backend esperado).

### Dashboard (`Dashboard.tsx`)

*   **Rota:** `/dashboard` (requer autenticação)
*   **Propósito:** Apresentar dados agregados e visualizações sobre os produtos.
*   **Funcionalidades:**
    *   **KPIs:** Total de Produtos, Preço Unitário Médio, Preço Fardo Médio, Valor Total Estimado (baseado em `precoFardo * 10`).
    *   **Gráficos (`recharts`):**
        *   Distribuição de Preço Unitário (barras).
        *   Top 5 Produtos por Preço de Fardo (barras horizontais).
        *   Distribuição por Peso (pizza).
*   **Contexto:** `useProducts`.
*   **Componentes UI:** `Card`.
*   **Ícones (`lucide-react`):** `Package`, `DollarSign`, `ShoppingBag`, `Activity`.
*   **Utilitários:** `formatCurrency`.

### NotFound (`NotFound.tsx`) - Página Não Encontrada

*   **Rota:** `*` (qualquer rota não correspondida)
*   **Propósito:** Exibir uma página de erro 404 amigável.
*   **Funcionalidades:**
    *   Mensagem "404 - Oops! Page not found".
    *   Link para "Return to Home" (`/`).
    *   Registra um erro no console com o `pathname` da rota não encontrada.
*   **Hooks:** `useLocation`, `useEffect`.

## Componentes Reutilizáveis Principais (`src/components/`)

### ProductForm (`ProductForm.tsx`) - Formulário de Produto

*   **Localização:** `src/components/products/ProductForm.tsx`
*   **Propósito:** Formulário para criar e editar produtos.
*   **Props:** `editingProduct?` (tipo `Product`), `isEdit?` (booleano).
*   **Funcionalidades:**
    *   Validação com `react-hook-form` e `zod` (`productSchema`).
    *   Campos: Nome, Peso, Preço Unitário, Preço Fardo, Qtd. Fardo, Imagem do Produto.
    *   Upload de imagem com preview, usando `FileReader` e `input type="file"` oculto.
    *   **Submissão:**
        *   Upload de imagem para `/api/upload-image` se uma nova imagem for fornecida.
        *   Chama `createProduct` ou `updateProduct` do `ProductContext`.
        *   Navega para os detalhes do produto após salvar.
    *   Botões "Voltar" e "Salvar Produto".
*   **Contexto:** `useProducts`.
*   **Componentes UI:** `Button`, `Input`, `Card`, `Form`.
*   **Ícones (`lucide-react`):** `Upload`, `Save`, `ArrowLeft`.
*   **API:** `/api/upload-image`.

### ProductCard (`ProductCard.tsx`) - Card de Produto

*   **Localização:** `src/components/products/ProductCard.tsx`
*   **Propósito:** Exibir informações de um produto em formato de card.
*   **Props:** `product` (tipo `Product`), `onDelete?` (função `(id: string) => void`).
*   **Funcionalidades:**
    *   Exibe imagem do produto (com fallback, `loading="lazy"`, e tratamento de URL de backend `VITE_BACKEND_URL`), nome, descrição, preço (`product.preco`), peso.
    *   Ações: "Detalhes", "Editar" (links), "Excluir" (se `onDelete` fornecido).
*   **Componentes UI:** `Card`, `Button`.
*   **Variáveis de Ambiente:** `VITE_BACKEND_URL`.

### PDFGenerator (`PDFGenerator.tsx`) - Gerador de Catálogo PDF

*   **Localização:** `src/components/pdf/PDFGenerator.tsx`
*   **Propósito:** Gerar um catálogo de produtos em PDF com opções de personalização e preview.
*   **Bibliotecas:** `jsPDF`, `html2canvas`, `sonner`.
*   **Funcionalidades:**
    *   Botões "Gerar Catálogo PDF" e "Visualizar Catálogo" (abre modal de preview).
    *   **Geração de PDF:**
        *   Capa com cor de fundo (`catalogConfig.corFundoPdf`), logo (se configurado), título e data.
        *   **Carregamento de Imagens (Logo e Produtos):**
            *   Usa `html2canvas` para renderizar imagens em canvas antes de adicionar ao PDF.
            *   Requer que as imagens sejam temporariamente adicionadas ao DOM.
            *   Tratamento de CORS (`crossOrigin="anonymous"`, `useCORS: true`).
            *   Construção de URL com `VITE_BACKEND_URL` para imagens do backend.
            *   Logs detalhados para depuração de carregamento de imagem.
        *   Layout de produtos: 2 colunas, 3 linhas por página (6 produtos/página).
        *   Informações do produto: nome truncado, peso, preços, qtd. fardo, imagem.
        *   Cabeçalho e rodapé com número de página e data em todas as páginas.
        *   Salva como `catalogo-produtos.pdf`.
    *   **Preview (Modal):** Exibe uma versão HTML simplificada do catálogo.
*   **Contexto:** `useProducts` para `products` e `catalogConfig`.
*   **Componentes UI:** `Button`, `Dialog`.
*   **Ícones (`lucide-react`):** `FileDown`, `FileText`, `Download`.
*   **Utilitários:** `formatCurrency`, `hexToRgb` (interno), `truncateText` (interno).
*   **Desafios Notáveis:** Lógica complexa de layout de PDF, carregamento e renderização de imagens cross-origin no canvas/PDF. 