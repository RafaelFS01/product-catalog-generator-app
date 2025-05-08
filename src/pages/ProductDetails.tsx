
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Skeleton className="h-72 w-full" />
              </div>
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-10 w-3/4" />
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Produto não encontrado</h2>
        <p className="text-muted-foreground mb-6">O produto que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/gerenciar">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Gerenciar Produtos
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Detalhes do Produto</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/gerenciar">
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/editar/${product.id}`}>
              <Edit size={16} className="mr-2" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-muted rounded-md overflow-hidden flex items-center justify-center h-full p-4">
                <img 
                  src={product.imagePath} 
                  alt={product.nome} 
                  className="max-w-full max-h-72 object-contain" 
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-semibold">{product.nome}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Peso</p>
                  <p className="font-medium">{product.peso}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantidade por Fardo</p>
                  <p className="font-medium">{product.qtdFardo} unidades</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Preço Unitário</p>
                  <p className="font-medium">{formatCurrency(product.precoUnitario)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Preço do Fardo</p>
                  <p className="font-medium">{formatCurrency(product.precoFardo)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Cadastrado em</p>
                  <p>{formatDate(product.timestampCriacao)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Última atualização</p>
                  <p>{formatDate(product.timestampAtualizacao)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{product.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetails;
