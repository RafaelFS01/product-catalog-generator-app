
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '@/components/products/ProductForm';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(id ? getProduct(id) : undefined);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      const productData = getProduct(id);
      setProduct(productData);
      setIsLoading(false);
    }
  }, [id, getProduct]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[500px] w-full max-w-2xl mx-auto" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Produto não encontrado</h2>
        <p className="text-muted-foreground mb-6">O produto que você está tentando editar não existe ou foi removido.</p>
        <Button onClick={() => navigate('/gerenciar')}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar para Gerenciar Produtos
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Produto</h1>
      <ProductForm editingProduct={product} isEdit={true} />
    </div>
  );
};

export default EditProduct;
