import React, { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useMarcas } from '@/hooks/useMarcas';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { ProductCard } from '@/components/products/ProductCard';
import { PDFGenerator } from '@/components/pdf/PDFGenerator';
import { Plus, RefreshCw, Search, List, Grid, Filter, X } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  
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

  const hasActiveFilters = searchTerm || selectedMarca;
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Produtos</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <PDFGenerator 
            products={filteredProducts}
            label={filteredProducts.length === products.length 
              ? "Gerar Catálogo" 
              : `PDF (${filteredProducts.length})`
            }
            className="w-full sm:w-auto"
          />
          <Button asChild className="w-full sm:w-auto">
            <Link to="/cadastrar">
              <Plus size={16} className="mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        {/* Área de Filtros Responsiva */}
        <div className="p-4 border-b space-y-4">
          {/* Primeira linha - Busca e Botão de Filtros Mobile */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Botão de Filtros Mobile */}
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
            </Button>
          </div>

          {/* Filtros - Visível sempre no desktop, toggle no mobile */}
          <div className={`${
            showFilters ? 'flex' : 'hidden'
          } sm:flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between`}>
            {/* Lado esquerdo - Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="w-full sm:w-64">
                <Combobox
                  options={marcaFilterOptions}
                  value={selectedMarca}
                  onSelect={setSelectedMarca}
                  placeholder="Filtrar por marca..."
                  searchPlaceholder="Buscar marca..."
                  emptyText="Nenhuma marca encontrada"
                />
              </div>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMarca('');
                  }}
                  className="w-full sm:w-auto"
                >
                  <X size={16} className="mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            {/* Lado direito - Controles de visualização */}
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <div className="flex rounded-md border overflow-hidden">
                <Button
                  variant={isGridView ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsGridView(true)}
                  className="rounded-none border-0"
                >
                  <Grid size={16} />
                  <span className="ml-1 hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={!isGridView ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsGridView(false)}
                  className="rounded-none border-0 border-l"
                >
                  <List size={16} />
                  <span className="ml-1 hidden sm:inline">Lista</span>
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                title="Atualizar"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Área de Conteúdo */}
        <div className="p-3 sm:p-4">
          {isLoading ? (
            isGridView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            )
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto cadastrado ainda.'}
              </p>
              {searchTerm ? (
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm('')}
                  className="mb-2"
                >
                  Limpar busca
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            // Visualização em Lista - Otimizada para Mobile
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    {/* Imagem */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        <img 
                          src={product.imagePath} 
                          alt={product.nome} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                    
                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{product.nome}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{product.peso}</p>
                          {product.marca && (
                            <p className="text-xs text-muted-foreground">{product.marca}</p>
                          )}
                        </div>
                        
                        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              R$ {product.precoUnitario.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">unitário</p>
                          </div>
                          
                          <div className="flex gap-1 ml-auto sm:ml-0">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 px-2"
                            >
                              <Link to={`/detalhes/${product.id}`}>
                                Ver
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 px-2"
                            >
                              <Link to={`/editar/${product.id}`}>
                                Editar
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Confirmação */}
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
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageProducts;
