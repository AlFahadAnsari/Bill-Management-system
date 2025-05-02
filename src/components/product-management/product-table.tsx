// src/components/product-management/product-table.tsx
"use client"

import * as React from "react"
import { Edit, Trash2 } from "lucide-react"

import type { Product } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProductDialog } from "./product-dialog" // Import ProductDialog for editing
import { useToast } from "@/hooks/use-toast"


interface ProductTableProps {
  products: Product[];
  // Remove onEdit prop, edit is handled internally by the row
  // onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<{ success: boolean; error?: string }>; // Delete action
  onUpdate: (data: Product) => Promise<{ success: boolean; error?: string }>; // Update action
}

export function ProductTable({ products, onDelete, onUpdate }: ProductTableProps) {
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const result = await onDelete(productToDelete.id); // Call the server action
      if (result.success) {
        toast({
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been successfully deleted.`,
        });
        setProductToDelete(null); // Close dialog on success
        // Revalidation is handled by the server action
      } else {
         toast({
           title: "Error Deleting Product",
           description: result.error || "Could not delete product. Please try again.",
           variant: "destructive",
         });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
       toast({
         title: "Error Deleting Product",
         description: "An unexpected error occurred.",
         variant: "destructive",
       });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No products added yet. Add products using the button above.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell> {/* Changed $ to ₹ */}
                  <TableCell className="text-right">
                    {/* Edit Button triggers ProductDialog */}
                    <ProductDialog
                      mode="edit"
                      product={product}
                      onSave={onUpdate} // Pass the update server action
                      trigger={
                        <Button variant="ghost" size="icon" className="mr-2">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit {product.name}</span>
                        </Button>
                      }
                    />

                     {/* Delete Button triggers AlertDialog */}
                     <AlertDialog open={!!productToDelete && productToDelete.id === product.id} onOpenChange={(open) => !open && setProductToDelete(null)}>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => setProductToDelete(product)}>
                             <Trash2 className="h-4 w-4 text-destructive" />
                             <span className="sr-only">Delete {product.name}</span>
                           </Button>
                        </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                             This action cannot be undone. This will permanently delete the product "{productToDelete?.name}".
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? 'Deleting...' : 'Delete'}
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

