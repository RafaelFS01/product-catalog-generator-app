import React, { useState } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-muted flex items-center justify-center">
        {!product.imagePath || imageError ? (
          // Fallback quando não há imagem ou erro no carregamento
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon size={48} />
            <span className="text-xs mt-2">Sem imagem</span>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon size={48} className="animate-pulse" />
                <span className="text-xs mt-2">Carregando...</span>
              </div>
            )}
            <img
              src={product.imagePath}
              alt={product.nome}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </>
        )}
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg truncate" title={product.nome}>
          {product.nome}
        </h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          {product.marca && (
            <p className="font-medium text-primary">Marca: {product.marca}</p>
          )}
          <p>Peso: {product.peso}</p>
          <p>Preço unitário: {formatCurrency(product.precoUnitario)}</p>
          <p>Preço fardo: {formatCurrency(product.precoFardo)}</p>
          <p>Qtd. por fardo: {product.qtdFardo} unidades</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2 flex">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/detalhes/${product.id}`}>
            <Eye size={16} className="mr-1" />
            Detalhes
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/editar/${product.id}`}>
            <Edit size={16} className="mr-1" />
            Editar
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-destructive hover:text-destructive"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 size={16} className="mr-1" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
};
