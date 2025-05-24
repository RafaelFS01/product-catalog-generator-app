import { useState, useEffect } from 'react';
import { ref, get, set, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Marca } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface UseMarcasReturn {
  marcas: Marca[];
  isLoading: boolean;
  createMarca: (nome: string) => Promise<Marca>;
  fetchMarcas: () => Promise<void>;
  getMarcaByNome: (nome: string) => Marca | undefined;
}

export const useMarcas = (): UseMarcasReturn => {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMarcas = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const marcasRef = ref(db, 'marcas');
      const snapshot = await get(marcasRef);
      
      if (snapshot.exists()) {
        const marcasData = snapshot.val();
        const marcasArray: Marca[] = Object.keys(marcasData).map(key => ({
          id: key,
          ...marcasData[key]
        }));
        
        // Ordenar marcas por nome
        marcasArray.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { 
          sensitivity: 'base' 
        }));
        
        setMarcas(marcasArray);
      } else {
        setMarcas([]);
      }
    } catch (error) {
      console.error('Error fetching marcas:', error);
      toast({
        title: "Erro ao carregar marcas",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMarca = async (nome: string): Promise<Marca> => {
    try {
      // Verificar se a marca já existe (case-insensitive)
      const existingMarca = marcas.find(
        marca => marca.nome.toLowerCase() === nome.toLowerCase()
      );

      if (existingMarca) {
        toast({
          title: "Marca já existe",
          description: `A marca "${existingMarca.nome}" já está cadastrada.`,
          variant: "destructive",
        });
        return existingMarca;
      }

      const timestamp = Date.now();
      const newMarcaRef = push(ref(db, 'marcas'));
      
      const newMarca: Omit<Marca, 'id'> = {
        nome: nome.trim(),
        timestampCriacao: timestamp
      };
      
      await set(newMarcaRef, newMarca);
      
      const createdMarca: Marca = {
        id: newMarcaRef.key as string,
        ...newMarca
      };
      
      // Adicionar à lista local e reordenar
      const updatedMarcas = [...marcas, createdMarca].sort((a, b) => 
        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
      );
      
      setMarcas(updatedMarcas);
      
      toast({
        title: "Marca criada",
        description: `"${createdMarca.nome}" foi adicionada às marcas.`
      });
      
      return createdMarca;
    } catch (error) {
      console.error('Error creating marca:', error);
      toast({
        title: "Erro ao criar marca",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getMarcaByNome = (nome: string): Marca | undefined => {
    return marcas.find(marca => 
      marca.nome.toLowerCase() === nome.toLowerCase()
    );
  };

  // Carregar marcas ao inicializar o hook
  useEffect(() => {
    fetchMarcas();
  }, []);

  return {
    marcas,
    isLoading,
    createMarca,
    fetchMarcas,
    getMarcaByNome
  };
}; 