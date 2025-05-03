"use client"

import * as React from "react"
import { PlusCircle, Printer, ReceiptText, User, Loader2 } from "lucide-react" // Added Loader2

import type { Product, BillItem } from "@/types" // Keep base types
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BillItemRow } from "./bill-item-row"
import { BillPreviewDialog } from "./bill-preview-dialog"
import { useToast } from "@/hooks/use-toast"

interface BillGeneratorProps {
  availableProducts: Product[];
}

// Define the extended type for state management within this component
interface BillItemWithBillPrice extends BillItem {
  billPrice?: number; // Optional price for this specific bill item
}

export function BillGenerator({ availableProducts }: BillGeneratorProps) {
  // Use the extended type for the bill items state
  const [billItems, setBillItems] = React.useState<BillItemWithBillPrice[]>([])
  const [selectedProductId, setSelectedProductId] = React.useState<string>("")
  const [clientName, setClientName] = React.useState<string>("")
  const [showPreview, setShowPreview] = React.useState(false)
  const { toast } = useToast();

  const productOptions: ComboboxOption[] = React.useMemo(() => {
    const grouped: { [category: string]: ComboboxOption[] } = {};
    availableProducts.forEach(p => {
      const category = p.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
          value: p.id,
          label: `${p.name} (₹${p.price.toFixed(2)})`,
          group: category
        });
    });

    const sortedCategories = Object.keys(grouped).sort();
    let flatOptions: ComboboxOption[] = [];
    sortedCategories.forEach(category => {
        grouped[category].sort((a, b) => a.label.localeCompare(b.label));
        flatOptions = flatOptions.concat(grouped[category]);
    });
    return flatOptions;
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
    if (!productToAdd) return;

    const existingItemIndex = billItems.findIndex(item => item.id === productToAdd.id);

    if (existingItemIndex > -1) {
      // If item exists, just increase quantity (don't reset potential price override)
      handleItemChange(productToAdd.id, 'quantity', billItems[existingItemIndex].quantity + 1);
    } else {
      // Add new item, initially using the product's price (no billPrice override yet)
      setBillItems([...billItems, { ...productToAdd, quantity: 1 }]);
    }
    setSelectedProductId(""); // Reset combobox after adding
  };

  // Unified handler for changing quantity or price
  const handleItemChange = (productId: string, field: 'quantity' | 'billPrice', value: number) => {
    setBillItems(currentItems =>
      currentItems.map(item => {
        if (item.id === productId) {
          if (field === 'quantity') {
            return { ...item, quantity: Math.max(0, value) }; // Ensure quantity >= 0
          } else if (field === 'billPrice') {
            // If the new price matches the original product price, remove the override
             const originalProductPrice = availableProducts.find(p => p.id === productId)?.price;
             if (value === originalProductPrice) {
                const { billPrice, ...rest } = item; // Remove billPrice property
                return rest; // Return item without billPrice override
             } else {
                return { ...item, billPrice: Math.max(0, value) }; // Ensure price >= 0 and update/add billPrice
             }

          }
        }
        return item;
      })
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
    return billItems.reduce((total, item) => {
        // Use overridden price if available, otherwise original price
        const priceToUse = item.billPrice ?? item.price;
        return total + priceToUse * item.quantity;
    }, 0);
  }, [billItems]);

  const handleGenerateBill = () => {
     if (!clientName.trim()) {
       toast({
         title: "Client Name Required",
         description: "Please enter the client's name.",
         variant: "destructive",
       });
       return;
     }
    const itemsToInclude = billItems.filter(item => item.quantity > 0);
    if (itemsToInclude.length === 0) {
       toast({
         title: "Cannot Generate Bill",
         description: "Please add products with quantities greater than zero to the bill.",
         variant: "destructive",
       });
      return;
    }
    // Pass the potentially modified items to the preview
    setShowPreview(true);
  };

   // Prepare items for preview, ensuring the correct price is used
   const itemsForPreview = React.useMemo(() => {
       return billItems
           .filter(item => item.quantity > 0)
           .map(item => ({
               ...item,
               price: item.billPrice ?? item.price, // Use the billPrice for the preview/PDF if it exists
           }));
   }, [billItems]);


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
          {/* Client Name Input */}
          <div className="space-y-2">
            <Label htmlFor="client-name" className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" /> Client Name
            </Label>
            <Input
                id="client-name"
                placeholder="Enter client's name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-10"
            />
          </div>

          {/* Product Selection and Add Button */}
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="product-select" className="text-sm font-medium mb-1 block">Select Product</Label>
               {productOptions.length === 0 && availableProducts.length === 0 ? (
                 <div className="flex items-center justify-center h-10 border rounded-md bg-muted text-muted-foreground">
                   <span>No products available in admin panel.</span>
                 </div>
               ) : (
                  <Combobox
                    options={productOptions}
                    value={selectedProductId}
                    onChange={setSelectedProductId}
                    placeholder="Select a product..."
                    searchPlaceholder="Search products..."
                    emptyPlaceholder="No products found."
                    triggerClassName="h-10"
                    inputId="product-select"
                  />
              )}
            </div>
            <Button
               onClick={addProductToBill}
               aria-label="Add selected product to bill"
               className="h-10"
               disabled={!selectedProductId || productOptions.length === 0}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Bill
            </Button>
          </div>

          {/* Bill Items Table */}
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
                     <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                       No items added to the bill yet.
                     </TableCell>
                   </TableRow>
                 ) : (
                   billItems.map(item => (
                     <BillItemRow
                       key={item.id}
                       item={item}
                       // Pass the unified handler
                       onItemChange={handleItemChange}
                       onRemove={handleRemoveItem}
                     />
                   ))
                 )}
               </TableBody>
                {billItems.length > 0 && (
                  <TableFooter>
                   <TableRow className="bg-muted/50 font-semibold">
                     <TableCell colSpan={4} className="text-right">Total Amount:</TableCell>
                     <TableCell className="text-right font-bold text-lg">₹{totalAmount.toFixed(2)}</TableCell>
                     <TableCell></TableCell>{/* Empty cell for remove column */}
                   </TableRow>
                  </TableFooter>
                 )}
             </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
             onClick={handleGenerateBill}
             className="bg-accent text-accent-foreground hover:bg-accent/90"
             disabled={!clientName.trim() || billItems.filter(item => item.quantity > 0).length === 0}
          >
            <Printer className="mr-2 h-4 w-4" /> Generate & Preview Bill
          </Button>
        </CardFooter>
      </Card>

      <BillPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          clientName={clientName}
          // Pass the specially prepared items with potentially overridden prices
          items={itemsForPreview}
          totalAmount={totalAmount}
        />
    </>
  )
}
