// src/components/product-management/product-dialog.tsx
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
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductForm } from "./product-form"
import type { Product } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ProductDialogProps {
  trigger: React.ReactNode;
  mode: "add" | "edit";
  product?: Product | null; // Product data is needed for edit mode initial values
  // onSave now accepts the appropriate server action type
  onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
  // Optional: Add an onOpenChange prop if external control is absolutely needed
  // open?: boolean;
  // onOpenChange?: (open: boolean) => void;
}

// Define the schema here or import if defined elsewhere
const formSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
});

export function ProductDialog({
  trigger,
  mode,
  product,
  onSave,
  // open: controlledOpen, // Use if external control is needed
  // onOpenChange: setControlledOpen // Use if external control is needed
}: ProductDialogProps) {
  // If not externally controlled, manage open state internally
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // Determine if the dialog's open state is controlled externally or internally
  // const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  // const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
   const open = internalOpen; // Simplified: Rely on internal state triggered by the button
   const setOpen = setInternalOpen;


  const title = mode === "add" ? "Add New Product" : "Edit Product";
  const description = mode === "add" ? "Fill in the details below to add a new product." : "Update the product details below.";
  const buttonText = mode === "add" ? "Add Product" : "Save Changes";

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Prepare data based on mode. Include ID for updates.
      const dataToSave = mode === 'edit' && product ? { ...values, id: product.id } : values;

      // Call the passed server action
      const result = await onSave(dataToSave);

      if (result.success) {
        setOpen(false); // Close dialog on successful save
        toast({
          title: `Product ${mode === 'add' ? 'added' : 'updated'}`,
          description: `"${values.name}" has been successfully ${mode === 'add' ? 'added' : 'updated'}.`,
        });
        // Revalidation happens via revalidatePath in the server action
      } else {
        // Display error from server action
        toast({
          title: `Error ${mode === 'add' ? 'adding' : 'updating'} product`,
          description: result.error || `Could not ${mode} product. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
       // Catch unexpected errors during the action call itself
       console.error(`Unexpected error during ${mode} product action:`, error);
       toast({
         title: `Error ${mode === 'add' ? 'adding' : 'updating'} product`,
         description: "An unexpected error occurred. Please try again.",
         variant: "destructive",
       });
    } finally {
       setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
       {/* Use DialogTrigger only if it's NOT externally controlled */}
       {/* {controlledOpen === undefined && <DialogTrigger asChild>{trigger}</DialogTrigger>} */}
       {/* Simplified: Always use trigger */}
       <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProductForm
          onSubmit={handleSave}
          // Pass the product data only in edit mode for initial values
          initialData={mode === 'edit' ? product : null}
          buttonText={buttonText}
          isSubmitting={isSubmitting}
          // Pass setOpen to allow the form to close the dialog on cancel
          onCancel={() => setOpen(false)}
        />
         {/* Footer with explicit cancel can be added if needed */}
         {/*
         <DialogFooter>
           <DialogClose asChild>
             <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
           </DialogClose>
         </DialogFooter>
          */}
      </DialogContent>
    </Dialog>
  );
}
