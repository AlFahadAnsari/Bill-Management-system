"use client"

import * as React from "react"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, // Import DialogFooter
  DialogClose   // Import DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductForm } from "./product-form"
import type { Product } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ProductDialogProps {
  trigger: React.ReactNode;
  mode: "add" | "edit";
  product?: Product | null;
  onSave: (data: Omit<Product, 'id'> | Product) => Promise<void>; // Returns promise for async handling
}

// Define the schema here or import if defined elsewhere
const formSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
});

export function ProductDialog({ trigger, mode, product, onSave }: ProductDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const title = mode === "add" ? "Add New Product" : "Edit Product";
  const description = mode === "add" ? "Fill in the details below to add a new product." : "Update the product details below.";
  const buttonText = mode === "add" ? "Add Product" : "Save Changes";

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const dataToSave = mode === 'edit' && product ? { ...values, id: product.id } : values;
      await onSave(dataToSave);
      setOpen(false); // Close dialog on successful save
      toast({
        title: `Product ${mode === 'add' ? 'added' : 'updated'}`,
        description: `"${values.name}" has been successfully ${mode === 'add' ? 'added' : 'updated'}.`,
      });
    } catch (error) {
       console.error(`Failed to ${mode} product:`, error);
       toast({
         title: `Error ${mode === 'add' ? 'adding' : 'updating'} product`,
         description: `Could not ${mode} product. Please try again.`,
         variant: "destructive",
       });
    } finally {
       setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProductForm
          onSubmit={handleSave}
          initialData={mode === 'edit' ? product : null}
          buttonText={buttonText}
          isSubmitting={isSubmitting}
        />
        {/* Add explicit close button if needed, or rely on form submission closing */}
         {/*
         <DialogFooter>
            <DialogClose asChild>
               <Button variant="outline">Cancel</Button>
           </DialogClose>
         </DialogFooter>
         */}
      </DialogContent>
    </Dialog>
  );
}
