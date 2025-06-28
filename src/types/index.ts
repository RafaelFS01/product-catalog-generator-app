export interface Product {
  id: string;
  nome: string;
  peso: string;
  precoFardo: number;
  precoUnitario: number;
  qtdFardo: number;
  imagePath: string;
  marca?: string;
  timestampCriacao: number;
  timestampAtualizacao: number;
}

export interface Marca {
  id: string;
  nome: string;
  timestampCriacao: number;
}

export interface AuthUser {
  email: string;
  isAuthenticated: boolean;
}

export interface CatalogConfig {
  logoPath: string;
  corFundoPdf: string;
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: 'PF' | 'PJ'; // Pessoa Física ou Pessoa Jurídica
  documento: string; // CPF ou CNPJ
  telefone: string;
  email: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  timestampCriacao: number;
  timestampAtualizacao: number;
}

export interface ItemPedido {
  produtoId: string;
  nome: string;
  peso: string;
  quantidade: number;
  precoUnitario: number; // Preço fixo no momento do pedido
  precoTotal: number;
  marca?: string;
}

export interface Pedido {
  id: string;
  numero: string; // Número único do pedido (ex: PED-2024-001)
  clienteId: string;
  cliente: {
    nome: string;
    documento: string;
    tipo: 'PF' | 'PJ';
  };
  itens: ItemPedido[];
  valorTotal: number;
  status: 'EM_ABERTO' | 'FINALIZADO' | 'CANCELADO';
  dataLimitePagamento: string; // Data limite para pagamento (ISO string)
  observacoes?: string;
  timestampCriacao: number;
  timestampAtualizacao: number;
}

export interface PagamentoPendente {
  pedido: Pedido;
  diasAtraso: number;
  statusPagamento: 'NO_PRAZO' | 'VENCIDO' | 'VENCENDO_HOJE';
}
