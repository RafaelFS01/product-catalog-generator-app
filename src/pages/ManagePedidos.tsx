import React, { useState, useMemo } from 'react';
import { usePedidos } from '@/contexts/PedidoContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search, ShoppingCart, Edit, Trash2, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import PedidoPDFGenerator from '@/components/pedidos/PedidoPDFGenerator';

const ManagePedidos: React.FC = () => {
  const { pedidos, isLoading, deletePedido, finalizarPedido, cancelarPedido } = usePedidos();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [pedidoToDelete, setPedidoToDelete] = useState<string | null>(null);
  const [pedidoToFinalize, setPedidoToFinalize] = useState<string | null>(null);
  const [pedidoToCancel, setPedidoToCancel] = useState<string | null>(null);
  
  // Filtros aplicados
  const filteredPedidos = useMemo(() => {
    return pedidos.filter(pedido => {
      const matchesSearch = 
        pedido.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.cliente.documento.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'TODOS' || pedido.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pedidos, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EM_ABERTO':
        return 'default';
      case 'FINALIZADO':
        return 'default';
      case 'CANCELADO':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EM_ABERTO':
        return <ShoppingCart size={14} />;
      case 'FINALIZADO':
        return <CheckCircle size={14} />;
      case 'CANCELADO':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'EM_ABERTO':
        return 'Em Aberto';
      case 'FINALIZADO':
        return 'Finalizado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const confirmDelete = async () => {
    if (pedidoToDelete) {
      await deletePedido(pedidoToDelete);
      setPedidoToDelete(null);
    }
  };

  const confirmFinalize = async () => {
    if (pedidoToFinalize) {
      await finalizarPedido(pedidoToFinalize);
      setPedidoToFinalize(null);
    }
  };

  const confirmCancel = async () => {
    if (pedidoToCancel) {
      await cancelarPedido(pedidoToCancel);
      setPedidoToCancel(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
        </div>
        <Button asChild>
          <Link to="/pedidos/criar">
            <Plus size={16} className="mr-2" />
            Novo Pedido
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente ou documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="EM_ABERTO">Em Aberto</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            {(searchTerm || statusFilter !== 'TODOS') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('TODOS');
                }}
              >
                Limpar Filtros
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
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'TODOS' 
                  ? 'Nenhum pedido encontrado para os filtros aplicados.' 
                  : 'Nenhum pedido cadastrado ainda.'
                }
              </p>
              {!searchTerm && statusFilter === 'TODOS' ? (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  asChild
                >
                  <Link to="/pedidos/criar">
                    <Plus size={16} className="mr-2" />
                    Criar Primeiro Pedido
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('TODOS');
                  }}
                  className="mt-2"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPedidos.map(pedido => (
                <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{pedido.numero}</h3>
                          <Badge 
                            variant={getStatusColor(pedido.status)} 
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(pedido.status)}
                            {getStatusText(pedido.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                          <div>
                            <span className="font-medium">Cliente:</span> {pedido.cliente.nome}
                          </div>
                          <div>
                            <span className="font-medium">
                              {pedido.cliente.tipo === 'PF' ? 'CPF:' : 'CNPJ:'}
                            </span> {pedido.cliente.documento}
                          </div>
                          <div>
                            <span className="font-medium">Itens:</span> {pedido.itens.length}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-primary">
                            {formatCurrency(pedido.valorTotal)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(pedido.timestampCriacao)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/pedidos/detalhes/${pedido.id}`}>
                            <Eye size={16} className="mr-1" />
                            Ver
                          </Link>
                        </Button>
                        
                        {/* Botão PDF */}
                        <PedidoPDFGenerator 
                          pedido={pedido} 
                          variant="outline" 
                          size="sm"
                          className="px-2"
                        />
                        
                        {/* Botão Editar - apenas para pedidos em aberto */}
                        {pedido.status === 'EM_ABERTO' && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/pedidos/editar/${pedido.id}`}>
                              <Edit size={16} className="mr-1" />
                              Editar
                            </Link>
                          </Button>
                        )}
                        
                        {/* Botão Finalizar - apenas para pedidos em aberto */}
                        {pedido.status === 'EM_ABERTO' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPedidoToFinalize(pedido.id)}
                            className="text-green-600 hover:text-green-600"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Finalizar
                          </Button>
                        )}
                        
                        {/* Botão Cancelar - apenas para pedidos em aberto */}
                        {pedido.status === 'EM_ABERTO' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPedidoToCancel(pedido.id)}
                            className="text-orange-600 hover:text-orange-600"
                          >
                            <XCircle size={16} className="mr-1" />
                            Cancelar
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPedidoToDelete(pedido.id)}
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

      {/* Dialog de Exclusão */}
      <AlertDialog open={!!pedidoToDelete} onOpenChange={() => setPedidoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
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

      {/* Dialog de Finalização */}
      <AlertDialog open={!!pedidoToFinalize} onOpenChange={() => setPedidoToFinalize(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar este pedido? Pedidos finalizados não podem ser editados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmFinalize}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Cancelamento */}
      <AlertDialog open={!!pedidoToCancel} onOpenChange={() => setPedidoToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagePedidos; 