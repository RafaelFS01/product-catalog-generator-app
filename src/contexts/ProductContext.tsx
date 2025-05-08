// src/contexts/ProductContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, push, set, get, child, update, remove } from 'firebase/database';

import { Product } from '../types';

export type ProductFormInput = {
  nome: string;
  peso: string;
  precoFardo: number;
  precoUnitario: number;
  qtdFardo: number;
  imagePath: string;
};


export interface CatalogConfig {
  logoUrl?: string;
  [key: string]: any;
}

interface ProductContextProps {
  products: Product[];
  fetchProducts: () => Promise<void>;
  createProduct: (product: ProductFormInput) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  catalogConfig: CatalogConfig;
  fetchCatalogConfig: () => Promise<void>;
  updateCatalogConfig: (config: Partial<CatalogConfig>) => Promise<CatalogConfig>;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>({});

  // Busca produtos em tempo real
  const fetchProducts = async () => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray: Product[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
    });
  };

  // Busca config do catálogo
  const fetchCatalogConfig = async () => {
    const configRef = ref(db, 'catalogConfig');
    const snapshot = await get(configRef);
    setCatalogConfig(snapshot.val() || {});
  };

  // Cria produto
  type ProductFormInput = {
    nome: string;
    peso: string;
    precoFardo: number;
    precoUnitario: number;
    qtdFardo: number;
    imagePath: string;
  };
  
  const createProduct = async (product: ProductFormInput): Promise<Product> => {
    const productsRef = ref(db, 'products');
    const newProductRef = push(productsRef);
    const timestamp = Date.now();
    const productData = {
      ...product,
      timestampCriacao: timestamp,
      timestampAtualizacao: timestamp,
    };
    await set(newProductRef, productData);
    return {
      id: newProductRef.key as string,
      ...productData
    };
  };

  // Atualiza produto
  const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    const productRef = ref(db, `products/${id}`);
    const timestamp = Date.now();
    await update(productRef, { ...product, timestampAtualizacao: timestamp });
    const snapshot = await get(productRef);
    return { id, ...snapshot.val() };
  };

  // Deleta produto
  const deleteProduct = async (id: string): Promise<boolean> => {
    const productRef = ref(db, `products/${id}`);
    await remove(productRef);
    return true;
  };

  // Atualiza config do catálogo
  const updateCatalogConfig = async (config: Partial<CatalogConfig>): Promise<CatalogConfig> => {
    const configRef = ref(db, 'catalogConfig');
    // Remove propriedades undefined
    const filteredConfig: Partial<CatalogConfig> = {};
    Object.keys(config).forEach((key) => {
      const value = (config as any)[key];
      if (value !== undefined) {
        (filteredConfig as any)[key] = value;
      }
    });
    await update(configRef, filteredConfig);
    const snapshot = await get(configRef);
    setCatalogConfig(snapshot.val() || {});
    return snapshot.val() || {};
  };

  useEffect(() => {
    fetchProducts();
    fetchCatalogConfig();
    // eslint-disable-next-line
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        catalogConfig,
        fetchCatalogConfig,
        updateCatalogConfig
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextProps => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts deve ser usado dentro de um ProductProvider');
  }
  return context;
};
