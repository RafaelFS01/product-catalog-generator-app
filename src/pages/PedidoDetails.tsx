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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pedidos')}
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Pedido {pedido.numero}</h1>
          <Badge className={getStatusColor(pedido.status)}>
            {getStatusText(pedido.status)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botões de PDF */}
          <PedidoPDFGenerator 
            pedido={pedido} 
            variant="outline" 
            size="sm"
          />
          
          {pedido.status === 'EM_ABERTO' && (
            <Button
              variant="outline"
              onClick={() => navigate(`/pedidos/editar/${pedido.id}`)}
            >
              <Edit size={16} className="mr-2" />
              Editar Pedido
            </Button>
          )}
        </div>
      </div>

      {/* Informações do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt size={20} />
            Informações do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-muted-foreground" />
                <span className="font-medium">Número:</span>
                <span>{pedido.numero}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="font-medium">Data de Criação:</span>
                <span>{formatDate(pedido.timestampCriacao)}</span>
              </div>
              {pedido.timestampAtualizacao !== pedido.timestampCriacao && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="font-medium">Última Atualização:</span>
                  <span>{formatDate(pedido.timestampAtualizacao)}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(pedido.status)}>
                  {getStatusText(pedido.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Valor Total:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(pedido.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{pedido.cliente.nome}</h3>
              <Badge variant={pedido.cliente.tipo === 'PF' ? 'default' : 'secondary'}>
                {pedido.cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-muted-foreground" />
                <span className="font-medium">
                  {pedido.cliente.tipo === 'PF' ? 'CPF:' : 'CNPJ:'}
                </span>
                <span>{formatDocumento(pedido.cliente.documento, pedido.cliente.tipo)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Itens do Pedido ({pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pedido.itens.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{item.nome}</h4>
                    <Badge variant="outline">{item.peso}</Badge>
                    {item.marca && <Badge variant="secondary">{item.marca}</Badge>}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(item.precoTotal)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Quantidade:</span> {item.quantidade}
                  </div>
                  <div>
                    <span className="font-medium">Preço Unitário:</span> {formatCurrency(item.precoUnitario)}
                  </div>
                  <div>
                    <span className="font-medium">Subtotal:</span> {formatCurrency(item.precoTotal)}
                  </div>
                </div>
              </div>
            ))}

            {/* Total Geral */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Geral:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(pedido.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {pedido.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{pedido.observacoes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PedidoDetails; 