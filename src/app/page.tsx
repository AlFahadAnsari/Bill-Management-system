
import * as React from "react"
import { ReceiptText } from "lucide-react" // Removed Plus, Edit, List

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Removed Card components as they are no longer used directly here for products
// Removed ProductTable and ProductDialog imports
import { BillGenerator } from "@/components/bill-generation/bill-generator"
// Removed Product type import as it's only needed by BillGenerator which fetches its own data or receives it
// Removed useToast import

// Import only necessary Server Actions
import { getProducts } from "@/actions/product-actions" // Keep getProducts for BillGenerator

// This page is now primarily a Server Component focused on Billing
export default async function Home() {
  // Fetch initial products on the server for the Bill Generator
  const products = await getProducts();

  // Server Actions handle saving and deleting within the admin panel now.

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">BillEase</h1>

      {/* Simplified Tabs - Only showing Billing */}
      {/* Consider removing Tabs if only one section remains, or keep for future expansion */}
       <Tabs defaultValue="billing" className="w-full">
         <TabsList className="grid w-full grid-cols-1 mb-6"> {/* Changed grid-cols-2 to 1 */}
            <TabsTrigger value="billing">
                <ReceiptText className="mr-2 h-5 w-5" /> Bill Generation
            </TabsTrigger>
            {/* Product Management Trigger Removed */}
         </TabsList>

        {/* Bill Generation Tab */}
        <TabsContent value="billing">
           {/* Pass fetched products to BillGenerator */}
           <BillGenerator availableProducts={products} />
        </TabsContent>

        {/* Product Management Tab Content Removed */}
      </Tabs>

       {/* Link to Admin Panel (Optional - better placed in a shared layout/header) */}
       {/*
       <div className="mt-8 text-center">
           <a href="/admin" className="text-sm text-muted-foreground hover:text-primary underline">
               Manage Products (Admin)
           </a>
       </div>
        */}

    </main>
  );
}
