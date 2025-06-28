import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, get, set, update, remove, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Cliente } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface ClienteContextProps {
  clientes: Cliente[];
  isLoading: boolean;
  fetchClientes: () => Promise<void>;
  getCliente: (id: string) => Cliente | undefined;
  createCliente: (cliente: Omit<Cliente, 'id' | 'timestampCriacao' | 'timestampAtualizacao'>) => Promise<Cliente>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<Cliente>;
  deleteCliente: (id: string) => Promise<boolean>;
  validateDocumento: (documento: string, tipo: 'PF' | 'PJ') => boolean;
}

const ClienteContext = createContext<ClienteContextProps | undefined>(undefined);

export const ClienteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const clientesRef = ref(db, 'clientes');
      const snapshot = await get(clientesRef);
      
      if (snapshot.exists()) {
        const clientesData = snapshot.val();
        const clientesArray: Cliente[] = Object.keys(clientesData).map(key => ({
          id: key,
          ...clientesData[key]
        }));
        
        // Ordenar por nome
        clientesArray.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { 
          sensitivity: 'base' 
        }));
        
        setClientes(clientesArray);
      } else {
        setClientes([]);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCliente = (id: string): Cliente | undefined => {
    return clientes.find(cliente => cliente.id === id);
  };

  const validateDocumento = (documento: string, tipo: 'PF' | 'PJ'): boolean => {
    // Remove caracteres especiais
    const cleanDoc = documento.replace(/[^\d]/g, '');
    
    if (tipo === 'PF') {
      // Validação básica de CPF (11 dígitos)
      return cleanDoc.length === 11;
    } else {
      // Validação básica de CNPJ (14 dígitos)
      return cleanDoc.length === 14;
    }
  };

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'timestampCriacao' | 'timestampAtualizacao'>): Promise<Cliente> => {
    try {
      // Validar se documento já existe
      const documentoExistente = clientes.find(c => c.documento === cliente.documento);
      if (documentoExistente) {
        throw new Error('Já existe um cliente cadastrado com este documento');
      }

      // Validar formato do documento
      if (!validateDocumento(cliente.documento, cliente.tipo)) {
        throw new Error(`Formato de ${cliente.tipo === 'PF' ? 'CPF' : 'CNPJ'} inválido`);
      }

      const timestamp = Date.now();
      const newClienteRef = push(ref(db, 'clientes'));
      
      const newCliente: Omit<Cliente, 'id'> = {
        ...cliente,
        timestampCriacao: timestamp,
        timestampAtualizacao: timestamp
      };
      
      await set(newClienteRef, newCliente);
      
      const createdCliente: Cliente = {
        id: newClienteRef.key as string,
        ...newCliente
      };
      
      setClientes(prevClientes => 
        [...prevClientes, createdCliente].sort((a, b) => 
          a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
        )
      );
      
      toast({
        title: "Cliente criado",
        description: `"${createdCliente.nome}" foi adicionado com sucesso.`
      });
      
      return createdCliente;
    } catch (error) {
      console.error('Error creating cliente:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCliente = async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
    try {
      const existingCliente = clientes.find(c => c.id === id);
      if (!existingCliente) {
        throw new Error('Cliente não encontrado');
      }

      // Se está alterando documento, validar se não existe outro cliente com o mesmo
      if (cliente.documento && cliente.documento !== existingCliente.documento) {
        const documentoExistente = clientes.find(c => c.id !== id && c.documento === cliente.documento);
        if (documentoExistente) {
          throw new Error('Já existe um cliente cadastrado com este documento');
        }

        // Validar formato se foi alterado o tipo ou documento
        const tipo = cliente.tipo || existingCliente.tipo;
        if (!validateDocumento(cliente.documento, tipo)) {
          throw new Error(`Formato de ${tipo === 'PF' ? 'CPF' : 'CNPJ'} inválido`);
        }
      }
      
      const updatedFields = {
        ...cliente,
        timestampAtualizacao: Date.now()
      };
      
      const clienteRef = ref(db, `clientes/${id}`);
      await update(clienteRef, updatedFields);
      
      const updatedCliente: Cliente = {
        ...existingCliente,
        ...updatedFields
      };
      
      setClientes(prevClientes => 
        prevClientes.map(c => c.id === id ? updatedCliente : c)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
      
      toast({
        title: "Cliente atualizado",
        description: `"${updatedCliente.nome}" foi atualizado com sucesso.`
      });
      
      return updatedCliente;
    } catch (error) {
      console.error('Error updating cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCliente = async (id: string): Promise<boolean> => {
    try {
      const clienteToDelete = clientes.find(c => c.id === id);
      if (!clienteToDelete) {
        throw new Error('Cliente não encontrado');
      }
      
      const clienteRef = ref(db, `clientes/${id}`);
      await remove(clienteRef);
      
      setClientes(prevClientes => prevClientes.filter(c => c.id !== id));
      
      toast({
        title: "Cliente excluído",
        description: `"${clienteToDelete.nome}" foi removido com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting cliente:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  // Carregar clientes ao inicializar
  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <ClienteContext.Provider value={{
      clientes,
      isLoading,
      fetchClientes,
      getCliente,
      createCliente,
      updateCliente,
      deleteCliente,
      validateDocumento
    }}>
      {children}
    </ClienteContext.Provider>
  );
};

export const useClientes = (): ClienteContextProps => {
  const context = useContext(ClienteContext);
  if (context === undefined) {
    throw new Error('useClientes must be used within a ClienteProvider');
  }
  return context;
}; 