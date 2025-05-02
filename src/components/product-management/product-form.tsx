// src/components/product-management/product-form.tsx
"use client"

import type * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Product } from "@/types"
import { DialogClose } from '@/components/ui/dialog'; // Import DialogClose for Cancel

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Category is required.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
})

interface ProductFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void | Promise<void>;
  initialData?: Product | null;
  buttonText?: string;
  isSubmitting?: boolean;
  onCancel?: () => void; // Add onCancel prop
}

export function ProductForm({
  onSubmit,
  initialData,
  buttonText = "Save Product",
  isSubmitting = false,
  onCancel // Destructure onCancel
}: ProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      price: initialData?.price || 0,
    },
  })

   // Reset form if initialData changes (e.g., when switching from add to edit in some scenarios)
   React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        category: initialData.category,
        price: initialData.price,
      });
    } else {
        form.reset({ name: "", category: "", price: 0 }); // Reset for add mode
    }
   }, [initialData, form]); // form added to dependency array


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    // Form reset is handled by useEffect or Dialog close now
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., T-Shirt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Clothing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="e.g., 19.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
           {/* Cancel Button */}
           <DialogClose asChild>
             <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
               Cancel
             </Button>
           </DialogClose>
           {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : buttonText}
          </Button>
        </div>
      </form>
    </Form>
  )
}
