import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { useProducts } from '../../contexts/ProductContext';
import { FileDown, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency } from '../../lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export const PDFGenerator: React.FC = () => {
  const { products, catalogConfig } = useProducts();
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Função robusta para hexToRgb
  const hexToRgb = (hex: string | undefined | null) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
      return { r: 0, g: 0, b: 0 };
    }
    const cleanHex = hex.replace("#", "");
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex.split("").map((c) => c + c).join("");
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
      return { r: 0, g: 0, b: 0 };
    }
    const num = parseInt(fullHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Helper para truncar texto
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const generatePDF = async () => {
    if (!products.length) {
      toast.error('Não há produtos para gerar o catálogo');
      return;
    }

    setIsGenerating(true);
    toast.info('Gerando PDF, por favor aguarde...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add cover page
      const corFundo = hexToRgb(catalogConfig?.corFundoPdf);
      pdf.setFillColor(corFundo.r, corFundo.g, corFundo.b);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Add logo to cover if exists
      if (catalogConfig?.logoPath && catalogConfig.logoPath !== '/placeholder.svg') {
        const logoImg = document.createElement('img');
        const finalLogoSrc = catalogConfig.logoPath.startsWith('/uploads/')
          ? (import.meta.env.VITE_BACKEND_URL || '') + catalogConfig.logoPath
          : catalogConfig.logoPath;
        logoImg.src = finalLogoSrc;
        logoImg.crossOrigin = 'anonymous';

        console.log('[PDF] Tentando carregar logo:', {
          logoPath: catalogConfig.logoPath,
          finalLogoSrc,
        });

        await new Promise((resolve) => {
          logoImg.onload = () => {
            console.log('[PDF] Logo carregada:', {
              src: logoImg.src,
              naturalWidth: logoImg.naturalWidth,
              naturalHeight: logoImg.naturalHeight,
            });
            resolve(true);
          };
          logoImg.onerror = (e) => {
            console.error('[PDF] Erro ao carregar logo:', {
              src: logoImg.src,
              error: e,
            });
            resolve(false);
          };
          setTimeout(() => {
            console.warn('[PDF] Timeout ao carregar logo:', {
              src: logoImg.src,
              naturalWidth: logoImg.naturalWidth,
              naturalHeight: logoImg.naturalHeight,
            });
            resolve(false);
          }, 2000);
        });

        if (logoImg.naturalWidth === 0) {
          console.error('[PDF] Logo não carregada corretamente (naturalWidth=0):', logoImg.src);
        }

        // Adiciona a logo temporariamente ao DOM para o html2canvas funcionar
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.position = 'fixed';
        hiddenDiv.style.left = '-9999px';
        hiddenDiv.style.top = '0';
        hiddenDiv.appendChild(logoImg);
        document.body.appendChild(hiddenDiv);

        try {
          const logoCanvas = await html2canvas(logoImg, {
            allowTaint: true,
            useCORS: true
          });
          const logoImgData = logoCanvas.toDataURL('image/png');
          const logoWidth = 90; // mm
          const logoHeight = (logoCanvas.height * logoWidth) / logoCanvas.width;

          pdf.addImage(
            logoImgData,
            'PNG',
            (pageWidth - logoWidth) / 2,
            40,
            logoWidth,
            logoHeight
          );
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        } finally {
          // Remove a logo do DOM
          document.body.removeChild(hiddenDiv);
        }
      }

      // Add title to cover
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(24);
      pdf.text('CATÁLOGO DE PRODUTOS', pageWidth / 2, 100, { align: 'center' });

      // Add date to cover
      const today = new Date();
      pdf.setFontSize(12);
      pdf.text(`Gerado em ${today.toLocaleDateString('pt-BR')}`, pageWidth / 2, 120, { align: 'center' });

      // Function to add page header
      const addHeader = (pageNum: number) => {
        pdf.setFillColor(corFundo.r, corFundo.g, corFundo.b);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Catálogo de Produtos - Página ${pageNum}`, 10, 15);
      };

      // Start adding products on new page
      pdf.addPage();
      let currentPage = 2;
      addHeader(currentPage - 1);

      // Process products in rows of 2
      for (let i = 0; i < products.length; i += 2) {
        const yPos = 30 + (Math.floor(i / 2) % 3) * 80;

        // Check if we need a new page
        if (Math.floor(i / 2) % 3 === 0 && i > 0) {
          pdf.addPage();
          currentPage++;
          addHeader(currentPage - 1);
        }

        // Process current row (up to 2 products)
        for (let j = 0; j < 2; j++) {
          if (i + j < products.length) {
            const product = products[i + j];
            const xPos = 10 + j * (pageWidth / 2 - 15);

            // Product cell background
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(xPos, yPos, pageWidth / 2 - 20, 70, 2, 2, 'F');

            // Product name
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(truncateText(product.nome, 25), xPos + 5, yPos + 10);

            // Product details
            pdf.setFontSize(10);
            pdf.setTextColor(80, 80, 80);
            pdf.text(`Peso: ${product.peso}`, xPos + 5, yPos + 20);
            pdf.text(`Preço unitário: ${formatCurrency(product.precoUnitario)}`, xPos + 5, yPos + 30);
            pdf.text(`Preço fardo: ${formatCurrency(product.precoFardo)}`, xPos + 5, yPos + 40);
            pdf.text(`Qtd. por fardo: ${product.qtdFardo}`, xPos + 5, yPos + 50);

            // Try to add product image if available
            if (product.imagePath && product.imagePath !== '/placeholder.svg') {
              const imgPlaceholder = document.createElement('img');
              imgPlaceholder.src = product.imagePath.startsWith('/uploads/')
                ? (import.meta.env.VITE_BACKEND_URL || '') + product.imagePath
                : product.imagePath;
              imgPlaceholder.style.width = '300px';
              imgPlaceholder.style.height = '300px';
              imgPlaceholder.style.objectFit = 'contain';
              imgPlaceholder.crossOrigin = 'anonymous';

              console.log('Tentando carregar imagem:', imgPlaceholder.src);

              await new Promise((resolve) => {
                imgPlaceholder.onload = () => {
                  console.log('onload disparado:', imgPlaceholder.src, imgPlaceholder.naturalWidth, imgPlaceholder.naturalHeight);
                  resolve(true);
                };
                imgPlaceholder.onerror = (e) => {
                  console.error('onerror disparado:', imgPlaceholder.src, e);
                  resolve(false);
                };
                setTimeout(() => {
                  console.warn('Timeout de carregamento da imagem:', imgPlaceholder.src, imgPlaceholder.naturalWidth, imgPlaceholder.naturalHeight);
                  resolve(false);
                }, 3000);
              });

              if (imgPlaceholder.naturalWidth > 0) {
                // Insere a imagem temporariamente no DOM para o html2canvas funcionar
                const hiddenDiv = document.createElement('div');
                hiddenDiv.style.position = 'fixed';
                hiddenDiv.style.left = '-9999px';
                hiddenDiv.style.top = '0';
                hiddenDiv.appendChild(imgPlaceholder);
                document.body.appendChild(hiddenDiv);

                try {
                  const imgCanvas = await html2canvas(imgPlaceholder, {
                    allowTaint: true,
                    useCORS: true,
                    scale: 2 // aumenta a resolução do canvas
                  });
                  const imgData = imgCanvas.toDataURL('image/png');
                  pdf.addImage(
                    imgData,
                    'PNG',
                    xPos + (pageWidth / 2 - 20) - 35,
                    yPos + 10,
                    40, // aumenta o tamanho da imagem no PDF
                    40
                  );
                  console.log('Imagem renderizada com sucesso no PDF:', imgPlaceholder.src);
                } catch (e) {
                  console.error(`Error adding image for product ${product.nome}:`, e);
                } finally {
                  // Remove a imagem do DOM
                  document.body.removeChild(hiddenDiv);
                }
              } else {
                console.warn('Imagem não carregada corretamente (naturalWidth=0):', imgPlaceholder.src);
              }
            }
          }
        }
      }

      // Add footer to all pages
      const totalPages = currentPage;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${i} de ${totalPages}`, pageWidth - 15, pageHeight - 10);
        pdf.text(`Gerado em ${today.toLocaleDateString('pt-BR')}`, 15, pageHeight - 10);
      }

      // Save the PDF
      pdf.save('catalogo-produtos.pdf');
      toast.success('Catálogo PDF gerado com sucesso!');
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
            <DialogTitle>Prévia do Catálogo</DialogTitle>
            <DialogDescription>
              Prévia aproximada de como o catálogo aparecerá no PDF
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md p-4 mt-4 bg-card">
            {/* Capa do catálogo */}
            <div 
              className="w-full rounded-md p-8 mb-8 text-center"
              style={{backgroundColor: catalogConfig?.corFundoPdf}}
            >
              {catalogConfig?.logoPath && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={catalogConfig.logoPath} 
                    alt="Logo" 
                    className="max-h-24 object-contain"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold mb-4">CATÁLOGO DE PRODUTOS</h2>
              <p>{new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            {/* Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {products.map(product => (
                <div key={product.id} className="border rounded-md p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{product.nome}</h3>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p>Peso: {product.peso}</p>
                        <p>Preço unitário: {formatCurrency(product.precoUnitario)}</p>
                        <p>Preço fardo: {formatCurrency(product.precoFardo)}</p>
                        <p>Qtd. por fardo: {product.qtdFardo}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <img 
                        src={product.imagePath} 
                        alt={product.nome} 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
              <Download size={16} />
              {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        onClick={generatePDF} 
        disabled={isGenerating} 
        className="gap-2"
      >
        <FileDown size={16} />
        {isGenerating ? 'Gerando...' : 'Gerar Catálogo PDF'}
      </Button>

      {/* Hidden content for PDF generation */}
      <div className="hidden">
        <div id="pdf-content-wrapper" ref={pdfContentRef}></div>
      </div>
    </>
  );
};
