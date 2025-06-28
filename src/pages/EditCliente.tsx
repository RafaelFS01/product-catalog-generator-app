import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useClientes } from '@/contexts/ClienteContext';
import ClienteForm from '@/components/clientes/ClienteForm';
import { Skeleton } from '@/components/ui/skeleton';

const EditCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCliente, isLoading } = useClientes();

  if (!id) {
    return <Navigate to="/clientes" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const cliente = getCliente(id);

  if (!cliente) {
    return <Navigate to="/clientes" replace />;
  }

  return <ClienteForm cliente={cliente} isEditing={true} />;
};

export default EditCliente; 