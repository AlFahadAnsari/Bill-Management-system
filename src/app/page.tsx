"use client" // Required for state management (useState, useEffect)

import * as React from "react"
import { Plus, Edit, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductTable } from "@/components/product-management/product-table"
import { ProductDialog } from "@/components/product-management/product-dialog"
import { BillGenerator } from "@/components/bill-generation/bill-generator"
import type { Product } from "@/types"
import { useToast } from "@/hooks/use-toast"


// Mock data - replace with actual data fetching later
const initialProducts: Product[] = [
  { id: "1", name: "Classic T-Shirt", category: "Clothing", price: 19.99 },
  { id: "2", name: "Coffee Mug", category: "Homeware", price: 12.50 },
  { id: "3", name: "Wireless Mouse", category: "Electronics", price: 25.00 },
  { id: "4", name: "Notebook", category: "Stationery", price: 5.99 },
  { id: "5", name: "Premium Hoodie", category: "Clothing", price: 45.00 },
];


export default function Home() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

  // --- Product Management Logic ---

  const handleSaveProduct = async (data: Omit<Product, 'id'> | Product) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, you'd send this data to your backend API
    if ('id' in data) {
      // Edit existing product
      setProducts(currentProducts =>
        currentProducts.map(p => p.id === data.id ? data : p)
      );
      console.log("Updating product:", data);
      setEditingProduct(null); // Clear editing state
    } else {
      // Add new product
      const newProduct: Product = {
        ...data,
        id: String(Date.now()), // Use a better ID generation in a real app
      };
      setProducts(currentProducts => [...currentProducts, newProduct]);
      console.log("Adding new product:", newProduct);
    }
    // Toast notification is handled within ProductDialog
  };


  const handleDeleteProduct = async (productId: string) => {
     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 500));
     try {
       // In a real app, send delete request to backend
       setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
       console.log("Deleting product:", productId);
       toast({
         title: "Product Deleted",
         description: "The product has been successfully deleted.",
       });
     } catch (error) {
        console.error("Failed to delete product:", error);
        toast({
           title: "Error Deleting Product",
           description: "Could not delete product. Please try again.",
           variant: "destructive",
        });
        // Re-throw the error if the ProductTable needs to handle it as well
        throw error;
     }

  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    // The dialog will be opened by its trigger inside the table row
  };


  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">BillEase Management</h1>

      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="billing">Bill Generation</TabsTrigger>
          <TabsTrigger value="products">Product Management</TabsTrigger>
        </TabsList>

        {/* Bill Generation Tab */}
        <TabsContent value="billing">
           <BillGenerator availableProducts={products} />
        </TabsContent>

        {/* Product Management Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <List className="mr-2 h-5 w-5 text-primary" />
                  Manage Products
                </CardTitle>
                <CardDescription>Add, edit, or delete products available for billing.</CardDescription>
              </div>
               <ProductDialog
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  }
                  mode="add"
                  onSave={handleSaveProduct}
               />
            </CardHeader>
            <CardContent>
              <ProductTable
                 products={products}
                 onEdit={(product) => {
                    setEditingProduct(product);
                    // We need a way to trigger the dialog opening externally or manage state differently
                    // For now, the edit button in the table will trigger its own dialog instance.
                    // This requires passing the onSave handler down.
                 }}
                 onDelete={handleDeleteProduct}
               />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

       {/* Separate Edit Dialog instance - controlled by editingProduct state */}
        {editingProduct && (
            <ProductDialog
             trigger={<span/>} // Hidden trigger, dialog controlled by open prop below
             mode="edit"
             product={editingProduct}
             onSave={handleSaveProduct}
             // Control dialog visibility externally based on editingProduct state
             // This requires modifying ProductDialog to accept an 'open' prop and 'onOpenChange' handler
             // For simplicity, the current setup relies on the dialog being triggered from the table row.
             // If external control is needed, ProductDialog needs refactoring.
           />
       )}

    </main>
  );
}
