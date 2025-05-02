"use client";

import * as React from 'react';
import { Printer, X } from 'lucide-react';

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

interface BillPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: BillItem[];
  totalAmount: number;
}

export function BillPreviewDialog({ isOpen, onClose, items, totalAmount }: BillPreviewDialogProps) {
  const billContentRef = React.useRef<HTMLDivElement>(null);
  const [printDate, setPrintDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPrintDate(new Date()); // Set print date when dialog opens
    }
  }, [isOpen]);


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
                 ${content.innerHTML}
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
             <div className="mb-4">
               <p><strong>Date:</strong> {printDate ? printDate.toLocaleDateString() : 'N/A'}</p>
               <p><strong>Time:</strong> {printDate ? printDate.toLocaleTimeString() : 'N/A'}</p>
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

        <DialogFooter className="mt-4">
           <Button variant="outline" onClick={onClose}>
             Close
           </Button>
           <Button onClick={handlePrint}>
             <Printer className="mr-2 h-4 w-4" /> Print Bill
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
