import React, { useState, useMemo } from 'react';
import { usePedidos } from '@/contexts/PedidoContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { 
  Plus, 
  RefreshCw, 
  Search, 
  ShoppingCart, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Filter,
  X
} from 'lucide-react';
import PedidoPDFGenerator from '@/components/pedidos/PedidoPDFGenerator';
import { formatDate } from '@/lib/utils';

const ManagePedidos: React.FC = () => {
  const { pedidos, isLoading, deletePedido, finalizarPedido, cancelarPedido } = usePedidos();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [pedidoToDelete, setPedidoToDelete] = useState<string | null>(null);
  const [pedidoToFinalize, setPedidoToFinalize] = useState<string | null>(null);
  const [pedidoToCancel, setPedidoToCancel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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
        return 'secondary';
      case 'CANCELADO':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EM_ABERTO':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
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

  const hasActiveFilters = searchTerm || statusFilter !== 'TODOS';
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Pedidos</h1>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/pedidos/criar">
            <Plus size={16} className="mr-2" />
            Novo Pedido
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        {/* Área de Filtros Responsiva */}
        <div className="p-4 border-b space-y-4">
          {/* Primeira linha - Busca e Botão de Filtros Mobile */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente ou documento..."
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
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('TODOS');
                  }}
                  className="w-full sm:w-auto"
                >
                  <X size={16} className="mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            {/* Lado direito - Controles */}
            <div className="flex items-center gap-2 justify-center sm:justify-end">
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
                <Skeleton key={i} className="h-28 sm:h-24 w-full" />
              ))}
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'TODOS' 
                  ? 'Nenhum pedido encontrado para os filtros aplicados.' 
                  : 'Nenhum pedido cadastrado ainda.'
                }
              </p>
              {!searchTerm && statusFilter === 'TODOS' ? (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
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
                  className="mb-2"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredPedidos.map(pedido => (
                <Card key={pedido.id} className="hover:shadow-md transition-shadow border rounded-lg bg-white sm:bg-card">
                  <CardContent className="p-2 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Header do Card - Número, Status e Valor */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold text-base sm:text-lg text-primary">{pedido.numero}</h3>
                          <Badge 
                            variant={getStatusColor(pedido.status)} 
                            className="flex items-center gap-1 px-2 py-0.5 text-xs sm:text-sm"
                          >
                            {getStatusIcon(pedido.status)}
                            <span className="hidden sm:inline">{getStatusText(pedido.status)}</span>
                            <span className="sm:hidden">{getStatusText(pedido.status).split(' ')[0]}</span>
                          </Badge>
                        </div>
                        <div className="text-base sm:text-lg font-bold text-blue-600 sm:text-primary">
                          {formatCurrency(pedido.valorTotal)}
                        </div>
                      </div>
                      {/* Informações do Cliente */}
                      <div className="flex flex-col gap-1 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Cliente: </span>
                          <span className="font-semibold text-gray-900 truncate">{pedido.cliente.nome}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">{pedido.cliente.tipo === 'PF' ? 'CPF:' : 'CNPJ:'} </span>
                          <span className="font-mono text-xs sm:text-sm">{pedido.cliente.documento}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Itens: </span>
                          <span>{pedido.itens.length} produto{pedido.itens.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Vencimento: </span>
                          <span className={
                            pedido.dataLimitePagamento && 
                            new Date(pedido.dataLimitePagamento) < new Date() && 
                            pedido.status === 'EM_ABERTO'
                              ? 'text-destructive font-medium' 
                              : ''
                          }>
                            {pedido.dataLimitePagamento ? 
                              new Date(pedido.dataLimitePagamento).toLocaleDateString('pt-BR') : 
                              'Não definido'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Criado em: </span>
                          <span className="text-xs sm:text-sm">{formatDate(pedido.timestampCriacao)}</span>
                        </div>
                      </div>
                      {/* Botões de Ação - 100% largura no mobile, empilhados */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex flex-col gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link to={`/pedidos/detalhes/${pedido.id}`}>
                              <Eye size={14} className="mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <div className="w-full">
                            <PedidoPDFGenerator 
                              pedido={pedido} 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                            />
                          </div>
                          {pedido.status === 'EM_ABERTO' && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="w-full"
                            >
                              <Link to={`/pedidos/editar/${pedido.id}`}>
                                <Edit size={14} className="mr-1" />
                                <span className="hidden sm:inline">Editar</span>
                                <span className="sm:hidden">Edit</span>
                              </Link>
                            </Button>
                          )}
                          {pedido.status === 'EM_ABERTO' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setPedidoToFinalize(pedido.id)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              <span className="hidden sm:inline">Finalizar</span>
                              <span className="sm:hidden">✓</span>
                            </Button>
                          )}
                          {pedido.status === 'EM_ABERTO' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPedidoToCancel(pedido.id)}
                              className="w-full text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40"
                            >
                              <XCircle size={14} className="mr-1" />
                              <span className="hidden sm:inline">Cancelar</span>
                              <span className="sm:hidden">✕</span>
                            </Button>
                          )}
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

      {/* Dialog de Exclusão */}
      <AlertDialog open={!!pedidoToDelete} onOpenChange={() => setPedidoToDelete(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
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

      {/* Dialog de Finalização */}
      <AlertDialog open={!!pedidoToFinalize} onOpenChange={() => setPedidoToFinalize(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar este pedido? Pedidos finalizados não podem ser editados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmFinalize}
              className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
            >
              Finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Cancelamento */}
      <AlertDialog open={!!pedidoToCancel} onOpenChange={() => setPedidoToCancel(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Não</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              className="w-full sm:w-auto bg-orange-600 text-white hover:bg-orange-700"
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