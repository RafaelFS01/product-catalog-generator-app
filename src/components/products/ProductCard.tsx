// src/components/products/ProductCard.tsx
import React from 'react';
import { Product } from '../../contexts/ProductContext';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  const getImageUrl = (path: string | undefined | null): string => {
    if (path?.startsWith('/uploads/')) {
      return `${backendUrl}${path}`;
    }
    return path || '/placeholder.svg';
  };

  const imageUrl = getImageUrl(product.imagePath);

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-muted flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.nome}
          className="max-h-full max-w-full object-contain p-2"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
            (e.target as HTMLImageElement).onerror = null;
          }}
          loading="lazy"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <div className="font-bold text-lg">{product.nome}</div>
        <div className="text-sm text-muted-foreground">{product.descricao}</div>
        <div className="mt-2">Preço: R$ {product.preco}</div>
        <div className="text-xs text-muted-foreground">Peso: {product.peso}</div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2 flex">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/detalhes/${product.id}`}>Detalhes</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/editar/${product.id}`}>Editar</Link>
        </Button>
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(product.id)}
          >
            Excluir
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
