import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/contexts/ProductContext';
import { FileDown, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Pedido } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PedidoPDFGeneratorProps {
  pedido: Pedido;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const defaultColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  success: '#10b981',
  background: '#f8fafc',
  white: '#ffffff',
  dark: '#1e293b',
  lightGray: '#e2e8f0',
  text: '#334155',
  muted: '#64748b'
};

export const PedidoPDFGenerator: React.FC<PedidoPDFGeneratorProps> = ({ 
  pedido,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const { catalogConfig } = useProducts();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cupomWidth, setCupomWidth] = useState<'58' | '80'>('80');
  
  const colors = {
    ...defaultColors,
    primary: catalogConfig.corFundoPdf || defaultColors.primary
  };
  
  const generatePedidoPDF = async () => {
    setIsGenerating(true);
    
    toast.info('Gerando PDF do pedido, por favor aguarde...');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      const primaryRgb = hexToRgb(colors.primary);
      
      pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      if (catalogConfig.logoPath && catalogConfig.logoPath !== '/placeholder.svg') {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject(new Error('Failed to load logo'));
            logoImg.src = catalogConfig.logoPath;
            setTimeout(() => reject(new Error('Logo load timeout')), 3000);
          });
          
          const logoCanvas = document.createElement('canvas');
          const logoCtx = logoCanvas.getContext('2d');
          if (logoCtx) {
            logoCanvas.width = 120;
            logoCanvas.height = 80;
            
            logoCtx.fillStyle = '#ffffff';
            logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
            
            const logoScale = Math.min(logoCanvas.width / logoImg.width, logoCanvas.height / logoImg.height);
            const logoScaledWidth = logoImg.width * logoScale;
            const logoScaledHeight = logoImg.height * logoScale;
            const logoOffsetX = (logoCanvas.width - logoScaledWidth) / 2;
            const logoOffsetY = (logoCanvas.height - logoScaledHeight) / 2;
            
            logoCtx.drawImage(logoImg, logoOffsetX, logoOffsetY, logoScaledWidth, logoScaledHeight);
            
            const logoData = logoCanvas.toDataURL('image/png', 0.8);
            pdf.addImage(logoData, 'PNG', 15, 5, 30, 15);
          }
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('PEDIDO DE VENDAS', pageWidth - 15, 15, { align: 'right' });
      
      let currentY = 40;
      
      pdf.setFillColor(hexToRgb(colors.background).r, hexToRgb(colors.background).g, hexToRgb(colors.background).b);
      pdf.roundedRect(15, currentY, pageWidth - 30, 25, 3, 3, 'F');
      
      pdf.setTextColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Pedido Nº ${pedido.numero}`, 20, currentY + 8);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(hexToRgb(colors.muted).r, hexToRgb(colors.muted).g, hexToRgb(colors.muted).b);
      pdf.text(`Data: ${new Date(pedido.timestampCriacao).toLocaleString('pt-BR')}`, 20, currentY + 15);
      
      const statusColors = {
        EM_ABERTO: colors.primary,
        FINALIZADO: colors.success,
        CANCELADO: '#ef4444'
      };
      
      const statusTexts = {
        EM_ABERTO: 'EM ABERTO',
        FINALIZADO: 'FINALIZADO',
        CANCELADO: 'CANCELADO'
      };
      
      const statusColor = hexToRgb(statusColors[pedido.status] || colors.muted);
      pdf.setFillColor(statusColor.r, statusColor.g, statusColor.b);
      pdf.roundedRect(pageWidth - 50, currentY + 3, 30, 12, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text(statusTexts[pedido.status], pageWidth - 35, currentY + 11, { align: 'center' });
      
      currentY += 35;
      
      pdf.setFillColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
      pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text('DADOS DO CLIENTE', 20, currentY + 5.5);
      
      currentY += 15;
      
      pdf.setTextColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Nome: ${pedido.cliente.nome}`, 20, currentY);
      
      currentY += 8;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(hexToRgb(colors.text).r, hexToRgb(colors.text).g, hexToRgb(colors.text).b);
      
      const tipoDoc = pedido.cliente.tipo === 'PF' ? 'CPF' : 'CNPJ';
      const docFormatado = formatDocumento(pedido.cliente.documento, pedido.cliente.tipo);
      pdf.text(`${tipoDoc}: ${docFormatado}`, 20, currentY);
      
      currentY += 8;
      pdf.text(`Tipo: ${pedido.cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}`, 20, currentY);
      
      currentY += 20;
      
      pdf.setFillColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
      pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text('ITENS DO PEDIDO', 20, currentY + 5.5);
      
      currentY += 15;
      
      const tableHeaders = ['Item', 'Qtd', 'Preço Unit.', 'Total'];
      const colWidths = [80, 25, 35, 35];
      const startX = 20;
      
      pdf.setFillColor(hexToRgb(colors.lightGray).r, hexToRgb(colors.lightGray).g, hexToRgb(colors.lightGray).b);
      pdf.rect(15, currentY, pageWidth - 30, 10, 'F');
      
      pdf.setTextColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      
      let currentX = startX;
      tableHeaders.forEach((header, index) => {
        pdf.text(header, currentX, currentY + 6);
        currentX += colWidths[index];
      });
      
      currentY += 12;
      
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(hexToRgb(colors.text).r, hexToRgb(colors.text).g, hexToRgb(colors.text).b);
      
      pedido.itens.forEach((item, index) => {
        if (currentY > 270) {
          pdf.addPage();
          currentY = 20;
        }
        
        const itemName = truncateText(`${item.nome} (${item.peso})${item.marca ? ` - ${item.marca}` : ''}`, 35);
        
        currentX = startX;
        pdf.text(itemName, currentX, currentY + 6);
        currentX += colWidths[0];
        
        pdf.text(item.quantidade.toString(), currentX, currentY + 6, { align: 'center' });
        currentX += colWidths[1];
        
        pdf.text(formatCurrency(item.precoUnitario), currentX, currentY + 6, { align: 'right' });
        currentX += colWidths[2];
        
        pdf.text(formatCurrency(item.precoTotal), currentX, currentY + 6, { align: 'right' });
        
        currentY += 12;
        
        pdf.setDrawColor(hexToRgb(colors.lightGray).r, hexToRgb(colors.lightGray).g, hexToRgb(colors.lightGray).b);
        pdf.line(15, currentY - 4, pageWidth - 15, currentY - 4);
      });
      
      currentY += 10;
      
      pdf.setFillColor(hexToRgb(colors.accent).r, hexToRgb(colors.accent).g, hexToRgb(colors.accent).b);
      pdf.rect(pageWidth - 80, currentY, 65, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('TOTAL GERAL', pageWidth - 77, currentY + 6);
      pdf.text(formatCurrency(pedido.valorTotal), pageWidth - 20, currentY + 12, { align: 'right' });
      
      if (pedido.observacoes && pedido.observacoes.trim()) {
        currentY += 25;
        
        pdf.setFillColor(hexToRgb(colors.dark).r, hexToRgb(colors.dark).g, hexToRgb(colors.dark).b);
        pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text('OBSERVAÇÕES', 20, currentY + 5.5);
        
        currentY += 15;
        
        pdf.setTextColor(hexToRgb(colors.text).r, hexToRgb(colors.text).g, hexToRgb(colors.text).b);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        const observacaoLines = pdf.splitTextToSize(pedido.observacoes, pageWidth - 40);
        observacaoLines.forEach((line: string) => {
          pdf.text(line, 20, currentY);
          currentY += 5;
        });
      }
      
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        pdf.setTextColor(hexToRgb(colors.muted).r, hexToRgb(colors.muted).g, hexToRgb(colors.muted).b);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 15, 290, { align: 'right' });
        pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 15, 290);
      }
      
      const filename = `pedido-${pedido.numero.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
      pdf.save(filename);
      
      toast.success('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openPreview = () => {
    setPreviewOpen(true);
  };

  const formatDocumento = (documento: string, tipo: 'PF' | 'PJ'): string => {
    if (tipo === 'PF') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      EM_ABERTO: 'Em Aberto',
      FINALIZADO: 'Finalizado',
      CANCELADO: 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      EM_ABERTO: 'bg-blue-100 text-blue-800',
      FINALIZADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

    const generateCupomPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Configurações básicas do cupom
      const widthMm = parseInt(cupomWidth);
      const margin = 3;
      let currentY = 8;
      
      // Criar PDF simples
      const pdf = new jsPDF('p', 'mm', [widthMm, 200]);
      
      // Configurar fonte padrão (sem cores)
      pdf.setTextColor(0, 0, 0); // Apenas preto
      
      // === CABEÇALHO SIMPLES ===
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text('PEDIDO DE VENDAS', widthMm / 2, currentY, { align: 'center' });
      currentY += 8;
      
      // Linha separadora
      pdf.line(margin, currentY, widthMm - margin, currentY);
      currentY += 5;
      
      // === DADOS DO PEDIDO ===
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('DADOS DO PEDIDO', margin, currentY);
      currentY += 5;
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      pdf.text(`Numero: ${pedido.numero}`, margin, currentY);
      currentY += 4;
      
      const dataFormatada = new Date(pedido.timestampCriacao).toLocaleDateString('pt-BR');
      pdf.text(`Data: ${dataFormatada}`, margin, currentY);
      currentY += 4;
      
      pdf.text(`Status: ${getStatusText(pedido.status)}`, margin, currentY);
      currentY += 8;
      
      // === DADOS DO CLIENTE ===
      pdf.line(margin, currentY, widthMm - margin, currentY);
      currentY += 3;
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('CLIENTE', margin, currentY);
      currentY += 5;
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      
      // Nome (com quebra se necessário)
      const nomeLines = pdf.splitTextToSize(pedido.cliente.nome, widthMm - (margin * 2));
      nomeLines.forEach((line: string) => {
        pdf.text(line, margin, currentY);
        currentY += 4;
      });
      
      // Documento
      const tipoDoc = pedido.cliente.tipo === 'PF' ? 'CPF' : 'CNPJ';
      const docFormatado = formatDocumento(pedido.cliente.documento, pedido.cliente.tipo);
      pdf.text(`${tipoDoc}: ${docFormatado}`, margin, currentY);
      currentY += 8;
      
      // === ITENS ===
      pdf.line(margin, currentY, widthMm - margin, currentY);
      currentY += 3;
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('ITENS', margin, currentY);
      currentY += 5;
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      
      pedido.itens.forEach((item, index) => {
        // Número do item
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${item.nome}`, margin, currentY);
        currentY += 4;
        
        pdf.setFont(undefined, 'normal');
        
        // Peso e marca (se existir)
        let infoLine = `${item.peso}`;
        if (item.marca) {
          infoLine += ` - ${item.marca}`;
        }
        pdf.text(infoLine, margin + 2, currentY);
        currentY += 4;
        
        // Quantidade e preços
        pdf.text(`Qtd: ${item.quantidade} x ${formatCurrency(item.precoUnitario)}`, margin + 2, currentY);
        currentY += 4;
        
        // Total do item
        pdf.setFont(undefined, 'bold');
        pdf.text(`Total: ${formatCurrency(item.precoTotal)}`, margin + 2, currentY);
        pdf.setFont(undefined, 'normal');
        currentY += 6;
        
        // Separador entre itens (exceto no último)
        if (index < pedido.itens.length - 1) {
          pdf.text('- - - - - - - - - - - - - - -', margin, currentY);
          currentY += 4;
        }
      });
      
      currentY += 3;
      
      // === TOTAL ===
      pdf.line(margin, currentY, widthMm - margin, currentY);
      currentY += 5;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('TOTAL GERAL:', margin, currentY);
      currentY += 5;
      
      pdf.setFontSize(12);
      pdf.text(formatCurrency(pedido.valorTotal), margin, currentY);
      currentY += 10;
      
      // === OBSERVAÇÕES (se existir) ===
      if (pedido.observacoes && pedido.observacoes.trim()) {
        pdf.line(margin, currentY, widthMm - margin, currentY);
        currentY += 3;
        
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        pdf.text('OBSERVACOES:', margin, currentY);
        currentY += 5;
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(8);
        
        const obsLines = pdf.splitTextToSize(pedido.observacoes, widthMm - (margin * 2));
        obsLines.forEach((line: string) => {
          pdf.text(line, margin, currentY);
          currentY += 4;
        });
        currentY += 5;
      }
      
      // === RODAPÉ ===
      pdf.line(margin, currentY, widthMm - margin, currentY);
      currentY += 3;
      
      pdf.setFontSize(7);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, widthMm / 2, currentY, { align: 'center' });
      
      // Salvar arquivo com comportamento melhorado para iOS
      const filename = `cupom-${cupomWidth}mm-${pedido.numero.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
      
      // Detectar iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        // Para iOS, usar timeout para dar tempo do sistema processar
        console.log('📱 iOS detectado - usando download otimizado para cupom fiscal');
        setTimeout(() => {
          pdf.save(filename);
          // Adicionar flag para indicar que houve download
          sessionStorage.setItem('ios-download-active', 'true');
          
          // Limpar flag após um tempo
          setTimeout(() => {
            sessionStorage.removeItem('ios-download-active');
          }, 5000);
        }, 100);
      } else {
        pdf.save(filename);
      }
      
      toast.success(`Cupom fiscal ${cupomWidth}mm gerado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao gerar cupom:', error);
      toast.error('Erro ao gerar cupom. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Botão PDF A4 */}
        <Button 
          onClick={generatePedidoPDF}
          disabled={isGenerating}
          variant={variant}
          size={size}
          className={className}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <Download size={16} className="mr-2" />
              PDF A4 Profissional
            </>
          )}
        </Button>

        {/* Seleção e botão Cupom */}
        <div className="flex items-center gap-2">
          <Select value={cupomWidth} onValueChange={(value: '58' | '80') => setCupomWidth(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="58">58mm</SelectItem>
              <SelectItem value="80">80mm</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateCupomPDF}
            disabled={isGenerating}
            variant="outline"
            size={size}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Gerando...
              </>
            ) : (
              <>
                <FileText size={16} className="mr-2" />
                Cupom Fiscal {cupomWidth}mm
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size={size} onClick={openPreview}>
              <FileText size={16} className="mr-2" />
              Prévia A4
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Prévia do Pedido - {pedido.numero}</DialogTitle>
              <DialogDescription>
                Visualização de como o PDF A4 será gerado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 p-4 bg-white border rounded-lg">
              <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-4">
                  {catalogConfig.logoPath && catalogConfig.logoPath !== '/placeholder.svg' && (
                    <img 
                      src={catalogConfig.logoPath} 
                      alt="Logo" 
                      className="h-10 w-auto bg-white p-1 rounded"
                    />
                  )}
                  <h1 className="text-xl font-bold">PEDIDO DE VENDAS</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <h3 className="font-bold text-lg">Pedido Nº {pedido.numero}</h3>
                  <p className="text-sm text-gray-600">
                    Data: {new Date(pedido.timestampCriacao).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pedido.status)}`}>
                    {getStatusText(pedido.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg bg-gray-800 text-white p-3 rounded">DADOS DO CLIENTE</h3>
                <div className="p-4 space-y-2">
                  <p><strong>Nome:</strong> {pedido.cliente.nome}</p>
                  <p><strong>{pedido.cliente.tipo === 'PF' ? 'CPF' : 'CNPJ'}:</strong> {formatDocumento(pedido.cliente.documento, pedido.cliente.tipo)}</p>
                  <p><strong>Tipo:</strong> {pedido.cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg bg-gray-800 text-white p-3 rounded">ITENS DO PEDIDO</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Item</th>
                        <th className="border border-gray-300 p-2 text-center">Qtd</th>
                        <th className="border border-gray-300 p-2 text-right">Preço Unit.</th>
                        <th className="border border-gray-300 p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.itens.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            <div>
                              <div className="font-medium">{item.nome}</div>
                              <div className="text-sm text-gray-600">
                                {item.peso}{item.marca && ` - ${item.marca}`}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">{item.quantidade}</td>
                          <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.precoUnitario)}</td>
                          <td className="border border-gray-300 p-2 text-right font-medium">{formatCurrency(item.precoTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-yellow-500 text-white p-4 rounded-lg">
                    <div className="text-lg font-bold">TOTAL GERAL</div>
                    <div className="text-xl font-bold">{formatCurrency(pedido.valorTotal)}</div>
                  </div>
                </div>
              </div>

              {pedido.observacoes && pedido.observacoes.trim() && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg bg-gray-800 text-white p-3 rounded">OBSERVAÇÕES</h3>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="whitespace-pre-wrap">{pedido.observacoes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                <span>Gerado em {new Date().toLocaleString('pt-BR')}</span>
                <span>Página 1 de 1</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={generatePedidoPDF} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown size={16} className="mr-2" />
                    Baixar PDF A4
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size={size}>
              <FileText size={16} className="mr-2" />
              Prévia Cupom {cupomWidth}mm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Prévia Cupom Fiscal {cupomWidth}mm - {pedido.numero}</DialogTitle>
              <DialogDescription>
                Visualização completa do formato cupom fiscal para bobinas de {cupomWidth}mm
              </DialogDescription>
            </DialogHeader>
            
            <div 
              className="bg-white border border-gray-300 p-3 mx-auto font-mono" 
              style={{ 
                width: cupomWidth === '58' ? '58mm' : '80mm', 
                fontSize: '11px',
                lineHeight: '1.3'
              }}
            >
              {/* Cabeçalho Simples */}
              <div className="text-center border-b border-black pb-2 mb-4">
                <h1 className="font-bold">PEDIDO DE VENDAS</h1>
              </div>

              {/* Dados do Pedido */}
              <div className="mb-4">
                <div className="font-bold mb-2">DADOS DO PEDIDO</div>
                <div>Numero: {pedido.numero}</div>
                <div>Data: {new Date(pedido.timestampCriacao).toLocaleDateString('pt-BR')}</div>
                <div>Status: {getStatusText(pedido.status)}</div>
              </div>

              {/* Dados do Cliente */}
              <div className="border-t border-black pt-2 mb-4">
                <div className="font-bold mb-2">CLIENTE</div>
                <div className="break-words">{pedido.cliente.nome}</div>
                <div>{pedido.cliente.tipo === 'PF' ? 'CPF' : 'CNPJ'}: {formatDocumento(pedido.cliente.documento, pedido.cliente.tipo)}</div>
              </div>

              {/* Itens */}
              <div className="border-t border-black pt-2 mb-4">
                <div className="font-bold mb-2">ITENS</div>
                <div className="space-y-3">
                  {pedido.itens.map((item, index) => (
                    <div key={index}>
                      <div className="font-bold">{index + 1}. {item.nome}</div>
                      <div className="ml-2">
                        <div>{item.peso}{item.marca && ` - ${item.marca}`}</div>
                        <div>Qtd: {item.quantidade} x {formatCurrency(item.precoUnitario)}</div>
                        <div className="font-bold">Total: {formatCurrency(item.precoTotal)}</div>
                      </div>
                      {index < pedido.itens.length - 1 && (
                        <div className="mt-2 text-center">- - - - - - - - - - - - -</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-black pt-2 mb-4">
                <div className="font-bold text-base">TOTAL GERAL:</div>
                <div className="font-bold text-lg">{formatCurrency(pedido.valorTotal)}</div>
              </div>

              {/* Observações */}
              {pedido.observacoes && pedido.observacoes.trim() && (
                <div className="border-t border-black pt-2 mb-4">
                  <div className="font-bold mb-1">OBSERVACOES:</div>
                  <div className="text-xs break-words">{pedido.observacoes}</div>
                </div>
              )}

              {/* Rodapé */}
              <div className="border-t border-black pt-2 text-center text-xs">
                <div>Gerado em {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-600">
                Formato: Cupom {cupomWidth}mm
              </div>
              <Button onClick={generateCupomPDF} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown size={16} className="mr-2" />
                    Baixar Cupom {cupomWidth}mm
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export default PedidoPDFGenerator; 