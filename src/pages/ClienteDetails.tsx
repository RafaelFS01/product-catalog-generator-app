import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useClientes } from '@/contexts/ClienteContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Users, Phone, Mail, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

const ClienteDetails: React.FC = () => {
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
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to="/clientes">
              <ArrowLeft size={16} className="mr-1" />
              Voltar
            </Link>
          </Button>
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Detalhes do Cliente</h1>
        </div>
        
        <Button asChild>
          <Link to={`/clientes/editar/${cliente.id}`}>
            <Edit size={16} className="mr-2" />
            Editar Cliente
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span>{cliente.nome}</span>
              <Badge variant={cliente.tipo === 'PF' ? 'default' : 'secondary'}>
                {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {cliente.tipo === 'PF' ? 'CPF' : 'CNPJ'}
                </div>
                <div className="text-lg font-mono">
                  {formatDocumento(cliente.documento, cliente.tipo)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone size={16} />
                  Telefone
                </div>
                <div className="text-lg">{cliente.telefone}</div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail size={16} />
                  E-mail
                </div>
                <div className="text-lg">{cliente.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg">
                {cliente.endereco.rua}, {cliente.endereco.numero}
              </div>
              <div className="text-muted-foreground">
                {cliente.endereco.bairro}
              </div>
              <div className="text-muted-foreground">
                {cliente.endereco.cidade}, {cliente.endereco.estado}
              </div>
              <div className="text-muted-foreground">
                CEP: {cliente.endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Cadastrado em:</span>
                <div>{formatDate(cliente.timestampCriacao)}</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Última atualização:</span>
                <div>{formatDate(cliente.timestampAtualizacao)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteDetails; 