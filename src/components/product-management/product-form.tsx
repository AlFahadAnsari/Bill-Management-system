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
import { Textarea } from '@/components/ui/textarea';

// Schema includes newCategory for validation when 'Add New Category' is selected
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Category is required.", // Can be existing or new
  }),
  newCategory: z.string().optional(), // Optional field for new category name
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  description: z.string().optional(),
}).refine(data => {
    // If category is 'Add New Category', then newCategory must not be empty
    if (data.category === 'Add New Category') {
      return !!data.newCategory && data.newCategory.trim() !== '';
    }
    return true;
  }, {
    // Custom error message if refinement fails
    message: 'New category name is required.',
    path: ['newCategory'], // Path of the error
});


interface ProductFormProps {
  onSubmit: (values: Omit<z.infer<typeof formSchema>, 'newCategory'> & { category: string }) => void | Promise<void>; // Submit only the final category name
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
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);
  // Removed selectedCategory state - will rely on form state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      newCategory: "",
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

  // Update form default values if initialData changes (e.g., when editing)
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        category: initialData.category, // Set the initial category in the form state
        price: initialData.price,
        description: initialData.description || "",
        newCategory: "", // Reset new category input
      });
      // Hide new category input if editing an existing product
      setShowNewCategoryInput(false);
    } else {
      // Reset form for adding a new product
      form.reset({ name: "", category: "", price: 0, description: "", newCategory: "" });
      setShowNewCategoryInput(false);
    }
  }, [initialData, form.reset]); // Depend on form.reset to avoid potential issues

   // Watch the category field to show/hide the new category input
   const watchedCategory = form.watch('category');
   React.useEffect(() => {
       setShowNewCategoryInput(watchedCategory === 'Add New Category');
       // Clear the new category input if a different category is selected
       if (watchedCategory !== 'Add New Category') {
         form.setValue('newCategory', '');
       }
   }, [watchedCategory, form.setValue]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
      let finalCategory = values.category;
      // If 'Add New Category' was selected and validated, use the new category name
      if (values.category === 'Add New Category' && values.newCategory) {
          finalCategory = values.newCategory.trim();
      }

      const isNewCategory = !categories.some(cat => cat.value === finalCategory);
      if (isNewCategory && finalCategory) {
         console.log("Adding new category:", finalCategory);
         // Add the new category to the state optimistically
         // The backend action should handle the actual creation if needed
         setCategories(prev => [...prev, { label: finalCategory, value: finalCategory }]);
      }

      // Prepare data for submission, excluding the temporary newCategory field
      const dataToSubmit = {
        name: values.name,
        category: finalCategory,
        price: values.price,
        description: values.description,
      };

      await onSubmit(dataToSubmit);
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
          render={({ field }) => {
             // Dynamically add 'Add New Category' option if not already showing the input
             const categoryOptions = [...categories];
             if (!showNewCategoryInput) {
               // Ensure it's not added if it somehow already exists as a real category
               if (!categories.some(c => c.value === 'Add New Category')) {
                   categoryOptions.push({ label: 'Add New Category', value: 'Add New Category' });
               }
             }

            return (
              <FormItem className="flex flex-col"> {/* Ensure proper layout for Combobox */}
                <FormLabel>Category</FormLabel>
                 {/* Use field.value and field.onChange from react-hook-form */}
                <Combobox
                   options={categoryOptions}
                   value={field.value} // Use form state value
                   onChange={field.onChange} // Use form state onChange
                   placeholder="Select or type category..."
                   searchPlaceholder="Search or add category..."
                   emptyPlaceholder={isLoadingCategories ? "Loading categories..." : "No categories found. Type to add."}
                   disabled={isSubmitting || isLoadingCategories}
                   allowCustomValue // Allow typing custom values (handled on submit)
                 />
                 {isLoadingCategories && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Conditionally render new category input */}
        {showNewCategoryInput && (
           <FormField
             control={form.control}
             name="newCategory"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>New Category Name</FormLabel>
                 <FormControl>
                   <Input
                     placeholder="Enter new category name"
                     {...field}
                     disabled={isSubmitting}
                     // autoFocus // Optionally focus when it appears
                   />
                 </FormControl>
                 {/* Display validation error specifically for newCategory */}
                 <FormMessage />
               </FormItem>
             )}
           />
         )}

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
          <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                          <Textarea placeholder="Enter product description (optional)" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />
        <div className="flex justify-end space-x-2 pt-4">
          {/* Cancel Button */}
          {onCancel && ( // Only show Cancel if handler is provided
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
          )}
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

    