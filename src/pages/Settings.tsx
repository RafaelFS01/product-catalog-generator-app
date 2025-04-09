
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
import { Upload, Save } from 'lucide-react';

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
      // In a real app, we would upload the logo first if it changed
      // let logoPath = catalogConfig.logoPath;
      // if (logoFile) {
      //   // Upload logo and get path
      //   const formData = new FormData();
      //   formData.append('logoImage', logoFile);
      //   const response = await fetch('API_URL/upload-logo', {
      //     method: 'POST',
      //     body: formData
      //   });
      //   const data = await response.json();
      //   logoPath = data.filePath;
      // }
      
      // For demo, just use the same path or preview
      const logoPath = logoPreview || catalogConfig.logoPath;
      
      await updateCatalogConfig({
        logoPath,
        corFundoPdf: bgColor
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações do Catálogo</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Aparência do PDF</CardTitle>
          <CardDescription>
            Personalize como seu catálogo PDF será gerado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Logo da Empresa</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-muted">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      <Upload size={16} className="mr-2" />
                      {logoPreview ? 'Trocar Logo' : 'Selecionar Logo'}
                    </Button>
                  </label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG (máx. 2MB)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bg-color">Cor de Fundo</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded border shadow-sm" 
                  style={{ backgroundColor: bgColor }}
                ></div>
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Essa cor será usada no cabeçalho e capa do catálogo PDF
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSubmitting}
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
