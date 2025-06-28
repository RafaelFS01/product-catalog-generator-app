import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { usePedidos } from '@/contexts/PedidoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Receipt
} from 'lucide-react';
import PedidoPDFGenerator from '@/components/pedidos/PedidoPDFGenerator';

const PedidoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPedido, isLoading } = usePedidos();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/pedidos" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const pedido = getPedido(id);

  if (!pedido) {
    return <Navigate to="/pedidos" replace />;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatDocumento = (documento: string, tipo: 'PF' | 'PJ'): string => {
    if (tipo === 'PF') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EM_ABERTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FINALIZADO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pedidos')}
            className="w-fit"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Pedido {pedido.numero}</h1>
            <Badge className={getStatusColor(pedido.status)}>
              {getStatusText(pedido.status)}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Botões de PDF */}
          <PedidoPDFGenerator 
            pedido={pedido} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          />
          
          {pedido.status === 'EM_ABERTO' && (
            <Button
              variant="outline"
              onClick={() => navigate(`/pedidos/editar/${pedido.id}`)}
              className="w-full sm:w-auto"
            >
              <Edit size={16} className="mr-2" />
              Editar Pedido
            </Button>
          )}
        </div>
      </div>

      {/* Informações do Pedido */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Receipt size={20} />
            Informações do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            {/* Primeira linha - Informações principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText size={16} />
                  Número
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="font-mono font-medium">{pedido.numero}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar size={16} />
                  Data de Criação
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-sm">{formatDate(pedido.timestampCriacao)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <Badge className={getStatusColor(pedido.status)}>
                    {getStatusText(pedido.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Valor Total</div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(pedido.valorTotal)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Data limite de pagamento e última atualização */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pedido.dataLimitePagamento && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Data Limite de Pagamento</div>
                  <div className={`rounded-lg p-3 ${
                    new Date(pedido.dataLimitePagamento) < new Date() && pedido.status === 'EM_ABERTO'
                      ? 'bg-destructive/10 border border-destructive/20'
                      : 'bg-muted/50'
                  }`}>
                    <span className={`font-medium ${
                      new Date(pedido.dataLimitePagamento) < new Date() && pedido.status === 'EM_ABERTO'
                        ? 'text-destructive'
                        : ''
                    }`}>
                      {new Date(pedido.dataLimitePagamento).toLocaleDateString('pt-BR')}
                    </span>
                    {new Date(pedido.dataLimitePagamento) < new Date() && pedido.status === 'EM_ABERTO' && (
                      <div className="text-xs text-destructive mt-1">
                        Vencido há {Math.floor((Date.now() - new Date(pedido.dataLimitePagamento).getTime()) / (1000 * 60 * 60 * 24))} dias
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {pedido.timestampAtualizacao !== pedido.timestampCriacao && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Última Atualização</div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <span className="text-sm">{formatDate(pedido.timestampAtualizacao)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h3 className="text-lg font-semibold">{pedido.cliente.nome}</h3>
                <Badge variant={pedido.cliente.tipo === 'PF' ? 'default' : 'secondary'}>
                  {pedido.cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText size={16} />
                  {pedido.cliente.tipo === 'PF' ? 'CPF' : 'CNPJ'}
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="font-mono">{formatDocumento(pedido.cliente.documento, pedido.cliente.tipo)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Tipo de Cliente</div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span>{pedido.cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens do Pedido */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={20} />
              Itens do Pedido ({pedido.itens.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {pedido.itens.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 sm:p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="space-y-3">
                  {/* Nome e badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h4 className="font-semibold text-base">{item.nome}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="w-fit">{item.peso}</Badge>
                        {item.marca && <Badge variant="secondary" className="w-fit">{item.marca}</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(item.precoTotal)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações detalhadas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Quantidade:</span>
                      <div className="font-medium">{item.quantidade}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Preço Unitário:</span>
                      <div className="font-medium">{formatCurrency(item.precoUnitario)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Total do Item:</span>
                      <div className="font-medium text-primary">{formatCurrency(item.precoTotal)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Total do Pedido */}
            <div className="border-t pt-4 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-primary/5 rounded-lg p-4">
                <div className="text-lg font-semibold">Total do Pedido:</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(pedido.valorTotal)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {pedido.observacoes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base whitespace-pre-wrap">{pedido.observacoes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PedidoDetails; 