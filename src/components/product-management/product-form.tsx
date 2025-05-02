// src/components/product-management/product-form.tsx
"use client"

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from 'lucide-react'; // Import Loader icon

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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox" // Import Combobox
import type { Product } from "@/types"
import { DialogClose } from '@/components/ui/dialog'; // Import DialogClose for Cancel
import { getCategories } from '@/actions/category-actions'; // Import category action

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Category is required.", // Can be existing or new
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
})

// Removed hardcoded productCategories

interface ProductFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void | Promise<void>;
  initialData?: Product | null;
  buttonText?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function ProductForm({
  onSubmit,
  initialData,
  buttonText = "Save Product",
  isSubmitting = false,
  onCancel
}: ProductFormProps) {
  const [categories, setCategories] = React.useState<ComboboxOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      price: initialData?.price || 0,
    },
  })

  // Fetch categories on component mount
  React.useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      try {
        const fetchedCategories = await getCategories();
        const categoryOptions = fetchedCategories.map(cat => ({ label: cat, value: cat }));
        setCategories(categoryOptions);
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Handle error (e.g., show a toast message)
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Update form default values if initialData changes
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
  }, [initialData, form]);


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // If the category entered is not in the fetched list, it's a new category
    const isNewCategory = !categories.some(cat => cat.value === values.category);
    if (isNewCategory && values.category.trim()) {
       // Optionally: You could add logic here to explicitly confirm adding a new category
       console.log("Adding new category:", values.category);
       // Add the new category to the state so it appears immediately if needed,
       // although getCategories will fetch it next time anyway.
       setCategories(prev => [...prev, { label: values.category, value: values.category }]);
    }
    await onSubmit(values);
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
                <Input placeholder="e.g., Laptop" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="flex flex-col"> {/* Ensure proper layout for Combobox */}
              <FormLabel>Category</FormLabel>
              <Combobox
                 options={categories}
                 value={field.value}
                 onChange={(value) => {
                    // Allow selecting or typing a new category
                    field.onChange(value);
                 }}
                 placeholder="Select or type category..."
                 searchPlaceholder="Search or add category..."
                 emptyPlaceholder={isLoadingCategories ? "Loading categories..." : "No categories found. Type to add."}
                 disabled={isSubmitting || isLoadingCategories}
                 // Allow creating new entries implicitly by typing
                 // Note: The Combobox provided doesn't explicitly have a 'create' prop,
                 // it relies on the onChange handler and form submission logic.
                 // We update the field value directly.
               />
               {isLoadingCategories && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="e.g., 49999.99" {...field} disabled={isSubmitting}/>
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
          <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
            {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
            ) : (
                buttonText
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
