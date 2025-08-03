import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientes } from '@/contexts/ClienteContext';
import { Cliente } from '@/types';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const clienteSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  tipo: z.enum(['PF', 'PJ']).optional(),
  documento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional()
  }).optional()
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: Cliente;
  isEditing?: boolean;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, isEditing = false }) => {
  const { createCliente, updateCliente, validateDocumento } = useClientes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      tipo: 'PF',
      documento: '',
      telefone: '',
      email: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
    }
  });

  const tipoWatch = watch('tipo');

  // Preencher form com dados do cliente se estiver editando
  useEffect(() => {
    if (cliente && isEditing) {
      reset({
        nome: cliente.nome || '',
        tipo: cliente.tipo ?? '',
        documento: cliente.documento ?? '',
        telefone: cliente.telefone ?? '',
        email: cliente.email ?? '',
        endereco: {
          rua: cliente.endereco?.rua ?? '',
          numero: cliente.endereco?.numero ?? '',
          bairro: cliente.endereco?.bairro ?? '',
          cidade: cliente.endereco?.cidade ?? '',
          estado: cliente.endereco?.estado ?? '',
          cep: cliente.endereco?.cep ?? ''
        }
      } as ClienteFormData);
    }
  }, [cliente, isEditing, reset]);

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      // Montar objeto completo para o contexto
      const clientePayload: Omit<Cliente, 'id' | 'timestampCriacao' | 'timestampAtualizacao'> = {
        nome: data.nome || '',
        tipo: (data.tipo as 'PF' | 'PJ') || 'PF',
        documento: data.documento || '',
        telefone: data.telefone || '',
        email: data.email || '',
        endereco: {
          rua: data.endereco?.rua || '',
          numero: data.endereco?.numero || '',
          bairro: data.endereco?.bairro || '',
          cidade: data.endereco?.cidade || '',
          estado: data.endereco?.estado || '',
          cep: data.endereco?.cep || ''
        }
      };
      if (isEditing && cliente) {
        await updateCliente(cliente.id, clientePayload);
      } else {
        await createCliente(clientePayload);
      }
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDocumento = (value: string, tipo: 'PF' | 'PJ'): string => {
    const cleanValue = value.replace(/[^\d]/g, '');
    
    if (tipo === 'PF') {
      // Formatar CPF: 000.000.000-00
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatTelefone = (value: string): string => {
    const cleanValue = value.replace(/[^\d]/g, '');
    
    if (cleanValue.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Celular: (00) 00000-0000
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatCep = (value: string): string => {
    const cleanValue = value.replace(/[^\d]/g, '');
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Informações do Cliente' : 'Informações do Cliente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Nome do cliente"
                  {...register('nome')}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Cliente *</Label>
                <Select 
                  value={tipoWatch} 
                  onValueChange={(value: 'PF' | 'PJ') => setValue('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física (CPF)</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica (CNPJ)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-destructive">{errors.tipo.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documento">{tipoWatch === 'PF' ? 'CPF' : 'CNPJ'}</Label>
                <Input
                  id="documento"
                  placeholder={tipoWatch === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                  {...register('documento', {
                    onChange: (e) => {
                      const formatted = formatDocumento(e.target.value, tipoWatch);
                      e.target.value = formatted;
                    }
                  })}
                />
                {errors.documento && (
                  <p className="text-sm text-destructive">{errors.documento.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  {...register('telefone', {
                    onChange: (e) => {
                      const formatted = formatTelefone(e.target.value);
                      e.target.value = formatted;
                    }
                  })}
                />
                {errors.telefone && (
                  <p className="text-sm text-destructive">{errors.telefone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="rua">Rua/Avenida</Label>
                  <Input
                    id="rua"
                    placeholder="Rua das Flores"
                    {...register('endereco.rua')}
                  />
                  {errors.endereco?.rua && (
                    <p className="text-sm text-destructive">{errors.endereco.rua.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    placeholder="123"
                    {...register('endereco.numero')}
                  />
                  {errors.endereco?.numero && (
                    <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    placeholder="Centro"
                    {...register('endereco.bairro')}
                  />
                  {errors.endereco?.bairro && (
                    <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    {...register('endereco.cep', {
                      onChange: (e) => {
                        const formatted = formatCep(e.target.value);
                        e.target.value = formatted;
                      }
                    })}
                  />
                  {errors.endereco?.cep && (
                    <p className="text-sm text-destructive">{errors.endereco.cep.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="São Paulo"
                    {...register('endereco.cidade')}
                  />
                  {errors.endereco?.cidade && (
                    <p className="text-sm text-destructive">{errors.endereco.cidade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <Input
                    id="estado"
                    placeholder="SP"
                    maxLength={2}
                    style={{ textTransform: 'uppercase' }}
                    {...register('endereco.estado', {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      }
                    })}
                  />
                  {errors.endereco?.estado && (
                    <p className="text-sm text-destructive">{errors.endereco.estado.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {isEditing ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/clientes')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClienteForm; 