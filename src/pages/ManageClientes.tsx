import React, { useState, useMemo } from 'react';
import { useClientes } from '@/contexts/ClienteContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search, Users, Edit, Trash2, Eye, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatDate } from '@/lib/utils';

const ManageClientes: React.FC = () => {
  const { clientes, isLoading, deleteCliente } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  
  // Filtros aplicados
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documento.includes(searchTerm) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.endereco.cidade.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [clientes, searchTerm]);
  
  const handleDeleteClick = (id: string) => {
    setClienteToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (clienteToDelete) {
      await deleteCliente(clienteToDelete);
      setClienteToDelete(null);
    }
  };

  const formatDocumento = (documento: string, tipo: 'PF' | 'PJ'): string => {
    if (tipo === 'PF') {
      // Formatar CPF: 000.000.000-00
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Clientes</h1>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/clientes/cadastrar">
            <Plus size={16} className="mr-2" />
            Novo Cliente
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        {/* Área de Filtros Responsiva */}
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, documento, e-mail ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 justify-end">
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="w-full sm:w-auto"
                >
                  <X size={16} className="mr-2" />
                  Limpar Busca
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                title="Atualizar"
                className="px-3"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Área de Conteúdo */}
        <div className="p-3 sm:p-4">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 sm:h-20 w-full" />
              ))}
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Nenhum cliente encontrado para sua busca.' : 'Nenhum cliente cadastrado ainda.'}
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
                  <Link to="/clientes/cadastrar">
                    <Plus size={16} className="mr-2" />
                    Cadastrar Primeiro Cliente
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredClientes.map(cliente => (
                <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-3">
                      {/* Primeira linha - Nome e Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-base sm:text-lg">{cliente.nome}</h3>
                          <Badge variant={cliente.tipo === 'PF' ? 'default' : 'secondary'}>
                            {cliente.tipo === 'PF' ? 'PF' : 'PJ'}
                          </Badge>
                        </div>
                        
                        {/* Botões de Ação - Mobile Stack, Desktop Row */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="flex-1 sm:flex-none"
                            >
                              <Link to={`/clientes/detalhes/${cliente.id}`}>
                                <Eye size={14} className="mr-1" />
                                Ver
                              </Link>
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="flex-1 sm:flex-none"
                            >
                              <Link to={`/clientes/editar/${cliente.id}`}>
                                <Edit size={14} className="mr-1" />
                                Editar
                              </Link>
                            </Button>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(cliente.id)}
                            className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                      
                      {/* Informações principais - Layout responsivo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          <span className="font-medium block">
                            {cliente.tipo === 'PF' ? 'CPF:' : 'CNPJ:'}
                          </span>
                          <span className="block font-mono text-xs sm:text-sm">
                            {formatDocumento(cliente.documento, cliente.tipo)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="font-medium block">E-mail:</span>
                          <span className="block text-xs sm:text-sm truncate" title={cliente.email}>
                            {cliente.email}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="font-medium block">Telefone:</span>
                          <span className="block text-xs sm:text-sm">
                            {cliente.telefone}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="font-medium block">Cidade:</span>
                          <span className="block text-xs sm:text-sm">
                            {cliente.endereco.cidade}/{cliente.endereco.estado}
                          </span>
                        </div>
                      </div>
                      
                      {/* Data de cadastro */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                          Cadastrado em {formatDate(cliente.timestampCriacao)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
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

export default ManageClientes; 