import React, { useState, useMemo } from 'react';
import { useClientes } from '@/contexts/ClienteContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search, Users, Edit, Trash2, Eye } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
        </div>
        <Button asChild>
          <Link to="/clientes/cadastrar">
            <Plus size={16} className="mr-2" />
            Novo Cliente
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1">
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
          <div className="flex items-center gap-2">
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Limpar Busca
              </Button>
            )}
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
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum cliente encontrado para sua busca.' : 'Nenhum cliente cadastrado ainda.'}
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
                  <Link to="/clientes/cadastrar">
                    <Plus size={16} className="mr-2" />
                    Cadastrar Primeiro Cliente
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClientes.map(cliente => (
                <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                          <Badge variant={cliente.tipo === 'PF' ? 'default' : 'secondary'}>
                            {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">
                              {cliente.tipo === 'PF' ? 'CPF:' : 'CNPJ:'}
                            </span> {formatDocumento(cliente.documento, cliente.tipo)}
                          </div>
                          <div>
                            <span className="font-medium">E-mail:</span> {cliente.email}
                          </div>
                          <div>
                            <span className="font-medium">Telefone:</span> {cliente.telefone}
                          </div>
                          <div>
                            <span className="font-medium">Cidade:</span> {cliente.endereco.cidade}/{cliente.endereco.estado}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Cadastrado em {formatDate(cliente.timestampCriacao)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/clientes/detalhes/${cliente.id}`}>
                            <Eye size={16} className="mr-1" />
                            Ver
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/clientes/editar/${cliente.id}`}>
                            <Edit size={16} className="mr-1" />
                            Editar
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(cliente.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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

export default ManageClientes; 