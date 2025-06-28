import React, { useState, useMemo } from 'react';
import { usePedidos } from '@/contexts/PedidoContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, CreditCard, CheckCircle, AlertTriangle, Clock, Eye, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PagamentoPendente } from '@/types';

const ManagePagamentos: React.FC = () => {
  const { pedidos, isLoading, finalizarPedido } = usePedidos();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Função para calcular dias de atraso
  const calcularDiasAtraso = (dataLimite: string): number => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    const diffTime = hoje.getTime() - limite.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para determinar status do pagamento
  const getStatusPagamento = (dataLimite: string): 'NO_PRAZO' | 'VENCIDO' | 'VENCENDO_HOJE' => {
    const diasAtraso = calcularDiasAtraso(dataLimite);
    
    if (diasAtraso > 0) return 'VENCIDO';
    if (diasAtraso === 0) return 'VENCENDO_HOJE';
    return 'NO_PRAZO';
  };

  // Processar pagamentos pendentes (apenas pedidos em aberto)
  const pagamentosPendentes = useMemo((): PagamentoPendente[] => {
    const pedidosEmAberto = pedidos.filter(pedido => pedido.status === 'EM_ABERTO');
    
    return pedidosEmAberto.map(pedido => ({
      pedido,
      diasAtraso: Math.max(0, calcularDiasAtraso(pedido.dataLimitePagamento)),
      statusPagamento: getStatusPagamento(pedido.dataLimitePagamento)
    }));
  }, [pedidos]);

  // Filtros aplicados
  const filteredPagamentos = useMemo(() => {
    return pagamentosPendentes.filter(pagamento => {
      const matchesSearch = 
        pagamento.pedido.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.pedido.cliente.documento.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'TODOS' || pagamento.statusPagamento === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pagamentosPendentes, searchTerm, statusFilter]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = pagamentosPendentes.length;
    const vencidos = pagamentosPendentes.filter(p => p.statusPagamento === 'VENCIDO').length;
    const vencendoHoje = pagamentosPendentes.filter(p => p.statusPagamento === 'VENCENDO_HOJE').length;
    const noPrazo = pagamentosPendentes.filter(p => p.statusPagamento === 'NO_PRAZO').length;
    const valorTotal = pagamentosPendentes.reduce((sum, p) => sum + p.pedido.valorTotal, 0);

    return { total, vencidos, vencendoHoje, noPrazo, valorTotal };
  }, [pagamentosPendentes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VENCIDO':
        return 'destructive';
      case 'VENCENDO_HOJE':
        return 'secondary';
      case 'NO_PRAZO':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VENCIDO':
        return <AlertTriangle size={14} />;
      case 'VENCENDO_HOJE':
        return <Clock size={14} />;
      case 'NO_PRAZO':
        return <CheckCircle size={14} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VENCIDO':
        return 'Vencido';
      case 'VENCENDO_HOJE':
        return 'Vence Hoje';
      case 'NO_PRAZO':
        return 'No Prazo';
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

  const handleMarcarComoPago = async (pedidoId: string) => {
    await finalizarPedido(pedidoId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gerenciar Pagamentos</h1>
        </div>
        <Button asChild>
          <Link to="/pedidos">
            <TrendingUp size={16} className="mr-2" />
            Ver Todos os Pedidos
          </Link>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">pedidos em aberto</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{estatisticas.vencidos}</div>
            <p className="text-xs text-muted-foreground">precisam atenção</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencem Hoje</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{estatisticas.vencendoHoje}</div>
            <p className="text-xs text-muted-foreground">último dia</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Prazo</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estatisticas.noPrazo}</div>
            <p className="text-xs text-muted-foreground">dentro do prazo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">a receber</p>
          </CardContent>
        </Card>
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
                <SelectItem value="VENCIDO">Vencidos</SelectItem>
                <SelectItem value="VENCENDO_HOJE">Vencem Hoje</SelectItem>
                <SelectItem value="NO_PRAZO">No Prazo</SelectItem>
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
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredPagamentos.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'TODOS' 
                  ? 'Nenhum pagamento encontrado para os filtros aplicados.' 
                  : 'Todos os pedidos estão pagos! 🎉'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPagamentos.map(pagamento => (
                <Card key={pagamento.pedido.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{pagamento.pedido.numero}</h3>
                          <Badge 
                            variant={getStatusColor(pagamento.statusPagamento)} 
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(pagamento.statusPagamento)}
                            {getStatusText(pagamento.statusPagamento)}
                          </Badge>
                          {pagamento.statusPagamento === 'VENCIDO' && (
                            <Badge variant="outline" className="text-destructive">
                              {pagamento.diasAtraso} dias de atraso
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
                          <div>
                            <span className="font-medium">Cliente:</span> {pagamento.pedido.cliente.nome}
                          </div>
                          <div>
                            <span className="font-medium">
                              {pagamento.pedido.cliente.tipo === 'PF' ? 'CPF:' : 'CNPJ:'}
                            </span> {pagamento.pedido.cliente.documento}
                          </div>
                          <div>
                            <span className="font-medium">Vencimento:</span> {
                              new Date(pagamento.pedido.dataLimitePagamento).toLocaleDateString('pt-BR')
                            }
                          </div>
                          <div>
                            <span className="font-medium">Criado em:</span> {
                              new Date(pagamento.pedido.timestampCriacao).toLocaleDateString('pt-BR')
                            }
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-primary">
                            {formatCurrency(pagamento.pedido.valorTotal)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">
                              {pagamento.pedido.itens.length} itens
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/pedidos/detalhes/${pagamento.pedido.id}`}>
                            <Eye size={16} className="mr-1" />
                            Ver
                          </Link>
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarcarComoPago(pagamento.pedido.id)}
                          className="text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Marcar como Pago
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
    </div>
  );
};

export default ManagePagamentos; 