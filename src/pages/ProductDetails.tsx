// src/pages/ProductDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts, Product } from '../contexts/ProductContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '../components/ui/alert-dialog';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

const getImageUrl = (path: string | undefined | null): string => {
  if (path?.startsWith('/uploads/')) {
    return `${backendUrl}${path}`;
  }
  return path || '/placeholder.svg';
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, deleteProduct } = useProducts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!product) {
      // Produto não encontrado, pode redirecionar ou exibir mensagem
    }
  }, [product]);

  const handleDelete = async () => {
    if (product) {
      await deleteProduct(product.id);
      setShowDeleteDialog(false);
      navigate('/gerenciar');
    }
  };

  if (!product) {
    return (
      <div className="text-center py-12">
        <p>Produto não encontrado.</p>
        <Button asChild>
          <Link to="/gerenciar">Voltar</Link>
        </Button>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.imagePath);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="flex-shrink-0 flex items-center justify-center bg-muted rounded w-48 h-48">
            <img
              src={imageUrl}
              alt={product.nome}
              className="max-h-full max-w-full object-contain"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
          </div>
          <CardContent className="flex-1">
            <div className="font-bold text-2xl mb-2">{product.nome}</div>
            <div className="mb-2">{product.descricao}</div>
            <div className="mb-2">Preço: R$ {product.preco}</div>
            <div className="mb-2">Peso: {product.peso}</div>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline">
                <Link to={`/editar/${product.id}`}>Editar</Link>
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Excluir
              </Button>
              <Button asChild variant="outline">
                <Link to="/gerenciar">Voltar</Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <h2>Confirmar Exclusão</h2>
          </AlertDialogHeader>
          <p>Tem certeza que deseja excluir este produto?</p>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetails;
