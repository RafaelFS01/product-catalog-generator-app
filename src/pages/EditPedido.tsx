import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePedidos } from '@/contexts/PedidoContext';
import PedidoForm from '@/components/pedidos/PedidoForm';
import { Skeleton } from '@/components/ui/skeleton';

const EditPedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPedido, isLoading } = usePedidos();

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

  // Não permitir edição de pedidos finalizados ou cancelados
  if (pedido.status !== 'EM_ABERTO') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Pedido não pode ser editado</h2>
        <p className="text-muted-foreground mb-4">
          Apenas pedidos em aberto podem ser editados.
        </p>
        <p className="text-sm">
          Status atual: <strong>{pedido.status === 'FINALIZADO' ? 'Finalizado' : 'Cancelado'}</strong>
        </p>
      </div>
    );
  }

  return <PedidoForm pedido={pedido} isEditing={true} />;
};

export default EditPedido; 