import React, { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Save, Palette, FileImage } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { catalogConfig, updateCatalogConfig } = useProducts();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(catalogConfig.logoPath);
  const [bgColor, setBgColor] = useState(catalogConfig.corFundoPdf);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      // Em uma aplicação real, faríamos upload do logo primeiro
      // Aqui, usamos o preview direto (base64) para demonstração
      const logoPath = logoPreview || catalogConfig.logoPath;
      
      await updateCatalogConfig({
        logoPath,
        corFundoPdf: bgColor
      });
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Cores predefinidas para seleção rápida
  const predefinedColors = [
    { name: 'Azul Clássico', value: '#2563eb' },
    { name: 'Verde Empresarial', value: '#059669' },
    { name: 'Roxo Moderno', value: '#7c3aed' },
    { name: 'Vermelho Vibrante', value: '#dc2626' },
    { name: 'Laranja Energia', value: '#ea580c' },
    { name: 'Dourado Premium', value: '#d97706' },
    { name: 'Rosa Elegante', value: '#be185d' },
    { name: 'Azul Escuro', value: '#1e40af' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Configurações do Catálogo</h1>
          <p className="text-muted-foreground">Personalize a aparência do seu catálogo PDF</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurações de Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Logo da Empresa
            </CardTitle>
            <CardDescription>
              Faça upload do logo que aparecerá na capa do catálogo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoPreview && logoPreview !== '/placeholder.svg' && (
              <div className="flex justify-center">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Selecionar Logo</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  {logoPreview && logoPreview !== '/placeholder.svg' ? 'Alterar Logo' : 'Selecionar Logo'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Formatos aceitos: JPG, PNG, GIF (máx. 2MB)<br/>
                Recomendado: 300x300px ou proporção quadrada
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Configurações de Cor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Cor Principal
            </CardTitle>
            <CardDescription>
              Cor usada no cabeçalho, capa e elementos de destaque
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview da cor atual */}
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div 
                className="w-16 h-16 rounded-lg border shadow-sm" 
                style={{ backgroundColor: bgColor }}
              ></div>
              <div>
                <p className="font-medium">Cor Atual</p>
                <p className="text-sm text-muted-foreground">{bgColor}</p>
              </div>
            </div>
            
            {/* Seletor de cor personalizada */}
            <div className="space-y-2">
              <Label htmlFor="bg-color">Cor Personalizada</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Cores predefinidas */}
            <div className="space-y-2">
              <Label>Cores Predefinidas</Label>
              <div className="grid grid-cols-4 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setBgColor(color.value)}
                    className={`w-full h-10 rounded-md border-2 transition-all hover:scale-105 ${
                      bgColor === color.value ? 'border-primary border-2' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview do catálogo */}
      <Card>
        <CardHeader>
          <CardTitle>Prévia do Catálogo</CardTitle>
          <CardDescription>
            Veja como ficará a capa do seu catálogo com as configurações atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="relative w-full h-48 rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustColorBrightness(bgColor, -20)} 100%)`
            }}
          >
            {/* Elementos decorativos */}
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white opacity-10"></div>
            
            {/* Área central */}
            <div className="absolute inset-4 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center text-center p-4">
              {logoPreview && logoPreview !== '/placeholder.svg' && (
                <div className="mb-3">
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-1">CATÁLOGO</h3>
              <h4 className="text-lg text-gray-800 mb-2">DE PRODUTOS</h4>
              <div className="h-0.5 bg-yellow-500 w-12 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSubmitting}
          className="min-w-40"
          style={{
            backgroundColor: bgColor,
            borderColor: bgColor
          }}
        >
          <Save size={16} className="mr-2" />
          {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

// Função para ajustar brilho da cor (para gradiente)
const adjustColorBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
};

export default Settings;
