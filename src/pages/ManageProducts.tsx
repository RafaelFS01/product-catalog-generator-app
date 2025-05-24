import React, { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useMarcas } from '@/hooks/useMarcas';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { ProductCard } from '@/components/products/ProductCard';
import { PDFGenerator } from '@/components/pdf/PDFGenerator';
import { Plus, RefreshCw, Search, List, Grid, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const ManageProducts: React.FC = () => {
  const { products, isLoading, deleteProduct } = useProducts();
  const { marcas } = useMarcas();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [isGridView, setIsGridView] = useState(true);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Preparar opções de marcas para o filtro
  const marcaFilterOptions = useMemo(() => {
    const options = [
      { value: '', label: 'Todos os produtos' }
    ];
    
    marcas.forEach(marca => {
      options.push({
        value: marca.nome,
        label: marca.nome
      });
    });
    
    return options;
  }, [marcas]);
  
  // Filtros aplicados
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMarca = !selectedMarca || product.marca === selectedMarca;
      
      return matchesSearch && matchesMarca;
    });
  }, [products, searchTerm, selectedMarca]);
  
  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        <div className="flex items-center gap-2">
          <PDFGenerator 
            products={filteredProducts}
            label={filteredProducts.length === products.length 
              ? "Gerar Catálogo PDF" 
              : `Gerar PDF (${filteredProducts.length} produtos)`
            }
          />
          <Button asChild>
            <Link to="/cadastrar">
              <Plus size={16} className="mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="min-w-[200px]">
              <Combobox
                options={marcaFilterOptions}
                value={selectedMarca}
                onSelect={setSelectedMarca}
                placeholder="Filtrar por marca..."
                searchPlaceholder="Buscar marca..."
                emptyText="Nenhuma marca encontrada"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(searchTerm || selectedMarca) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMarca('');
                }}
              >
                <Filter size={16} className="mr-2" />
                Limpar Filtros
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsGridView(true)}
              className={isGridView ? 'bg-muted' : ''}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsGridView(false)}
              className={!isGridView ? 'bg-muted' : ''}
            >
              <List size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
              title="Atualizar"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            isGridView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            )
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto cadastrado ainda.'}
              </p>
              {searchTerm ? (
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Limpar busca
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  asChild
                >
                  <Link to="/cadastrar">
                    <Plus size={16} className="mr-2" />
                    Cadastrar Primeiro Produto
                  </Link>
                </Button>
              )}
            </div>
          ) : isGridView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDelete={handleDeleteClick} 
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Marca</th>
                    <th className="text-left py-3 px-4">Peso</th>
                    <th className="text-right py-3 px-4">Preço Unit.</th>
                    <th className="text-right py-3 px-4">Preço Fardo</th>
                    <th className="text-center py-3 px-4">Qtd. Fardo</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{product.nome}</td>
                      <td className="py-3 px-4">
                        {product.marca ? (
                          <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                            {product.marca}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Sem marca</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{product.peso}</td>
                      <td className="py-3 px-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.precoUnitario)}</td>
                      <td className="py-3 px-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.precoFardo)}</td>
                      <td className="py-3 px-4 text-center">{product.qtdFardo}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm"
                          >
                            <Link to={`/detalhes/${product.id}`}>Detalhes</Link>
                          </Button>
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm"
                          >
                            <Link to={`/editar/${product.id}`}>Editar</Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteClick(product.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageProducts;
