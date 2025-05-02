
import * as React from "react"
import { Plus, List, ShoppingBag } from "lucide-react" // Added ShoppingBag for title

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductTable } from "@/components/product-management/product-table"
import { ProductDialog } from "@/components/product-management/product-dialog"

// Import Server Actions for products
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/actions/product-actions"


// Admin Page Server Component
export default async function AdminPage() {
  // Fetch initial products on the server for the table
  const products = await getProducts();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary flex items-center justify-center gap-2">
        <ShoppingBag className="h-8 w-8" /> Admin - Product Management
      </h1>

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
              // Pass the add server action directly
              onSave={addProduct}
           />
        </CardHeader>
        <CardContent>
          {/* Product Table displays fetched products */}
          {/* It needs onDelete (to call the server action) and onUpdate (passed to row's edit dialog) */}
          <ProductTable
             products={products}
             onDelete={deleteProduct} // Pass the delete server action directly
             onUpdate={updateProduct} // Pass the update server action
           />
        </CardContent>
      </Card>

       {/* Link back to Billing Page (Optional) */}
       {/*
       <div className="mt-8 text-center">
           <a href="/" className="text-sm text-muted-foreground hover:text-primary underline">
               Go to Billing
           </a>
       </div>
        */}
    </main>
  );
}
