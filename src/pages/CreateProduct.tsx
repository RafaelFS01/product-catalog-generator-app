
import React from 'react';
import { ProductForm } from '@/components/products/ProductForm';

const CreateProduct: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cadastrar Novo Produto</h1>
      <ProductForm />
    </div>
  );
};

export default CreateProduct;
