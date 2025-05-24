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
