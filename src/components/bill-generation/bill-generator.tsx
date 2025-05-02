"use client"

import * as React from "react"
import { PlusCircle, Printer, ReceiptText } from "lucide-react"

import type { Product, BillItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { BillItemRow } from "./bill-item-row"
import { BillPreviewDialog } from "./bill-preview-dialog"
import { useToast } from "@/hooks/use-toast"

interface BillGeneratorProps {
  availableProducts: Product[];
}

export function BillGenerator({ availableProducts }: BillGeneratorProps) {
  const [billItems, setBillItems] = React.useState<BillItem[]>([])
  const [selectedProductId, setSelectedProductId] = React.useState<string>("")
  const [showPreview, setShowPreview] = React.useState(false)
  const { toast } = useToast();

  const productOptions: ComboboxOption[] = React.useMemo(() => {
    const grouped: { [category: string]: ComboboxOption[] } = {};
    availableProducts.forEach(p => {
      if (!grouped[p.category]) {
        grouped[p.category] = [];
      }
      grouped[p.category].push({ value: p.id, label: `${p.name} ($${p.price.toFixed(2)})`, group: p.category });
    });

    // Flatten grouped options while keeping the group structure for the Combobox
    return Object.values(grouped).flat();
  }, [availableProducts]);


  const addProductToBill = () => {
    if (!selectedProductId) {
        toast({
          title: "No Product Selected",
          description: "Please select a product from the dropdown.",
          variant: "destructive",
        });
        return;
    }

    const productToAdd = availableProducts.find(p => p.id === selectedProductId);
    if (!productToAdd) return; // Should not happen if selectedProductId is valid

    const existingItemIndex = billItems.findIndex(item => item.id === productToAdd.id);

    if (existingItemIndex > -1) {
      // If item exists, just increment quantity
      handleQuantityChange(productToAdd.id, billItems[existingItemIndex].quantity + 1);
    } else {
      // Add new item with quantity 1
      setBillItems([...billItems, { ...productToAdd, quantity: 1 }]);
    }
    setSelectedProductId(""); // Reset combobox after adding
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setBillItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setBillItems(currentItems => currentItems.filter(item => item.id !== productId));
     toast({
        title: "Item Removed",
        description: "The product has been removed from the bill.",
      });
  };

  const totalAmount = React.useMemo(() => {
    return billItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [billItems]);

  const handleGenerateBill = () => {
    if (billItems.length === 0 || billItems.every(item => item.quantity === 0)) {
       toast({
         title: "Cannot Generate Bill",
         description: "Please add products with quantities greater than zero to the bill.",
         variant: "destructive",
       });
      return;
    }
    setShowPreview(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generate Bill</span>
            <ReceiptText className="h-6 w-6 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <label htmlFor="product-select" className="text-sm font-medium mb-1 block">Select Product</label>
              <Combobox
                options={productOptions}
                value={selectedProductId}
                onChange={setSelectedProductId}
                placeholder="Select a product..."
                searchPlaceholder="Search products..."
                emptyPlaceholder="No products found."
                triggerClassName="h-10" // Match button height
              />
            </div>
            <Button onClick={addProductToBill} aria-label="Add selected product to bill">
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Bill
            </Button>
          </div>

          <div className="rounded-md border mt-4">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Product</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead className="text-right">Unit Price</TableHead>
                   <TableHead className="text-center">Quantity</TableHead>
                   <TableHead className="text-right">Total</TableHead>
                   <TableHead className="text-right">Remove</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {billItems.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center">
                       No items added to the bill yet.
                     </TableCell>
                   </TableRow>
                 ) : (
                   billItems.map(item => (
                     <BillItemRow
                       key={item.id}
                       item={item}
                       onQuantityChange={handleQuantityChange}
                       onRemove={handleRemoveItem}
                     />
                   ))
                 )}
               </TableBody>
                {billItems.length > 0 && (
                 <TableFooter>
                   <TableRow className="bg-muted/50 font-semibold">
                     <TableCell colSpan={4} className="text-right">Total Amount:</TableCell>
                     <TableCell className="text-right">${totalAmount.toFixed(2)}</TableCell>
                     <TableCell></TableCell> {/* Empty cell for remove column */}
                   </TableRow>
                 </TableFooter>
                 )}
             </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateBill} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Printer className="mr-2 h-4 w-4" /> Generate & Preview Bill
          </Button>
        </CardFooter>
      </Card>

      <BillPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          items={billItems.filter(item => item.quantity > 0)} // Only include items with quantity > 0
          totalAmount={totalAmount}
        />
    </>
  )
}
