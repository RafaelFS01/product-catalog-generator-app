import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UseImageUploadReturn {
  uploadImage: (file: File, path?: string) => Promise<string>;
  deleteImage: (imagePath: string) => Promise<boolean>;
  uploadProgress: UploadProgress;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const { toast } = useToast();

  const uploadImage = async (file: File, customPath?: string): Promise<string> => {
    // Validações
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      const error = 'Arquivo muito grande. Tamanho máximo: 5MB';
      setUploadProgress(prev => ({ ...prev, error }));
      toast({
        title: "Erro no upload",
        description: error,
        variant: "destructive",
      });
      throw new Error(error);
    }

    if (!allowedTypes.includes(file.type)) {
      const error = 'Tipo de arquivo não suportado. Use: JPG, PNG, GIF ou WebP';
      setUploadProgress(prev => ({ ...prev, error }));
      toast({
        title: "Erro no upload",
        description: error,
        variant: "destructive",
      });
      throw new Error(error);
    }

    setUploadProgress({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // Criar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      // Definir o caminho no Storage
      const imagePath = customPath || `produtos/${fileName}`;
      const storageRef = ref(storage, imagePath);

      // Fazer upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);

      setUploadProgress({
        isUploading: false,
        progress: 100,
        error: null,
      });

      toast({
        title: "Upload concluído",
        description: "Imagem enviada com sucesso!",
      });

      return downloadURL;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      setUploadProgress({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });

      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  };

  const deleteImage = async (imagePath: string): Promise<boolean> => {
    try {
      // Extrair o caminho do Storage a partir da URL
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      
      toast({
        title: "Imagem removida",
        description: "Imagem removida com sucesso!",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover imagem';
      
      toast({
        title: "Erro ao remover imagem",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploadProgress,
  };
}; 