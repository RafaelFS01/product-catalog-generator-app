import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { useClientes } from '@/contexts/ClienteContext';
import { useProducts } from '@/contexts/ProductContext';
import { usePedidos } from '@/contexts/PedidoContext';
import { Pedido, Cliente, Product, ItemPedido } from '@/types';
import { Loader2, Save, ArrowLeft, Plus, Trash2, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
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

const itemPedidoSchema = z.object({
  produtoId: z.string().min(1, 'Produto é obrigatório'),
  nome: z.string().min(1, 'Nome do produto é obrigatório'),
  peso: z.string().min(1, 'Peso é obrigatório'),
  quantidade: z.number().min(1, 'Quantidade deve ser pelo menos 1'),
  precoUnitario: z.number().min(0.01, 'Preço deve ser maior que zero'),
  precoTotal: z.number().min(0.01, 'Preço total deve ser maior que zero'),
  marca: z.string().optional()
});

const pedidoSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  itens: z.array(itemPedidoSchema).min(1, 'Adicione pelo menos um item ao pedido'),
  dataLimitePagamento: z.string().min(1, 'Data limite de pagamento é obrigatória'),
  observacoes: z.string().optional()
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

interface PedidoFormProps {
  pedido?: Pedido;
  isEditing?: boolean;
}

const PedidoForm: React.FC<PedidoFormProps> = ({ pedido, isEditing = false }) => {
  const { createPedido, updatePedido } = usePedidos();
  const { clientes, isLoading: loadingClientes } = useClientes();
  const { products, isLoading: loadingProducts } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState(1);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control
  } = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      clienteId: '',
      itens: [],
      dataLimitePagamento: '',
      observacoes: ''
    }
  });

  const { fields: itens, append: addItem, remove: removeItem } = useFieldArray({
    control,
    name: 'itens'
  });

  const watchedItens = watch('itens');
  
  const valorTotal = useMemo(() => {
    return watchedItens.reduce((total, item) => total + (item.precoTotal || 0), 0);
  }, [watchedItens]);

  useEffect(() => {
    if (pedido && isEditing) {
      reset({
        clienteId: pedido.clienteId,
        itens: pedido.itens,
        dataLimitePagamento: pedido.dataLimitePagamento || '',
        observacoes: pedido.observacoes || ''
      });
      
      const cliente = clientes.find(c => c.id === pedido.clienteId);
      if (cliente) {
        setClienteSelecionado(cliente);
      }
    }
  }, [pedido, isEditing, reset, clientes]);

  const onSubmit = async (data: PedidoFormData) => {
    if (!clienteSelecionado) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const pedidoData = {
        clienteId: data.clienteId,
        cliente: {
          nome: clienteSelecionado.nome,
          documento: clienteSelecionado.documento,
          tipo: clienteSelecionado.tipo
        },
        itens: data.itens as ItemPedido[],
        valorTotal,
        status: 'EM_ABERTO' as const,
        dataLimitePagamento: data.dataLimitePagamento,
        observacoes: data.observacoes
      };

      if (isEditing && pedido) {
        await updatePedido(pedido.id, pedidoData);
      } else {
        await createPedido(pedidoData);
      }
      
      navigate('/pedidos');
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setClienteSelecionado(cliente || null);
    setValue('clienteId', clienteId);
  };

  const handleAddProduct = () => {
    if (!produtoSelecionado || quantidadeProduto < 1) return;

    const precoUnitario = produtoSelecionado.precoUnitario;
    const precoTotal = precoUnitario * quantidadeProduto;

    const novoItem: ItemPedido = {
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      peso: produtoSelecionado.peso,
      quantidade: quantidadeProduto,
      precoUnitario,
      precoTotal,
      marca: produtoSelecionado.marca
    };

    addItem(novoItem);
    setProdutoSelecionado(null);
    setQuantidadeProduto(1);
    setShowAddProduct(false);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove !== null) {
      removeItem(itemToRemove);
      setItemToRemove(null);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDocumento = (documento: string, tipo: 'PF' | 'PJ'): string => {
    if (tipo === 'PF') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const clienteOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: `${cliente.nome} - ${formatDocumento(cliente.documento, cliente.tipo)}`
  }));

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.nome} - ${product.peso} - ${formatCurrency(product.precoUnitario)}`
  }));

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Pedido' : 'Novo Pedido'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleção de Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Selecionar Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Combobox
                  options={clienteOptions}
                  value={clienteSelecionado?.id || ''}
                  onSelect={handleClienteSelect}
                  placeholder="Buscar cliente..."
                  disabled={loadingClientes}
                />
                {errors.clienteId && (
                  <p className="text-sm text-destructive">{errors.clienteId.message}</p>
                )}
              </div>

              {clienteSelecionado && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{clienteSelecionado.nome}</h3>
                    <Badge variant={clienteSelecionado.tipo === 'PF' ? 'default' : 'secondary'}>
                      {clienteSelecionado.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">
                        {clienteSelecionado.tipo === 'PF' ? 'CPF:' : 'CNPJ:'}
                      </span> {formatDocumento(clienteSelecionado.documento, clienteSelecionado.tipo)}
                    </div>
                    <div>
                      <span className="font-medium">E-mail:</span> {clienteSelecionado.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {clienteSelecionado.telefone}
                    </div>
                    <div>
                      <span className="font-medium">Cidade:</span> {clienteSelecionado.endereco.cidade}/{clienteSelecionado.endereco.estado}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Itens do Pedido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={20} />
                Itens do Pedido
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddProduct(true)}
                disabled={loadingProducts}
              >
                <Plus size={16} className="mr-1" />
                Adicionar Produto
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {itens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum item adicionado ainda</p>
                <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itens.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{item.nome}</h4>
                        <Badge variant="outline">{item.peso}</Badge>
                        {item.marca && <Badge variant="secondary">{item.marca}</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Quantidade:</span> {item.quantidade}
                        </div>
                        <div>
                          <span className="font-medium">Preço Unit.:</span> {formatCurrency(item.precoUnitario)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {formatCurrency(item.precoTotal)}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setItemToRemove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Valor Total:</span>
                    <span className="text-primary">{formatCurrency(valorTotal)}</span>
                  </div>
                </div>
              </div>
            )}
            {errors.itens && (
              <p className="text-sm text-destructive mt-2">{errors.itens.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Data Limite de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Data Limite de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="dataLimitePagamento">Data Limite para Pagamento</Label>
              <Input
                id="dataLimitePagamento"
                type="date"
                {...register('dataLimitePagamento')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dataLimitePagamento && (
                <p className="text-sm text-destructive">{errors.dataLimitePagamento.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Defina até quando o pagamento deste pedido deve ser realizado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações do Pedido</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o pedido..."
                {...register('observacoes')}
              />
              {errors.observacoes && (
                <p className="text-sm text-destructive">{errors.observacoes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || itens.length === 0 || !clienteSelecionado}
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
                {isEditing ? 'Atualizar' : 'Criar Pedido'}
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/pedidos')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Dialog para Adicionar Produto */}
      <AlertDialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione um produto e informe a quantidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Combobox
                options={productOptions}
                value={produtoSelecionado?.id || ''}
                onSelect={(productId) => {
                  const product = products.find(p => p.id === productId);
                  setProdutoSelecionado(product || null);
                }}
                placeholder="Buscar produto..."
                disabled={loadingProducts}
              />
            </div>

            {produtoSelecionado && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{produtoSelecionado.nome}</span>
                  <Badge variant="outline">{produtoSelecionado.peso}</Badge>
                  {produtoSelecionado.marca && <Badge variant="secondary">{produtoSelecionado.marca}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Preço unitário: {formatCurrency(produtoSelecionado.precoUnitario)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidadeProduto}
                onChange={(e) => setQuantidadeProduto(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            {produtoSelecionado && (
              <div className="text-right">
                <span className="text-lg font-bold">
                  Total: {formatCurrency(produtoSelecionado.precoUnitario * quantidadeProduto)}
                </span>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAddProduct}
              disabled={!produtoSelecionado || quantidadeProduto < 1}
            >
              Adicionar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para Confirmar Remoção */}
      <AlertDialog open={itemToRemove !== null} onOpenChange={() => setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este item do pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PedidoForm; 