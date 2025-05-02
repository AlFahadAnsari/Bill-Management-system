
import * as React from "react"
import { Plus, Edit, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductTable } from "@/components/product-management/product-table"
import { ProductDialog } from "@/components/product-management/product-dialog"
import { BillGenerator } from "@/components/bill-generation/bill-generator"
import type { Product } from "@/types"
// Remove useToast import as it's now handled within server actions or client components directly if needed.
// We'll use server action return values or let ProductDialog handle its own toasts.

// Import Server Actions
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/actions/product-actions"


// This page is now primarily a Server Component
export default async function Home() {
  // Fetch initial products on the server
  const products = await getProducts();

  // The state for editingProduct needs to remain on the client if the dialog
  // is managed from this parent component. However, the current setup triggers
  // the edit dialog from within the ProductTable row, which is cleaner.
  // We'll keep the logic simplified here and assume the dialog trigger handles its state.


  // Server Actions handle saving and deleting, no client-side state manipulation needed here for the list itself.
  // The page will re-render with updated data due to revalidatePath in the actions.

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
           {/* Pass fetched products to BillGenerator */}
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
               {/* Add Product Dialog - Trigger only */}
               <ProductDialog
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  }
                  mode="add"
                  // onSave will be the server action passed directly
                  onSave={addProduct}
               />
            </CardHeader>
            <CardContent>
              {/* Product Table displays fetched products */}
              {/* It needs onEdit (to trigger the dialog) and onDelete (to call the server action) */}
              <ProductTable
                 products={products}
                 // onEdit needs to trigger the EDIT dialog. The actual update happens via the dialog's onSave prop.
                 // onEdit={() => {}} // Placeholder - Edit trigger is inside the table row component
                 onDelete={deleteProduct} // Pass the delete server action directly
                 // Pass the update server action to the table so it can pass it to the row's edit dialog trigger
                 onUpdate={updateProduct}
               />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

       {/*
         The separate Edit Dialog instance previously here is no longer necessary
         if the Edit button within the ProductTable row triggers its own ProductDialog
         instance, passing the specific product and the updateProduct action to it.
         This keeps state management more localized.
       */}

    </main>
  );
}
