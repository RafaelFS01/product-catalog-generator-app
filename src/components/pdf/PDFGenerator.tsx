
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
  
  const generatePDF = async () => {
    if (!productsToExport.length) {
      toast.error('Não há produtos para gerar o catálogo');
      return;
    }
    
    setIsGenerating(true);
    const productCount = productsToExport.length;
    const isFiltered = customProducts && customProducts.length !== allProducts.length;
    
    toast.info(`Gerando catálogo premium com ${productCount} produto${productCount !== 1 ? 's' : ''}${isFiltered ? ' (filtrado)' : ''}, por favor aguarde...`);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Cores do sistema
      const colors = {
        primary: [37, 99, 235], // #2563eb
        secondary: [100, 116, 139], // #64748b
        accent: [245, 158, 11], // #f59e0b
        success: [16, 185, 129], // #10b981
        background: [248, 250, 252], // #f8fafc
        white: [255, 255, 255],
        dark: [30, 41, 59] // #1e293b
      };
      
      // === CAPA ELEGANTE ===
      // Gradiente de fundo
      const gradientSteps = 50;
      for (let i = 0; i < gradientSteps; i++) {
        const ratio = i / gradientSteps;
        const r = colors.primary[0] + (colors.background[0] - colors.primary[0]) * ratio;
        const g = colors.primary[1] + (colors.background[1] - colors.primary[1]) * ratio;
        const b = colors.primary[2] + (colors.background[2] - colors.primary[2]) * ratio;
        
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i * (pageHeight / gradientSteps), pageWidth, pageHeight / gradientSteps + 1, 'F');
      }
      
      // Elementos decorativos - círculos geométricos
      pdf.setFillColor(255, 255, 255, 0.1);
      pdf.circle(pageWidth * 0.8, pageHeight * 0.2, 30, 'F');
      pdf.circle(pageWidth * 0.2, pageHeight * 0.7, 20, 'F');
      pdf.circle(pageWidth * 0.9, pageHeight * 0.8, 15, 'F');
      
      // Logo se existir
      if (catalogConfig.logoPath && catalogConfig.logoPath !== '/placeholder.svg') {
        try {
          const logoImg = document.createElement('img');
          logoImg.src = catalogConfig.logoPath;
          logoImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve) => {
            logoImg.onload = resolve;
            setTimeout(resolve, 1000);
          });
          
          const logoCanvas = await html2canvas(logoImg, { 
            allowTaint: true,
            useCORS: true
          });
          const logoImgData = logoCanvas.toDataURL('image/png');
          
          const logoWidth = 50;
          const logoHeight = (logoCanvas.height * logoWidth) / logoCanvas.width;
          
          pdf.addImage(
            logoImgData, 
            'PNG', 
            (pageWidth - logoWidth) / 2, 
            30, 
            logoWidth, 
            logoHeight
          );
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }
      
      // Título hierárquico
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.text('CATÁLOGO', pageWidth / 2, 100, { align: 'center' });
      pdf.setFontSize(24);
      pdf.text('DE PRODUTOS', pageWidth / 2, 115, { align: 'center' });
      
      // Linha decorativa dourada
      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(2);
      pdf.line(pageWidth / 2 - 40, 125, pageWidth / 2 + 40, 125);
      
      // Box informativo
      pdf.setFillColor(255, 255, 255, 0.95);
      pdf.roundedRect(pageWidth / 2 - 60, 140, 120, 50, 5, 5, 'F');
      
      // Borda do box
      pdf.setDrawColor(...colors.accent);
      pdf.setLineWidth(1);
      pdf.roundedRect(pageWidth / 2 - 60, 140, 120, 50, 5, 5, 'S');
      
      // Informações no box
      pdf.setTextColor(...colors.dark);
      pdf.setFontSize(14);
      const subtitle = isFiltered 
        ? `📦 ${productCount} produto${productCount !== 1 ? 's' : ''} selecionado${productCount !== 1 ? 's' : ''}`
        : `📦 ${productCount} produto${productCount !== 1 ? 's' : ''} cadastrado${productCount !== 1 ? 's' : ''}`;
      pdf.text(subtitle, pageWidth / 2, 155, { align: 'center' });
      
      const today = new Date();
      pdf.setFontSize(12);
      pdf.text(`📅 ${today.toLocaleDateString('pt-BR')}`, pageWidth / 2, 170, { align: 'center' });
      
      // Função para adicionar cabeçalho moderno
      const addModernHeader = (pageNum: number) => {
        // Faixa azul
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        
        // Linha dourada
        pdf.setFillColor(...colors.accent);
        pdf.rect(0, 20, pageWidth, 2, 'F');
        
        // Ícone e título
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('📚 Catálogo de Produtos', 15, 15);
        
        // Número da página em círculo
        pdf.setFillColor(...colors.accent);
        pdf.circle(pageWidth - 20, 11, 8, 'F');
        
        pdf.setTextColor(...colors.dark);
        pdf.setFontSize(10);
        pdf.text(`${pageNum}`, pageWidth - 20, 14, { align: 'center' });
        
        if (isFiltered) {
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          pdf.text(`(${productCount} filtrados)`, pageWidth - 55, 15, { align: 'right' });
        }
      };
      
      // Função para adicionar rodapé elegante
      const addModernFooter = (currentPage: number, totalPages: number) => {
        // Linha decorativa
        pdf.setFillColor(...colors.accent);
        pdf.rect(15, pageHeight - 15, pageWidth - 30, 1, 'F');
        
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.secondary);
        pdf.text(`📅 Gerado em ${today.toLocaleDateString('pt-BR')}`, 15, pageHeight - 8);
        pdf.text(`${currentPage} de ${totalPages}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
      };
      
      // Iniciar páginas de produtos
      pdf.addPage();
      let currentPage = 2;
      addModernHeader(currentPage - 1);
      
      // Layout 2x2 (4 produtos por página)
      const productsPerPage = 4;
      let productIndex = 0;
      
      for (let i = 0; i < productsToExport.length; i += productsPerPage) {
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          addModernHeader(currentPage - 1);
        }
        
        // Processar até 4 produtos por página
        for (let j = 0; j < productsPerPage && (i + j) < productsToExport.length; j++) {
          const product = productsToExport[i + j];
          
          // Posições para layout 2x2
          const col = j % 2;
          const row = Math.floor(j / 2);
          const cardWidth = (pageWidth - 40) / 2;
          const cardHeight = 85;
          const xPos = 15 + col * (cardWidth + 10);
          const yPos = 35 + row * (cardHeight + 15);
          
          // Card com sombra
          pdf.setFillColor(200, 200, 200, 0.3);
          pdf.roundedRect(xPos + 2, yPos + 2, cardWidth, cardHeight, 3, 3, 'F');
          
          // Card principal
          pdf.setFillColor(...colors.white);
          pdf.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'F');
          
          // Borda sutil
          pdf.setDrawColor(...colors.background);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'S');
          
          // Cabeçalho colorido do card
          pdf.setFillColor(...colors.primary);
          pdf.roundedRect(xPos, yPos, cardWidth, 15, 3, 3, 'F');
          pdf.rect(xPos, yPos + 10, cardWidth, 5, 'F');
          
          // Nome do produto no cabeçalho
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          const truncatedName = truncateText(product.nome, 30);
          pdf.text(truncatedName, xPos + 5, yPos + 10);
          
          // Área de conteúdo
          let contentY = yPos + 22;
          
          // Coluna da esquerda - informações
          pdf.setTextColor(...colors.dark);
          pdf.setFontSize(8);
          
          if (product.marca) {
            pdf.setTextColor(...colors.secondary);
            pdf.text(`🏷️ ${product.marca}`, xPos + 5, contentY);
            contentY += 8;
          }
          
          pdf.setTextColor(...colors.dark);
          pdf.text(`⚖️ ${product.peso}`, xPos + 5, contentY);
          contentY += 8;
          
          // Preços com cores diferenciadas
          pdf.setTextColor(...colors.success);
          pdf.text(`💰 ${formatCurrency(product.precoUnitario)}`, xPos + 5, contentY);
          contentY += 8;
          
          pdf.setTextColor(...colors.accent);
          pdf.text(`📦 ${formatCurrency(product.precoFardo)}`, xPos + 5, contentY);
          contentY += 8;
          
          pdf.setTextColor(...colors.secondary);
          pdf.text(`🔢 ${product.qtdFardo} unidades`, xPos + 5, contentY);
          
          // Área da imagem (lado direito)
          const imgAreaX = xPos + cardWidth - 35;
          const imgAreaY = yPos + 20;
          const imgSize = 30;
          
          // Fundo sutil para imagem
          pdf.setFillColor(...colors.background);
          pdf.roundedRect(imgAreaX, imgAreaY, imgSize, imgSize, 2, 2, 'F');
          
          // Tentar adicionar imagem do produto
          if (product.imagePath && product.imagePath !== '/placeholder.svg') {
            try {
              const imgElement = document.createElement('img');
              imgElement.src = product.imagePath;
              imgElement.crossOrigin = 'anonymous';
              
              await new Promise((resolve) => {
                imgElement.onload = resolve;
                setTimeout(resolve, 500);
              });
              
              const imgCanvas = await html2canvas(imgElement, {
                allowTaint: true,
                useCORS: true,
                width: 100,
                height: 100
              });
              const imgData = imgCanvas.toDataURL('image/png');
              
              pdf.addImage(
                imgData, 
                'PNG', 
                imgAreaX + 2, 
                imgAreaY + 2,
                imgSize - 4, 
                imgSize - 4
              );
            } catch (e) {
              console.error(`Error adding image for product ${product.nome}:`, e);
              // Placeholder icon
              pdf.setTextColor(...colors.secondary);
              pdf.setFontSize(16);
              pdf.text('📷', imgAreaX + imgSize/2, imgAreaY + imgSize/2 + 3, { align: 'center' });
            }
          } else {
            // Placeholder icon
            pdf.setTextColor(...colors.secondary);
            pdf.setFontSize(16);
            pdf.text('📷', imgAreaX + imgSize/2, imgAreaY + imgSize/2 + 3, { align: 'center' });
          }
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
      
      // Salvar com nome premium
      const filename = isFiltered 
        ? `catalogo-produtos-premium-filtrado-${productCount}.pdf` 
        : 'catalogo-produtos-premium.pdf';
      
      pdf.save(filename);
      toast.success(`Catálogo premium gerado com sucesso! (${productCount} produto${productCount !== 1 ? 's' : ''})`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const openPreview = () => {
    setPreviewOpen(true);
  };
  
  // Limitar preview para os primeiros 8 produtos
  const previewProducts = productsToExport.slice(0, 8);
  const remainingCount = Math.max(0, productsToExport.length - 8);
  
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
            <DialogTitle>📚 Prévia do Catálogo Premium</DialogTitle>
            <DialogDescription>
              Prévia aproximada de como o catálogo aparecerá no PDF premium
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 mt-4 bg-gradient-to-br from-blue-50 to-slate-50">
            {/* Capa moderna */}
            <div 
              className="w-full rounded-md p-8 mb-8 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #f8fafc 100%)',
                minHeight: '200px'
              }}
            >
              {/* Elementos decorativos */}
              <div className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-8 left-4 w-10 h-10 bg-white/10 rounded-full"></div>
              <div className="absolute top-1/2 right-4 w-6 h-6 bg-white/10 rounded-full"></div>
              
              {catalogConfig.logoPath && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={catalogConfig.logoPath} 
                    alt="Logo" 
                    className="max-h-16 object-contain drop-shadow-lg"
                  />
                </div>
              )}
              
              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2">CATÁLOGO</h1>
                <h2 className="text-xl font-semibold text-white/90 mb-4">DE PRODUTOS</h2>
                
                {/* Linha decorativa */}
                <div className="w-20 h-0.5 bg-amber-400 mx-auto mb-6"></div>
                
                {/* Box informativo */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mx-auto max-w-xs border border-amber-200">
                  <p className="text-sm text-slate-700 mb-2">
                    📦 {productsToExport.length} produto{productsToExport.length !== 1 ? 's' : ''} 
                    {previewProducts.length < productsToExport.length ? ' (mostrando 8)' : ''}
                  </p>
                  <p className="text-xs text-slate-600">
                    📅 {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Produtos em grid 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {previewProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Cabeçalho colorido */}
                  <div className="bg-blue-600 text-white p-2">
                    <h3 className="text-sm font-medium truncate">{product.nome}</h3>
                  </div>
                  
                  <div className="p-3 flex justify-between items-start">
                    <div className="flex-1 space-y-1">
                      {product.marca && (
                        <p className="text-xs text-slate-600">🏷️ {product.marca}</p>
                      )}
                      <p className="text-xs text-slate-700">⚖️ {product.peso}</p>
                      <p className="text-xs text-green-600 font-medium">💰 {formatCurrency(product.precoUnitario)}</p>
                      <p className="text-xs text-amber-600 font-medium">📦 {formatCurrency(product.precoFardo)}</p>
                      <p className="text-xs text-slate-500">🔢 {product.qtdFardo} unidades</p>
                    </div>
                    
                    <div className="ml-3 w-12 h-12 bg-slate-50 rounded border flex items-center justify-center flex-shrink-0">
                      {product.imagePath && product.imagePath !== '/placeholder.svg' ? (
                        <img 
                          src={product.imagePath} 
                          alt={product.nome} 
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <span className="text-slate-400 text-lg">📷</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {remainingCount > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                <p className="text-sm text-blue-700">
                  + {remainingCount} produto{remainingCount !== 1 ? 's' : ''} adiciona{remainingCount === 1 ? 'l' : 'is'} no PDF completo
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Download size={16} />
              {isGenerating ? 'Gerando...' : 'Baixar PDF Premium'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button 
        onClick={generatePDF} 
        disabled={isGenerating} 
        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
