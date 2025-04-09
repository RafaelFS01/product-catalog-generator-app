
export interface Product {
  id: string;
  nome: string;
  peso: string;
  precoFardo: number;
  precoUnitario: number;
  qtdFardo: number;
  imagePath: string;
  timestampCriacao: number;
  timestampAtualizacao: number;
}

export interface AuthUser {
  email: string;
  isAuthenticated: boolean;
}

export interface CatalogConfig {
  logoPath: string;
  corFundoPdf: string;
}
