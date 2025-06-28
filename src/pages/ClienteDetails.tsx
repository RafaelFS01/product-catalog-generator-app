import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useClientes } from '@/contexts/ClienteContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Users, Phone, Mail, MapPin, FileText } from 'lucide-react';
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
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-6 sm:h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-64 sm:h-80 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="p-2"
          >
            <Link to="/clientes">
              <ArrowLeft size={16} className="mr-1" />
              Voltar
            </Link>
          </Button>
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold">Detalhes do Cliente</h1>
        </div>
        
        <Button asChild className="w-full sm:w-auto">
          <Link to={`/clientes/editar/${cliente.id}`}>
            <Edit size={16} className="mr-2" />
            Editar Cliente
          </Link>
        </Button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-lg sm:text-xl">{cliente.nome}</span>
                <Badge variant={cliente.tipo === 'PF' ? 'default' : 'secondary'} className="w-fit">
                  {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Documento */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText size={16} />
                  {cliente.tipo === 'PF' ? 'CPF' : 'CNPJ'}
                </div>
                <div className="text-lg sm:text-xl font-mono bg-muted/50 rounded-lg p-3">
                  {formatDocumento(cliente.documento, cliente.tipo)}
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone size={16} />
                  Telefone
                </div>
                <div className="text-lg sm:text-xl bg-muted/50 rounded-lg p-3">
                  {cliente.telefone}
                </div>
              </div>

              {/* E-mail - Span completo em telas menores */}
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail size={16} />
                  E-mail
                </div>
                <div className="text-lg sm:text-xl bg-muted/50 rounded-lg p-3 break-all">
                  {cliente.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin size={20} />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {/* Endereço principal */}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="text-base sm:text-lg font-medium mb-2">
                  {cliente.endereco.rua}, {cliente.endereco.numero}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground space-y-1">
                  <div>{cliente.endereco.bairro}</div>
                  <div>{cliente.endereco.cidade}, {cliente.endereco.estado}</div>
                  <div>CEP: {cliente.endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</div>
                </div>
              </div>
              
              {/* Grid de informações organizadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Rua:</span>
                  <div className="font-medium">{cliente.endereco.rua}</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Número:</span>
                  <div className="font-medium">{cliente.endereco.numero}</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Bairro:</span>
                  <div className="font-medium">{cliente.endereco.bairro}</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">CEP:</span>
                  <div className="font-medium font-mono">{cliente.endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <span className="font-medium text-muted-foreground text-sm">Cadastrado em:</span>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium">{formatDate(cliente.timestampCriacao)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-medium text-muted-foreground text-sm">Última atualização:</span>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium">{formatDate(cliente.timestampAtualizacao)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteDetails; 