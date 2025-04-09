
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/contexts/ProductContext';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency } from '@/lib/utils';

export const PDFGenerator: React.FC = () => {
  const { products, catalogConfig } = useProducts();
  const pdfContentRef = useRef<HTMLDivElement>(null);
  
  const generatePDF = async () => {
    if (!products.length) {
      toast.error('Não há produtos para gerar o catálogo');
      return;
    }
    
    toast.info('Gerando PDF, por favor aguarde...');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add cover page
      pdf.setFillColor(hexToRgb(catalogConfig.corFundoPdf).r, hexToRgb(catalogConfig.corFundoPdf).g, hexToRgb(catalogConfig.corFundoPdf).b);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add title to cover
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(24);
      pdf.text('CATÁLOGO DE PRODUTOS', pageWidth / 2, 80, { align: 'center' });
      
      // Add date to cover
      const today = new Date();
      pdf.setFontSize(12);
      pdf.text(`Gerado em ${today.toLocaleDateString('pt-BR')}`, pageWidth / 2, 100, { align: 'center' });
      
      // Render each product
      if (pdfContentRef.current) {
        let currentPage = 1;
        
        // Function to add page header
        const addHeader = (pageNum: number) => {
          pdf.setFillColor(hexToRgb(catalogConfig.corFundoPdf).r, hexToRgb(catalogConfig.corFundoPdf).g, hexToRgb(catalogConfig.corFundoPdf).b);
          pdf.rect(0, 0, pageWidth, 20, 'F');
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.text(`Catálogo de Produtos - Página ${pageNum}`, 10, 15);
        };
        
        // Start adding products on new page
        pdf.addPage();
        currentPage++;
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
              pdf.text(product.nome, xPos + 5, yPos + 10);
              
              // Product details
              pdf.setFontSize(10);
              pdf.setTextColor(80, 80, 80);
              pdf.text(`Peso: ${product.peso}`, xPos + 5, yPos + 20);
              pdf.text(`Preço unitário: ${formatCurrency(product.precoUnitario)}`, xPos + 5, yPos + 30);
              pdf.text(`Preço fardo: ${formatCurrency(product.precoFardo)}`, xPos + 5, yPos + 40);
              pdf.text(`Qtd. por fardo: ${product.qtdFardo}`, xPos + 5, yPos + 50);
              
              // For real implementation, would need to handle images properly
              // This is just a placeholder approach
              // In real app, would need to fetch and convert images to dataURL
            }
          }
        }
        
        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Gerado por Sistema de Catálogo de Produtos em ${today.toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Save the PDF
        pdf.save('catalogo-produtos.pdf');
        toast.success('Catálogo PDF gerado com sucesso!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    }
  };
  
  return (
    <>
      <Button onClick={generatePDF} className="gap-2">
        <FileDown size={16} />
        Gerar Catálogo PDF
      </Button>
      
      {/* Hidden content for PDF generation */}
      <div className="hidden">
        <div id="pdf-content-wrapper" ref={pdfContentRef}>
          {products.map(product => (
            <div key={product.id} className="product-item-pdf">
              <h3>{product.nome}</h3>
              <img src={product.imagePath} alt={product.nome} />
              <div>
                <p>Peso: {product.peso}</p>
                <p>Preço unitário: {formatCurrency(product.precoUnitario)}</p>
                <p>Preço fardo: {formatCurrency(product.precoFardo)}</p>
                <p>Qtd. por fardo: {product.qtdFardo}</p>
              </div>
            </div>
          ))}
        </div>
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
