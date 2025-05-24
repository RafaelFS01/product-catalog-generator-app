import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/contexts/ProductContext';
import { FileDown, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PDFGeneratorProps {
  products?: Product[];
  label?: string;
}

// Cores base (serão sobrescritas pelas configurações)
const defaultColors = {
  primary: '#2563eb',      // Azul moderno
  secondary: '#64748b',    // Cinza azulado
  accent: '#f59e0b',       // Dourado
  success: '#10b981',      // Verde
  background: '#f8fafc',   // Cinza muito claro
  white: '#ffffff',
  dark: '#1e293b',
  lightGray: '#e2e8f0',
  text: '#334155',
  muted: '#64748b'
};

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  products: customProducts, 
  label = "Gerar Catálogo PDF" 
}) => {
  const { products: allProducts, catalogConfig } = useProducts();
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Use produtos customizados se fornecidos, senão use todos os produtos
  const productsToExport = customProducts || allProducts;
  
  // Usar cor configurada ou padrão
  const colors = {
    ...defaultColors,
    primary: catalogConfig.corFundoPdf || defaultColors.primary
  };
  
  const generatePDF = async () => {
    if (!productsToExport.length) {
      toast.error('Não há produtos para gerar o catálogo');
      return;
    }
    
    setIsGenerating(true);
    const productCount = productsToExport.length;
    const isFiltered = customProducts && customProducts.length !== allProducts.length;
    
    toast.info('Gerando catálogo PDF, por favor aguarde...');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // === CAPA MODERNA COM CONFIGURAÇÕES ===
      const primaryRgb = hexToRgb(colors.primary);
      const secondaryRgb = hexToRgb(colors.secondary);
      
      // Criar gradiente manual usando a cor configurada
      pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Adicionar camadas para simular gradiente
      for (let i = 0; i < 20; i++) {
        const ratio = i / 20;
        const r = Math.round(primaryRgb.r + (secondaryRgb.r - primaryRgb.r) * ratio);
        const g = Math.round(primaryRgb.g + (secondaryRgb.g - primaryRgb.g) * ratio);
        const b = Math.round(primaryRgb.b + (secondaryRgb.b - primaryRgb.b) * ratio);
        
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i * (pageHeight / 20), pageWidth, pageHeight / 20, 'F');
      }
      
      // Elementos decorativos geométricos
      pdf.setFillColor(255, 255, 255);
      pdf.circle(pageWidth * 0.8, pageHeight * 0.2, 25, 'F');
      pdf.setFillColor(255, 255, 255);
      pdf.circle(pageWidth * 0.2, pageHeight * 0.7, 15, 'F');
      
      // Área principal da capa com fundo branco
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(25, 50, pageWidth - 50, pageHeight - 100, 8, 8, 'F');
      
      // Logo centralizado (CORRIGIDO)
      if (catalogConfig.logoPath && catalogConfig.logoPath !== '/placeholder.svg') {
        try {
          // Usar método direto para carregamento do logo
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          // Aguardar carregamento do logo
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject(new Error('Failed to load logo'));
            logoImg.src = catalogConfig.logoPath;
            
            // Timeout para evitar travamento
            setTimeout(() => reject(new Error('Logo load timeout')), 3000);
          });
          
          // Converter logo para base64
          const logoCanvas = document.createElement('canvas');
          const logoCtx = logoCanvas.getContext('2d');
          if (logoCtx) {
            logoCanvas.width = 200; // Resolução fixa para logo
            logoCanvas.height = 150;
            
            // Fundo branco
            logoCtx.fillStyle = '#ffffff';
            logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
            
            // Desenhar logo centralizado
            const logoScale = Math.min(logoCanvas.width / logoImg.width, logoCanvas.height / logoImg.height);
            const logoScaledWidth = logoImg.width * logoScale;
            const logoScaledHeight = logoImg.height * logoScale;
            const logoOffsetX = (logoCanvas.width - logoScaledWidth) / 2;
            const logoOffsetY = (logoCanvas.height - logoScaledHeight) / 2;
            
            logoCtx.drawImage(logoImg, logoOffsetX, logoOffsetY, logoScaledWidth, logoScaledHeight);
            
            const logoData = logoCanvas.toDataURL('image/png', 0.8);
            
            const logoWidth = 40;
            const logoHeight = 30;
            
            pdf.addImage(
              logoData, 
              'PNG', 
              (pageWidth - logoWidth) / 2, 
              80, 
              logoWidth, 
              logoHeight
            );
          }
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }
      
      // Título principal com tipografia elegante
      pdf.setTextColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
      pdf.setFontSize(28);
      pdf.setFont(undefined, 'bold');
      pdf.text('CATALOGO', pageWidth / 2, 140, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'normal');
      pdf.text('DE PRODUTOS', pageWidth / 2, 155, { align: 'center' });
      
      // Linha decorativa
      pdf.setDrawColor(hexToRgb(colors.accent).r, hexToRgb(colors.accent).g, hexToRgb(colors.accent).b);
      pdf.setLineWidth(2);
      pdf.line(pageWidth / 2 - 25, 165, pageWidth / 2 + 25, 165);
      
      // Informações do catálogo em box estilizado (SEM CONTADOR)
      pdf.setFillColor(hexToRgb(colors.background).r, hexToRgb(colors.background).g, hexToRgb(colors.background).b);
      pdf.roundedRect(45, 180, pageWidth - 90, 40, 4, 4, 'F');
      
      pdf.setTextColor(hexToRgb(colors.text).r, hexToRgb(colors.text).g, hexToRgb(colors.text).b);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('CATÁLOGO PREMIUM', pageWidth / 2, 195, { align: 'center' });
      
      // Data
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(hexToRgb(colors.muted).r, hexToRgb(colors.muted).g, hexToRgb(colors.muted).b);
      const today = new Date();
      pdf.text(`Gerado em ${today.toLocaleDateString('pt-BR')}`, pageWidth / 2, 210, { align: 'center' });
      
      // Função para adicionar cabeçalho moderno com cor configurada
      const addModernHeader = (pageNum: number) => {
        // Faixa do cabeçalho
        pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        
        // Linha de destaque
        pdf.setFillColor(hexToRgb(colors.accent).r, hexToRgb(colors.accent).g, hexToRgb(colors.accent).b);
        pdf.rect(0, 18, pageWidth, 2, 'F');
        
        // Texto do cabeçalho
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text('CATALOGO DE PRODUTOS', 15, 13);
        
        // Número da página em círculo (SEM CONTADOR DE PRODUTOS)
        pdf.setFillColor(255, 255, 255);
        pdf.circle(pageWidth - 20, 10, 6, 'F');
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${pageNum}`, pageWidth - 20, 12, { align: 'center' });
      };
      
      // Função para adicionar rodapé moderno
      const addModernFooter = (pageNum: number, totalPages: number) => {
        const footerY = pageHeight - 10;
        
        // Linha decorativa
        pdf.setDrawColor(hexToRgb(colors.lightGray).r, hexToRgb(colors.lightGray).g, hexToRgb(colors.lightGray).b);
        pdf.setLineWidth(0.5);
        pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
        
        // Informações do rodapé
        pdf.setTextColor(hexToRgb(colors.muted).r, hexToRgb(colors.muted).g, hexToRgb(colors.muted).b);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${today.toLocaleDateString('pt-BR')}`, 15, footerY);
        pdf.text(`Pagina ${pageNum} de ${totalPages}`, pageWidth - 15, footerY, { align: 'right' });
      };
      
      // === PÁGINAS DOS PRODUTOS OTIMIZADAS ===
      pdf.addPage();
      let currentPage = 2;
      addModernHeader(currentPage - 1);
      
      // Layout otimizado - cards maiores e melhor uso do espaço
      const productsPerPage = 4; // 2x2 grid
      const cardWidth = (pageWidth - 30) / 2 - 5; // Margens reduzidas
      const cardHeight = 100; // Altura aumentada
      
      for (let i = 0; i < productsToExport.length; i += productsPerPage) {
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          addModernHeader(currentPage - 1);
        }
        
        // Processar até 4 produtos por página (2x2)
        for (let j = 0; j < productsPerPage && i + j < productsToExport.length; j++) {
          const product = productsToExport[i + j];
          const col = j % 2;
          const row = Math.floor(j / 2);
          const xPos = 15 + col * (cardWidth + 10); // Margens reduzidas
          const yPos = 30 + row * (cardHeight + 8); // Espaçamento reduzido
          
          // === CARD DO PRODUTO OTIMIZADO ===
          
          // Sombra do card
          pdf.setFillColor(200, 200, 200);
          pdf.roundedRect(xPos + 1, yPos + 1, cardWidth, cardHeight, 4, 4, 'F');
          
          // Card principal
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(xPos, yPos, cardWidth, cardHeight, 4, 4, 'F');
          
          // Borda sutil
          pdf.setDrawColor(hexToRgb(colors.lightGray).r, hexToRgb(colors.lightGray).g, hexToRgb(colors.lightGray).b);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(xPos, yPos, cardWidth, cardHeight, 4, 4, 'S');
          
          // Cabeçalho do produto
          pdf.setFillColor(hexToRgb(colors.background).r, hexToRgb(colors.background).g, hexToRgb(colors.background).b);
          pdf.roundedRect(xPos, yPos, cardWidth, 18, 4, 4, 'F');
          pdf.rect(xPos, yPos + 14, cardWidth, 4, 'F');
          
          // Nome do produto (fonte maior)
          pdf.setTextColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(truncateText(product.nome, 24), xPos + 8, yPos + 12);
          
          // === NOVA ORGANIZAÇÃO: IMAGEM EM CIMA ===
          
          // Área da imagem centralizada no topo
          const imgAreaY = yPos + 22;
          const imgSize = 35;
          const imgX = xPos + (cardWidth - imgSize) / 2; // Centralizar horizontalmente
          
          // Tentar carregar e exibir a imagem (SEM CORS)
          let imageLoaded = false;
          if (product.imagePath && product.imagePath !== '/placeholder.svg') {
            try {
              // Método mais direto para carregar imagem (SEM CORS)
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              // Aguardar carregamento da imagem
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = product.imagePath;
                
                // Timeout para evitar travamento
                setTimeout(() => reject(new Error('Image load timeout')), 2000);
              });
              
              // Converter para base64
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = imgSize * 3; // Resolução maior
                canvas.height = imgSize * 3;
                
                // Fundo branco
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Desenhar imagem centralizada
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const offsetX = (canvas.width - scaledWidth) / 2;
                const offsetY = (canvas.height - scaledHeight) / 2;
                
                ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
                
                const imgData = canvas.toDataURL('image/png', 0.8);
                
                // Fundo da imagem
                pdf.setFillColor(hexToRgb(colors.background).r, hexToRgb(colors.background).g, hexToRgb(colors.background).b);
                pdf.roundedRect(imgX - 2, imgAreaY - 2, imgSize + 4, imgSize + 4, 2, 2, 'F');
                
                // Adicionar imagem ao PDF
                pdf.addImage(imgData, 'PNG', imgX, imgAreaY, imgSize, imgSize);
                imageLoaded = true;
              }
            } catch (e) {
              console.warn(`Imagem não carregada para ${product.nome}, usando placeholder`);
              imageLoaded = false;
            }
          }
          
          // Se não carregou a imagem, mostrar placeholder
          if (!imageLoaded) {
            pdf.setFillColor(hexToRgb(colors.lightGray).r, hexToRgb(colors.lightGray).g, hexToRgb(colors.lightGray).b);
            pdf.roundedRect(imgX, imgAreaY, imgSize, imgSize, 2, 2, 'F');
            pdf.setTextColor(hexToRgb(colors.muted).r, hexToRgb(colors.muted).g, hexToRgb(colors.muted).b);
            pdf.setFontSize(10);
            pdf.text('IMG', imgX + imgSize/2, imgAreaY + imgSize/2 + 2, { align: 'center' });
          }
          
          // === INFORMAÇÕES EMBAIXO DA IMAGEM ===
          
          let detailY = imgAreaY + imgSize + 8; // Começar abaixo da imagem
          
          // Marca (se existir)
          if (product.marca) {
            pdf.setFontSize(9);
            pdf.setTextColor(hexToRgb(colors.muted).r, hexToRgb(colors.muted).g, hexToRgb(colors.muted).b);
            pdf.setFont(undefined, 'italic');
            pdf.text(`Marca: ${truncateText(product.marca, 20)}`, xPos + 8, detailY, { align: 'left' });
            detailY += 8;
          }
          
          // Peso
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(hexToRgb(colors.text).r, hexToRgb(colors.text).g, hexToRgb(colors.text).b);
          pdf.text(`Peso: ${product.peso}`, xPos + 8, detailY);
          detailY += 8;
          
          // Preços em destaque
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(hexToRgb(colors.success).r, hexToRgb(colors.success).g, hexToRgb(colors.success).b);
          pdf.text(`Unit: ${formatCurrency(product.precoUnitario)}`, xPos + 8, detailY);
          
          // Preço do fardo ao lado
          pdf.setTextColor(hexToRgb(colors.accent).r, hexToRgb(colors.accent).g, hexToRgb(colors.accent).b);
          pdf.text(`Fardo: ${formatCurrency(product.precoFardo)}`, xPos + cardWidth/2 + 4, detailY);
          detailY += 8;
          
          // Quantidade por fardo
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(hexToRgb(colors.text).r, hexToRgb(colors.text).g, hexToRgb(colors.text).b);
          pdf.text(`Qtd/Fardo: ${product.qtdFardo}`, xPos + 8, detailY);
        }
      }
      
      // Adicionar rodapés a todas as páginas
      const totalPages = currentPage;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i > 1) { // Não adicionar rodapé na capa
          addModernFooter(i - 1, totalPages - 1);
        }
      }
      
      // Salvar com nome apropriado
      const filename = isFiltered 
        ? 'catalogo-produtos-premium-filtrado.pdf' 
        : 'catalogo-produtos-premium.pdf';
      
      pdf.save(filename);
      toast.success('Catálogo Premium gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Abre o preview do PDF
  const openPreview = () => {
    setPreviewOpen(true);
  };
  
  return (
    <>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={openPreview} className="gap-2">
            <FileText size={16} />
            Visualizar Catálogo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévia do Catálogo Premium</DialogTitle>
            <DialogDescription>
              Prévia aproximada de como o catálogo premium aparecerá no PDF
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 mt-4 bg-card">
            {/* Capa do catálogo com cor configurada */}
            <div 
              className="w-full rounded-lg p-8 mb-8 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                color: 'white'
              }}
            >
              {/* Elementos decorativos */}
              <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-white opacity-10"></div>
              
              <div className="bg-white bg-opacity-95 rounded-lg p-6 text-gray-800 mx-4">
                {catalogConfig.logoPath && catalogConfig.logoPath !== '/placeholder.svg' && (
                  <div className="flex justify-center mb-6">
                    <img 
                      src={catalogConfig.logoPath} 
                      alt="Logo" 
                      className="max-h-20 object-contain"
                    />
                  </div>
                )}
                <h2 className="text-3xl font-bold mb-2">CATÁLOGO</h2>
                <h3 className="text-2xl mb-4">DE PRODUTOS</h3>
                <div className="h-0.5 bg-yellow-500 w-16 mx-auto mb-4"></div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-lg">
                    CATÁLOGO PREMIUM
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Gerado em {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            {/* Produtos com layout melhorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {productsToExport.slice(0, 8).map(product => (
                <div key={product.id} className="border rounded-lg shadow-md overflow-hidden bg-white">
                  {/* Cabeçalho do card */}
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-bold text-gray-800 text-lg">{product.nome}</h3>
                    {product.marca && (
                      <p className="text-sm text-gray-600 italic">Marca: {product.marca}</p>
                    )}
                  </div>
                  
                  {/* Layout vertical: imagem em cima, informações embaixo */}
                  <div className="p-4">
                    {/* Imagem centralizada no topo */}
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                        <img 
                          src={product.imagePath} 
                          alt={product.nome} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-lg hidden">
                          IMG
                        </div>
                      </div>
                    </div>
                    
                    {/* Informações embaixo da imagem */}
                    <div className="space-y-2 text-sm text-center">
                      <p className="text-gray-700 font-medium">Peso: {product.peso}</p>
                      <div className="flex justify-between">
                        <p className="text-green-600 font-bold">Unit: {formatCurrency(product.precoUnitario)}</p>
                        <p className="text-yellow-600 font-bold">Fardo: {formatCurrency(product.precoFardo)}</p>
                      </div>
                      <p className="text-gray-600">Qtd/Fardo: {product.qtdFardo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {productsToExport.length > 8 && (
              <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700">
                  ... e mais produtos no PDF completo
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Fechar
            </Button>
            <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
              <Download size={16} />
              {isGenerating ? 'Gerando...' : 'Baixar PDF Premium'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button 
        onClick={generatePDF} 
        disabled={isGenerating} 
        className="gap-2"
        style={{
          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
          border: 'none'
        }}
      >
        <FileDown size={16} />
        {isGenerating ? 'Gerando...' : 'Gerar Catálogo Premium'}
      </Button>
      
      {/* Hidden content for PDF generation */}
      <div className="hidden">
        <div id="pdf-content-wrapper" ref={pdfContentRef}></div>
      </div>
    </>
  );
};

// Helper function to convert hex to rgb
const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default PDFGenerator;
