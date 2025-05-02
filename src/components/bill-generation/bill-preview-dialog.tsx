"use client";

import * as React from 'react';
import { Printer, X } from 'lucide-react'; // Removed Share icon if not used directly

import type { BillItem } from '@/types';
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

// Inline SVG for WhatsApp icon
const WhatsAppIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);


interface BillPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string; // Added clientName prop
  items: BillItem[];
  totalAmount: number;
}

export function BillPreviewDialog({ isOpen, onClose, clientName, items, totalAmount }: BillPreviewDialogProps) {
  const billContentRef = React.useRef<HTMLDivElement>(null);
  const [printDate, setPrintDate] = React.useState<Date | null>(null);
  const [currentTime, setCurrentTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPrintDate(new Date()); // Set print date when dialog opens
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      // Get current time only on client side
      setCurrentTime(new Date().toLocaleTimeString());
    }
  }, [isOpen]);


 const getBillTextForShare = (): string => {
     let billText = `*Invoice / Bill*\n`;
     billText += `*Client:* ${clientName}\n`;
     billText += `*Date:* ${printDate ? printDate.toLocaleDateString() : 'N/A'}\n`;
     billText += `*Time:* ${currentTime || 'N/A'}\n\n`;
     billText += `*Items:*\n`;
     billText += `--------------------\n`;
     items.forEach(item => {
         billText += `${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
     });
     billText += `--------------------\n`;
     billText += `*Total Amount:* $${totalAmount.toFixed(2)}\n\n`;
     billText += `Thank you!`;
     return billText;
  };

  const handleWhatsAppShare = () => {
     const billText = getBillTextForShare();
     const encodedText = encodeURIComponent(billText);
     // Using wa.me link (more universal)
     const whatsappUrl = `https://wa.me/?text=${encodedText}`;
     window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };


  const handlePrint = () => {
    const content = billContentRef.current;
    if (content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
         const styles = Array.from(document.styleSheets)
           .map(styleSheet => {
             try {
               return Array.from(styleSheet.cssRules)
                 .map(rule => rule.cssText)
                 .join('');
             } catch (e) {
               console.log('Access to stylesheet %s is denied. Ignoring.', styleSheet.href);
               return '';
             }
           })
           .join('\n');

        printWindow.document.write(`
          <html>
            <head>
              <title>Bill Print</title>
               <style>
                 body { font-family: Arial, sans-serif; margin: 20px; }
                 .print-container { max-width: 800px; margin: auto; }
                 .header { text-align: center; margin-bottom: 20px; }
                 .header h1 { margin: 0; font-size: 1.5rem; }
                 .header p { margin: 5px 0; color: #555; font-size: 0.9rem;}
                 .client-info { margin-bottom: 15px; font-size: 0.9rem; } /* Style for client info */
                 .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                 .item-table th, .item-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.9rem; }
                 .item-table th { background-color: #f2f2f2; }
                 .text-right { text-align: right !important; }
                 .total-section { text-align: right; margin-top: 15px; font-size: 1rem; font-weight: bold; }
                 .footer { text-align: center; margin-top: 30px; font-size: 0.8rem; color: #777; }
                 /* Minimal styles to somewhat resemble the dialog */
                 ${styles} /* Include existing styles (may need refinement) */
               </style>
            </head>
            <body>
              <div class="print-container">
                 <div class="header">
                   <h1>Invoice / Bill</h1>
                   <p>Date Generated: ${printDate ? printDate.toLocaleString() : 'N/A'}</p>
                 </div>
                 ${content.innerHTML} {/* Content includes client name now */}
                 <div class="footer">Thank you!</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        // Timeout ensures content is loaded before print dialog opens
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      } else {
         alert('Could not open print window. Please check your browser pop-up settings.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bill Preview</DialogTitle>
          <DialogClose asChild>
             <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
             </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-6">
          <div ref={billContentRef} className="text-sm p-1">
             {/* Optional: Add Store Name/Logo */}
             {/* <div className="text-center mb-4">
               <h2 className="text-xl font-semibold">Your Store Name</h2>
               <p className="text-xs text-muted-foreground">123 Main St, Anytown</p>
             </div> */}
              <div className="mb-4 client-info"> {/* Added client-info class */}
                 <p><strong>Client:</strong> {clientName}</p>
                 <p><strong>Date:</strong> {printDate ? printDate.toLocaleDateString() : 'N/A'}</p>
                 <p><strong>Time:</strong> {currentTime || 'N/A'}</p>
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
                    <td className="text-right py-1">${item.price.toFixed(2)}</td>
                    <td className="text-right py-1">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="text-right total-section">
              <p><strong>Total Amount: ${totalAmount.toFixed(2)}</strong></p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 sm:justify-between items-center">
           <Button variant="outline" onClick={handleWhatsAppShare} className="w-full sm:w-auto mb-2 sm:mb-0 bg-green-500 hover:bg-green-600 text-white">
              <WhatsAppIcon /> {/* Use SVG icon */}
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

