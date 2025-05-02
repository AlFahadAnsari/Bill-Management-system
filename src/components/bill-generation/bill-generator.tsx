"use client"

import * as React from "react"
import { PlusCircle, Printer, ReceiptText, User, Loader2 } from "lucide-react" // Added Loader2

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BillItemRow } from "./bill-item-row"
import { BillPreviewDialog } from "./bill-preview-dialog"
import { useToast } from "@/hooks/use-toast"
// No need to import getCategories here if products already contain category info

interface BillGeneratorProps {
  availableProducts: Product[];
}

export function BillGenerator({ availableProducts }: BillGeneratorProps) {
  const [billItems, setBillItems] = React.useState<BillItem[]>([])
  const [selectedProductId, setSelectedProductId] = React.useState<string>("")
  const [clientName, setClientName] = React.useState<string>("")
  const [showPreview, setShowPreview] = React.useState(false)
  const { toast } = useToast();

  // No need for separate category fetching if availableProducts includes categories
  // const [categories, setCategories] = React.useState<ComboboxOption[]>([]);
  // const [isLoadingCategories] = React.useState(true);

  // Group products by category for the Combobox
  const productOptions: ComboboxOption[] = React.useMemo(() => {
    const grouped: { [category: string]: ComboboxOption[] } = {};
    availableProducts.forEach(p => {
      const category = p.category || "Uncategorized"; // Handle potential missing category
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
          value: p.id,
          label: `${p.name} (₹${p.price.toFixed(2)})`,
          group: category // Use the category for grouping
        });
    });

    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();

    // Flatten grouped options while keeping the group structure for the Combobox
    let flatOptions: ComboboxOption[] = [];
    sortedCategories.forEach(category => {
        // Sort products within each category alphabetically by name
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
    if (!productToAdd) return; // Should not happen if selectedProductId is valid

    const existingItemIndex = billItems.findIndex(item => item.id === productToAdd.id);

    if (existingItemIndex > -1) {
      handleQuantityChange(productToAdd.id, billItems[existingItemIndex].quantity + 1);
    } else {
      setBillItems([...billItems, { ...productToAdd, quantity: 1 }]);
    }
    setSelectedProductId(""); // Reset combobox after adding
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setBillItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(0, newQuantity) } : item // Ensure quantity doesn't go below 0
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
     if (!clientName.trim()) {
       toast({
         title: "Client Name Required",
         description: "Please enter the client's name.",
         variant: "destructive",
       });
       return;
     }
    // Filter items with quantity > 0 *before* checking length
    const itemsToInclude = billItems.filter(item => item.quantity > 0);
    if (itemsToInclude.length === 0) {
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
               {/* Conditionally render loader or combobox */}
              {productOptions.length === 0 && availableProducts.length === 0 ? ( // Check if products are actually available
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
                    triggerClassName="h-10" // Match button height
                    inputId="product-select" // Link label
                    // disabled={isLoadingCategories} // Disable while loading categories
                  />
              )}
            </div>
            <Button
               onClick={addProductToBill}
               aria-label="Add selected product to bill"
               className="h-10"
               disabled={!selectedProductId || productOptions.length === 0} // Disable if no product selected or no options
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
             // Disable if no client name or no items with quantity > 0
             disabled={!clientName.trim() || billItems.filter(item => item.quantity > 0).length === 0}
          >
            <Printer className="mr-2 h-4 w-4" /> Generate & Preview Bill
          </Button>
        </CardFooter>
      </Card>

      <BillPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          clientName={clientName} // Pass client name
          items={billItems.filter(item => item.quantity > 0)} // Only include items with quantity > 0
          totalAmount={totalAmount}
        />
    </>
  )
}


