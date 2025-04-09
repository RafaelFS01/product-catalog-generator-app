
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CatalogConfig } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Mocked API base URL - In a real app, this would come from environment variables
const API_BASE_URL = 'https://api.example.com';

interface ProductContextProps {
  products: Product[];
  isLoading: boolean;
  catalogConfig: CatalogConfig;
  fetchProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  createProduct: (product: Omit<Product, 'id' | 'timestampCriacao' | 'timestampAtualizacao'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string>;
  updateCatalogConfig: (config: Partial<CatalogConfig>) => Promise<CatalogConfig>;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

// Mock products data for development
const mockProducts: Product[] = [
  {
    id: '1',
    nome: 'Arroz Branco Premium Tipo 1',
    peso: '5 kg',
    precoFardo: 149.90,
    precoUnitario: 24.98,
    qtdFardo: 6,
    imagePath: '/placeholder.svg',
    timestampCriacao: Date.now(),
    timestampAtualizacao: Date.now()
  },
  {
    id: '2',
    nome: 'Feijão Carioca',
    peso: '1 kg',
    precoFardo: 89.94,
    precoUnitario: 7.49,
    qtdFardo: 12,
    imagePath: '/placeholder.svg',
    timestampCriacao: Date.now() - 86400000,
    timestampAtualizacao: Date.now() - 86400000
  }
];

// Mock catalog config
const mockCatalogConfig: CatalogConfig = {
  logoPath: '/placeholder.svg',
  corFundoPdf: '#ffd210'
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>(mockCatalogConfig);
  const { toast } = useToast();

  const fetchProducts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/api/products`);
      // const data = await response.json();
      // setProducts(data);
      
      // Using mock data for now
      setProducts(mockProducts);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Erro ao buscar produtos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const getProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const createProduct = async (product: Omit<Product, 'id' | 'timestampCriacao' | 'timestampAtualizacao'>): Promise<Product> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/api/products`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(product)
      // });
      // const data = await response.json();
      
      // Using mock data for now
      const newProduct: Product = {
        ...product,
        id: Math.random().toString(36).substring(2, 9),
        timestampCriacao: Date.now(),
        timestampAtualizacao: Date.now()
      };
      
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      toast({
        title: "Produto criado",
        description: `"${newProduct.nome}" foi adicionado com sucesso.`
      });
      
      return newProduct;
    } catch (error) {
      toast({
        title: "Erro ao criar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(product)
      // });
      // const data = await response.json();
      
      // Using mock data for now
      const existingProduct = products.find(p => p.id === id);
      if (!existingProduct) {
        throw new Error('Produto não encontrado');
      }
      
      const updatedProduct: Product = {
        ...existingProduct,
        ...product,
        timestampAtualizacao: Date.now()
      };
      
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === id ? updatedProduct : p)
      );
      
      toast({
        title: "Produto atualizado",
        description: `"${updatedProduct.nome}" foi atualizado com sucesso.`
      });
      
      return updatedProduct;
    } catch (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // await fetch(`${API_BASE_URL}/api/products/${id}`, {
      //   method: 'DELETE'
      // });
      
      // Using mock data for now
      const productToDelete = products.find(p => p.id === id);
      if (!productToDelete) {
        throw new Error('Produto não encontrado');
      }
      
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      
      toast({
        title: "Produto excluído",
        description: `"${productToDelete.nome}" foi removido com sucesso.`
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao excluir produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // In a real app, this would be an API call to upload the image
      // const formData = new FormData();
      // formData.append('productImage', file);
      // const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // return data.filePath;
      
      // Mock image upload - just return placeholder for now
      return '/placeholder.svg';
    } catch (error) {
      toast({
        title: "Erro ao fazer upload da imagem",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCatalogConfig = async (config: Partial<CatalogConfig>): Promise<CatalogConfig> => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/api/configuracoes`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(config)
      // });
      // const data = await response.json();
      
      // Using mock data for now
      const updatedConfig = {
        ...catalogConfig,
        ...config
      };
      
      setCatalogConfig(updatedConfig);
      
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do catálogo foram atualizadas com sucesso."
      });
      
      return updatedConfig;
    } catch (error) {
      toast({
        title: "Erro ao atualizar configurações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{
      products,
      isLoading,
      catalogConfig,
      fetchProducts,
      getProduct,
      createProduct,
      updateProduct,
      deleteProduct,
      uploadImage,
      updateCatalogConfig
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextProps => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
