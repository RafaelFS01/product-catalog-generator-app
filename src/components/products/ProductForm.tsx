import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Combobox } from '@/components/ui/combobox';
import { useProducts } from '@/contexts/ProductContext';
import { useMarcas } from '@/hooks/useMarcas';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';

const productSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  peso: z.string().min(1, 'Peso é obrigatório'),
  precoFardo: z.number().positive('Preço deve ser positivo'),
  precoUnitario: z.number().positive('Preço deve ser positivo'),
  qtdFardo: z.number().int().positive('Quantidade deve ser um número inteiro positivo'),
  marca: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  editingProduct?: Product;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ editingProduct, isEdit = false }) => {
  const { createProduct, updateProduct, uploadImage } = useProducts();
  const { marcas, createMarca } = useMarcas();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(editingProduct?.imagePath || null);
  const navigate = useNavigate();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: editingProduct?.nome || '',
      peso: editingProduct?.peso || '',
      precoFardo: editingProduct?.precoFardo || 0,
      precoUnitario: editingProduct?.precoUnitario || 0,
      qtdFardo: editingProduct?.qtdFardo || 0,
      marca: editingProduct?.marca || '',
    },
  });

  // Preparar opções de marcas para o combobox
  const marcaOptions = marcas.map(marca => ({
    value: marca.nome,
    label: marca.nome
  }));

  const handleCreateMarca = async (nome: string) => {
    const newMarca = await createMarca(nome);
    form.setValue('marca', newMarca.nome);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validação de tamanho
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 5MB');
        return;
      }

      // Validação de tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não suportado. Use: JPG, PNG, GIF ou WebP');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    // Reset file input
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSelectImage = () => {
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      let imagePath = editingProduct?.imagePath || null;
      
      if (selectedImage) {
        setIsUploadingImage(true);
        imagePath = await uploadImage(selectedImage);
        setIsUploadingImage(false);
      }
      
      if (isEdit && editingProduct) {
        await updateProduct(editingProduct.id, {
          ...data,
          imagePath
        });
        navigate(`/detalhes/${editingProduct.id}`);
      } else {
        const newProduct = await createProduct({
          nome: data.nome,
          peso: data.peso,
          precoFardo: data.precoFardo,
          precoUnitario: data.precoUnitario,
          qtdFardo: data.qtdFardo,
          marca: data.marca,
          imagePath
        });
        navigate(`/detalhes/${newProduct.id}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setIsUploadingImage(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Arroz Branco Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 5 kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="precoUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="precoFardo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço do Fardo (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="qtdFardo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade por Fardo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="6" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Combobox
                        options={marcaOptions}
                        value={field.value}
                        onSelect={field.onChange}
                        onCreateNew={handleCreateMarca}
                        placeholder="Selecionar marca..."
                        searchPlaceholder="Buscar marca..."
                        emptyText="Nenhuma marca encontrada"
                        createNewText="Criar marca"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="product-image">Imagem do Produto</FormLabel>
                
                {isUploadingImage && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload size={16} className="animate-pulse" />
                      Enviando imagem...
                    </div>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}
                
                <div className="mt-1 flex items-center gap-4">
                  {previewUrl && (
                    <div className="relative w-32 h-32 border rounded overflow-hidden flex items-center justify-center bg-muted">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={handleRemoveImage}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isUploadingImage}
                      onClick={handleSelectImage}
                    >
                      {isUploadingImage ? (
                        <>
                          <Upload size={16} className="mr-2 animate-pulse" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          {previewUrl ? (
                            <ImageIcon size={16} className="mr-2" />
                          ) : (
                            <Upload size={16} className="mr-2" />
                          )}
                          {previewUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
                        </>
                      )}
                    </Button>
                    <Input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} className="mr-2" />
                Voltar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
