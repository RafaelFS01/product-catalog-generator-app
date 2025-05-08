
import React from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-muted">
        <img
          src={product.imagePath}
          alt={product.nome}
          className="w-full h-full object-contain p-2"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg truncate">{product.nome}</h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>{product.peso}</p>
          <p>Preço unitário: {formatCurrency(product.precoUnitario)}</p>
          <p>Preço fardo: {formatCurrency(product.precoFardo)}</p>
          <p>Qtd. por fardo: {product.qtdFardo}</p>
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
          className="flex-1 text-destructive"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 size={16} className="mr-1" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
};
