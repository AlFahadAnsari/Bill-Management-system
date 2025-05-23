"use client";

import * as React from 'react';
import { Printer, X } from 'lucide-react';

import type { BillItem } from '@/types'; // Use base BillItem type, as price is handled before passing
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Correct import for autoTable plugin
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Inline SVG for WhatsApp icon
const WhatsAppIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);


interface BillPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  items: BillItem[]; // Receive items with potentially overridden prices
  totalAmount: number;
}

export function BillPreviewDialog({ isOpen, onClose, clientName, items, totalAmount }: BillPreviewDialogProps) {
  const billContentRef = React.useRef<HTMLDivElement>(null);
  const [printDate, setPrintDate] = React.useState<Date | null>(null);
  const [currentTime, setCurrentTime] = React.useState<string | null>(null);
  const { toast } = useToast(); // Use the hook

  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setPrintDate(now);
      setCurrentTime(now.toLocaleTimeString());
    }
  }, [isOpen]);


  const generatePdf = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    try {
      doc.setFontSize(18);
      doc.text('Bill / Invoice', 14, 20);

      doc.setFontSize(12);
      doc.text(`Client: ${clientName}`, 14, 30);
      doc.text(`Date: ${printDate ? printDate.toLocaleDateString() : 'N/A'}`, 14, 36);
      doc.text(`Time: ${currentTime || 'N/A'}`, 14, 42);

      const tableColumn = ["Product", "Qty", "Unit Price", "Total"];
      const tableRows: (string | number)[][] = []; // Use mixed type array

      items.forEach(item => {
          // Use the price from the item object directly (it's already the overridden price if applicable)
          tableRows.push([
              item.name,
              item.quantity.toString(),
              `₹${item.price.toFixed(2)}`,
              `₹${(item.price * item.quantity).toFixed(2)}`
          ]);
      });

       // Add table using autoTable
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            didDrawPage: (data: any) => {
                // Use jsPDF methods directly on the doc object for footer text
                doc.setFontSize(14);
                const totalAmtText = `Total Amount: ₹${totalAmount.toFixed(2)}`;
                const textWidth = doc.getTextWidth(totalAmtText);
                const x = pageWidth - textWidth - data.settings.margin.right; // Use margin setting
                const y = data.cursor?.y ? data.cursor.y + 15 : pageHeight - 15; // Position below table or near bottom
                doc.text(totalAmtText, x, y);
            },
            margin: { right: 14, left: 14 } // Ensure consistent margins
        });


      const pdfDataUri = doc.output('datauristring');
      return pdfDataUri;

    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: `Failed to generate PDF. Please check console for details. Error: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleWhatsAppShare = async () => {
      const pdfDataUri = await generatePdf();
      if (!pdfDataUri) {
          return; // Error handled in generatePdf
      }

      // Basic text message linking to the PDF (Direct PDF sharing via URL is complex and unreliable across devices)
      // You might need a backend service to host the PDF and provide a shareable link.
      const message = `Hi ${clientName},\n\nHere is your bill: [View PDF]\n\nTotal Amount: ₹${totalAmount.toFixed(2)}\n\nPlease note: Direct PDF sharing is not supported via this link. Consider downloading and sending manually if needed.`;

      // For demonstration, we'll keep the text-based approach.
      // Sharing the full Data URI in the text might exceed URL length limits.
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      try {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          toast({
              title: "WhatsApp Share Initiated",
              description: "Please complete the sharing process in WhatsApp. Note: Direct PDF sharing is not fully supported.",
          });
      } catch (e) {
          console.error("Could not open WhatsApp link:", e);
          toast({
              title: "Failed to open WhatsApp",
              description: "Could not open the WhatsApp sharing link. Please ensure WhatsApp is installed or try sharing manually.",
              variant: "destructive",
          });
      }
  };


  const handlePrint = () => {
    const content = billContentRef.current;
    if (content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
         const styles = Array.from(document.styleSheets)
           .map(styleSheet => {
             try {
               if (styleSheet.href && !styleSheet.href.startsWith(window.location.origin)) {
                 return '';
               }
               return Array.from(styleSheet.cssRules)
                 .map(rule => rule.cssText)
                 .join('');
             } catch (e) {
               console.warn('Access to stylesheet %s is denied. Ignoring.', styleSheet.href);
               return '';
             }
           })
           .join('\n');

        printWindow.document.write(`
          <html>
            <head>
              <title>Bill Print - ${clientName}</title>
               <style>
                 body { font-family: sans-serif; margin: 20px; }
                 .print-container { max-width: 800px; margin: auto; }
                 .header { text-align: center; margin-bottom: 20px; }
                 .header h1 { margin: 0; font-size: 1.5rem; }
                 .header p { margin: 5px 0; color: #555; font-size: 0.9rem;}
                 .client-info { margin-bottom: 15px; font-size: 1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;}
                 .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;}
                 .item-table th, .item-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                 .item-table th { background-color: #f2f2f2; font-weight: bold; }
                 .text-right { text-align: right !important; }
                 .text-center { text-align: center !important; }
                 .total-section { text-align: right; margin-top: 15px; font-size: 1.1rem; font-weight: bold; padding-top: 10px; border-top: 1px solid #eee;}
                 .footer { text-align: center; margin-top: 30px; font-size: 0.8rem; color: #777; }
                 @media print {
                   body { margin: 0; }
                   .print-container { max-width: none; }
                   .no-print { display: none; }
                   .item-table th, .item-table td { font-size: 10pt; padding: 6px; }
                   .client-info, .total-section { font-size: 11pt; }
                 }
                 ${styles}
               </style>
            </head>
            <body>
              <div class="print-container">
                 <div class="header">
                   <h1>Invoice / Bill</h1>
                   <p>Date Generated: ${printDate ? printDate.toLocaleString() : 'N/A'}</p>
                 </div>
                 <div ref="${billContentRef}" class="bill-content">
                     <div class="mb-4 client-info">
                       <p><strong>Client:</strong> ${clientName}</p>
                       <p><strong>Date:</strong> ${printDate ? printDate.toLocaleDateString() : 'N/A'}</p>
                       <p><strong>Time:</strong> ${currentTime || 'N/A'}</p>
                     </div>
                     <table class="w-full item-table">
                      <thead>
                        <tr>
                          <th class="text-left pb-2">Product</th>
                          <th class="text-center pb-2">Qty</th>
                          <th class="text-right pb-2">Unit Price</th>
                          <th class="text-right pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${items.map((item) => `
                          <tr key="${item.id}" class="border-b">
                            <td class="py-1">${item.name}</td>
                            <td class="text-center py-1">${item.quantity}</td>
                            <td class="text-right py-1">₹${item.price.toFixed(2)}</td>
                            <td class="text-right py-1">₹${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <div class="text-right total-section">
                       <p><strong>Total Amount: ₹${totalAmount.toFixed(2)}</strong></p>
                    </div>
                 </div>
                 <div class="footer">Thank you!</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      } else {
         toast({title: "Print Error", description: "Could not open print window. Please check pop-up settings.", variant: "destructive"});
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bill Preview</DialogTitle>
          <DialogClose asChild>
             <Button variant="ghost" size="icon" className="absolute right-4 top-4 no-print" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
             </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-6">
          <div ref={billContentRef} className="text-sm p-1">
              <div className="mb-4 client-info">
                 <p><strong>Client:</strong> {clientName}</p>
                 <p><strong>Date:</strong> {printDate ? printDate.toLocaleDateString() : 'N/A'}</p>
                 <p><strong>Time:</strong> ${currentTime || 'N/A'}</p>
               </div>


            <Separator className="my-4" />

             <table className="w-full item-table">
              <thead>
                <tr>
                  <th className="text-left pb-2">Product</th>
                  <th className="text-center pb-2">Qty</th>
                  <th className="text-right pb-2">Unit Price</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    {/* Use the item's price (which might be overridden) */}
                    <td className="text-right py-1">₹{item.price.toFixed(2)}</td>
                    <td className="text-right py-1">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="text-right total-section">
              <p><strong>Total Amount: ₹${totalAmount.toFixed(2)}</strong></p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 sm:justify-between items-center no-print">
           <Button variant="outline" onClick={handleWhatsAppShare} className="w-full sm:w-auto mb-2 sm:mb-0 bg-green-500 hover:bg-green-600 text-white">
              <WhatsAppIcon />
              Share on WhatsApp
           </Button>
           <div className="flex gap-2 w-full sm:w-auto justify-end">
               <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                 Close
               </Button>
               <Button onClick={handlePrint} className="flex-1 sm:flex-none">
                 <Printer className="mr-2 h-4 w-4" /> Print Bill
               </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
