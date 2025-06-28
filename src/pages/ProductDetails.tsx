import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct, deleteProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(id ? getProduct(id) : undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      const productData = getProduct(id);
      setProduct(productData);
      setIsLoading(false);
    }
  }, [id, getProduct]);
  
  const handleDelete = async () => {
    if (id) {
      const success = await deleteProduct(id);
      if (success) {
        navigate('/gerenciar');
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Skeleton className="h-64 sm:h-72 w-full" />
              </div>
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <Skeleton className="h-8 sm:h-10 w-3/4" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Produto não encontrado</h2>
        <p className="text-muted-foreground mb-6">O produto que você está procurando não existe ou foi removido.</p>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/gerenciar">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Gerenciar Produtos
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Detalhes do Produto</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/gerenciar">
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/editar/${product.id}`}>
              <Edit size={16} className="mr-2" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <div className="bg-muted rounded-md overflow-hidden flex items-center justify-center aspect-square lg:aspect-auto lg:h-72 p-4">
                <img 
                  src={product.imagePath} 
                  alt={product.nome} 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">{product.nome}</h2>
                {product.marca && (
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {product.marca}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Peso</p>
                  <p className="font-medium text-base sm:text-lg">{product.peso}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantidade por Fardo</p>
                  <p className="font-medium text-base sm:text-lg">{product.qtdFardo} unidades</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Preço Unitário</p>
                  <p className="font-semibold text-lg sm:text-xl text-primary">{formatCurrency(product.precoUnitario)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Preço do Fardo</p>
                  <p className="font-semibold text-lg sm:text-xl text-primary">{formatCurrency(product.precoFardo)}</p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-muted-foreground mb-1">Economia por Fardo</p>
                <p className="font-medium">
                  {formatCurrency((product.precoUnitario * product.qtdFardo) - product.precoFardo)} 
                  <span className="text-sm text-muted-foreground ml-2">
                    ({(((product.precoUnitario * product.qtdFardo) - product.precoFardo) / (product.precoUnitario * product.qtdFardo) * 100).toFixed(1)}% desconto)
                  </span>
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">{formatDate(product.timestampCriacao)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Última atualização</p>
                  <p className="font-medium">{formatDate(product.timestampAtualizacao)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{product.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetails;
