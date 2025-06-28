import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, get, set, update, remove, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Pedido, ItemPedido, Cliente } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface PedidoContextProps {
  pedidos: Pedido[];
  isLoading: boolean;
  fetchPedidos: () => Promise<void>;
  getPedido: (id: string) => Pedido | undefined;
  createPedido: (pedido: Omit<Pedido, 'id' | 'numero' | 'timestampCriacao' | 'timestampAtualizacao'>) => Promise<Pedido>;
  updatePedido: (id: string, pedido: Partial<Pedido>) => Promise<Pedido>;
  deletePedido: (id: string) => Promise<boolean>;
  finalizarPedido: (id: string) => Promise<boolean>;
  cancelarPedido: (id: string) => Promise<boolean>;
  generateNumeroPedido: () => Promise<string>;
}

const PedidoContext = createContext<PedidoContextProps | undefined>(undefined);

export const PedidoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPedidos = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const pedidosRef = ref(db, 'pedidos');
      const snapshot = await get(pedidosRef);
      
      if (snapshot.exists()) {
        const pedidosData = snapshot.val();
        const pedidosArray: Pedido[] = Object.keys(pedidosData).map(key => ({
          id: key,
          ...pedidosData[key]
        }));
        
        // Ordenar por data de criação (mais recentes primeiro)
        pedidosArray.sort((a, b) => b.timestampCriacao - a.timestampCriacao);
        
        setPedidos(pedidosArray);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error('Error fetching pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPedido = (id: string): Pedido | undefined => {
    return pedidos.find(pedido => pedido.id === id);
  };

  const generateNumeroPedido = async (): Promise<string> => {
    try {
      // Buscar último número usado
      const configRef = ref(db, 'configuracoes/ultimoNumeroPedido');
      const snapshot = await get(configRef);
      
      const ultimoNumero = snapshot.exists() ? snapshot.val() : 0;
      const novoNumero = ultimoNumero + 1;
      
      // Atualizar contador
      await set(configRef, novoNumero);
      
      // Gerar número formatado: PED-2024-001
      const ano = new Date().getFullYear();
      const numeroFormatado = `PED-${ano}-${novoNumero.toString().padStart(3, '0')}`;
      
      return numeroFormatado;
    } catch (error) {
      console.error('Error generating numero pedido:', error);
      // Fallback: usar timestamp
      return `PED-${Date.now()}`;
    }
  };

  const createPedido = async (pedido: Omit<Pedido, 'id' | 'numero' | 'timestampCriacao' | 'timestampAtualizacao'>): Promise<Pedido> => {
    try {
      const timestamp = Date.now();
      const numero = await generateNumeroPedido();
      const newPedidoRef = push(ref(db, 'pedidos'));
      
      const newPedido: Omit<Pedido, 'id'> = {
        ...pedido,
        numero,
        timestampCriacao: timestamp,
        timestampAtualizacao: timestamp
      };
      
      await set(newPedidoRef, newPedido);
      
      const createdPedido: Pedido = {
        id: newPedidoRef.key as string,
        ...newPedido
      };
      
      setPedidos(prevPedidos => 
        [createdPedido, ...prevPedidos]
      );
      
      toast({
        title: "Pedido criado",
        description: `Pedido ${createdPedido.numero} foi criado com sucesso.`
      });
      
      return createdPedido;
    } catch (error) {
      console.error('Error creating pedido:', error);
      toast({
        title: "Erro ao criar pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePedido = async (id: string, pedido: Partial<Pedido>): Promise<Pedido> => {
    try {
      const existingPedido = pedidos.find(p => p.id === id);
      if (!existingPedido) {
        throw new Error('Pedido não encontrado');
      }

      // Não permitir edição de pedidos finalizados ou cancelados
      if (existingPedido.status !== 'EM_ABERTO') {
        throw new Error('Não é possível editar pedidos que não estão em aberto');
      }
      
      const updatedFields = {
        ...pedido,
        timestampAtualizacao: Date.now()
      };
      
      const pedidoRef = ref(db, `pedidos/${id}`);
      await update(pedidoRef, updatedFields);
      
      const updatedPedido: Pedido = {
        ...existingPedido,
        ...updatedFields
      };
      
      setPedidos(prevPedidos => 
        prevPedidos.map(p => p.id === id ? updatedPedido : p)
      );
      
      toast({
        title: "Pedido atualizado",
        description: `Pedido ${updatedPedido.numero} foi atualizado com sucesso.`
      });
      
      return updatedPedido;
    } catch (error) {
      console.error('Error updating pedido:', error);
      toast({
        title: "Erro ao atualizar pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const finalizarPedido = async (id: string): Promise<boolean> => {
    try {
      const pedido = pedidos.find(p => p.id === id);
      if (!pedido) {
        throw new Error('Pedido não encontrado');
      }

      if (pedido.status !== 'EM_ABERTO') {
        throw new Error('Apenas pedidos em aberto podem ser finalizados');
      }

      await updatePedido(id, { status: 'FINALIZADO' });
      
      toast({
        title: "Pedido finalizado",
        description: `Pedido ${pedido.numero} foi finalizado com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error('Error finalizing pedido:', error);
      toast({
        title: "Erro ao finalizar pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelarPedido = async (id: string): Promise<boolean> => {
    try {
      const pedido = pedidos.find(p => p.id === id);
      if (!pedido) {
        throw new Error('Pedido não encontrado');
      }

      if (pedido.status === 'CANCELADO') {
        throw new Error('Pedido já está cancelado');
      }

      await updatePedido(id, { status: 'CANCELADO' });
      
      toast({
        title: "Pedido cancelado",
        description: `Pedido ${pedido.numero} foi cancelado.`
      });
      
      return true;
    } catch (error) {
      console.error('Error canceling pedido:', error);
      toast({
        title: "Erro ao cancelar pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePedido = async (id: string): Promise<boolean> => {
    try {
      const pedidoToDelete = pedidos.find(p => p.id === id);
      if (!pedidoToDelete) {
        throw new Error('Pedido não encontrado');
      }
      
      const pedidoRef = ref(db, `pedidos/${id}`);
      await remove(pedidoRef);
      
      setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== id));
      
      toast({
        title: "Pedido excluído",
        description: `Pedido ${pedidoToDelete.numero} foi removido com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting pedido:', error);
      toast({
        title: "Erro ao excluir pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  // Carregar pedidos ao inicializar
  useEffect(() => {
    fetchPedidos();
  }, []);

  return (
    <PedidoContext.Provider value={{
      pedidos,
      isLoading,
      fetchPedidos,
      getPedido,
      createPedido,
      updatePedido,
      deletePedido,
      finalizarPedido,
      cancelarPedido,
      generateNumeroPedido
    }}>
      {children}
    </PedidoContext.Provider>
  );
};

export const usePedidos = (): PedidoContextProps => {
  const context = useContext(PedidoContext);
  if (context === undefined) {
    throw new Error('usePedidos must be used within a PedidoProvider');
  }
  return context;
}; 