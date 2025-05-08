
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, get, set, update, remove, push, query, orderByChild } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product, CatalogConfig } from '@/types';
import { useToast } from '@/components/ui/use-toast';

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

// Initial catalog config
const initialCatalogConfig: CatalogConfig = {
  logoPath: '/placeholder.svg',
  corFundoPdf: '#ffd210'
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>(initialCatalogConfig);
  const { toast } = useToast();

  // Fetch catalog config on mount
  useEffect(() => {
    const fetchCatalogConfig = async () => {
      try {
        const configRef = ref(db, 'configuracoesCatalogo');
        const snapshot = await get(configRef);
        
        if (snapshot.exists()) {
          setCatalogConfig(snapshot.val());
        } else {
          // If no config exists, initialize it
          await set(configRef, initialCatalogConfig);
        }
      } catch (error) {
        console.error('Error fetching catalog config:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
    };

    fetchCatalogConfig();
  }, [toast]);

  const fetchProducts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const productsRef = ref(db, 'produtos');
      const snapshot = await get(productsRef);
      
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsArray: Product[] = Object.keys(productsData).map(key => ({
          id: key,
          ...productsData[key]
        }));
        
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
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
      const timestamp = Date.now();
      const newProductRef = push(ref(db, 'produtos'));
      
      const newProduct: Omit<Product, 'id'> = {
        ...product,
        timestampCriacao: timestamp,
        timestampAtualizacao: timestamp
      };
      
      await set(newProductRef, newProduct);
      
      const createdProduct: Product = {
        id: newProductRef.key as string,
        ...newProduct
      };
      
      setProducts(prevProducts => [...prevProducts, createdProduct]);
      
      toast({
        title: "Produto criado",
        description: `"${createdProduct.nome}" foi adicionado com sucesso.`
      });
      
      return createdProduct;
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
      const existingProduct = products.find(p => p.id === id);
      if (!existingProduct) {
        throw new Error('Produto não encontrado');
      }
      
      const updatedFields = {
        ...product,
        timestampAtualizacao: Date.now()
      };
      
      const productRef = ref(db, `produtos/${id}`);
      await update(productRef, updatedFields);
      
      const updatedProduct: Product = {
        ...existingProduct,
        ...updatedFields
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
      const productToDelete = products.find(p => p.id === id);
      if (!productToDelete) {
        throw new Error('Produto não encontrado');
      }
      
      const productRef = ref(db, `produtos/${id}`);
      await remove(productRef);
      
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
      // Note: In a real implementation with a backend, we would upload the file to a server
      // For now, we'll just return a placeholder
      // This function would be replaced by actual backend file upload functionality
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
      const updatedConfig = {
        ...catalogConfig,
        ...config
      };
      
      const configRef = ref(db, 'configuracoesCatalogo');
      await update(configRef, config);
      
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
