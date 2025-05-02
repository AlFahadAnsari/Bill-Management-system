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
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);
  // Added state to store the currently selected category
  const [selectedCategory, setSelectedCategory] = React.useState(initialData?.category || "");


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

  // Update form default values if initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        category: initialData.category,
        price: initialData.price,
        description: initialData.description || "",
        newCategory: "", // Reset new category input
      });
      setShowNewCategoryInput(false); // Hide new category input if editing
      setSelectedCategory(initialData.category);
    } else {
      form.reset({ name: "", category: "", price: 0, description: "", newCategory: "" }); // Reset for add mode
      setShowNewCategoryInput(false);
      setSelectedCategory("");
    }
  }, [initialData, form]);


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
      // If the category entered is "Add New Category", use the newCategory value
      let categoryValue = values.category;
      if (values.category === 'Add New Category') {
          if (!values.newCategory || values.newCategory.trim() === '') {
              // Handle error: new category name is required
              form.setError('newCategory', { type: 'required', message: 'New category name is required.' });
              return;
          }
          categoryValue = values.newCategory.trim();
      }

    const isNewCategory = !categories.some(cat => cat.value === categoryValue);
    if (isNewCategory && categoryValue.trim()) {
       // Optionally: You could add logic here to explicitly confirm adding a new category
       console.log("Adding new category:", categoryValue);
       // Add the new category to the state so it appears immediately if needed,
       // although getCategories will fetch it next time anyway.
       setCategories(prev => [...prev, { label: categoryValue, value: categoryValue }]);
    }
    await onSubmit({...values, category: categoryValue});
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
            const categoryOptions = [...categories];
            if (!showNewCategoryInput) {
              categoryOptions.push({ label: 'Add New Category', value: 'Add New Category' });
            }
            return (
              <FormItem className="flex flex-col"> {/* Ensure proper layout for Combobox */}
                <FormLabel>Category</FormLabel>
                <Combobox
                   options={categoryOptions}
                   value={selectedCategory}
                   onChange={(value) => {
                      // Allow selecting or typing a new category
                      setSelectedCategory(value);
                      form.setValue('category', value);
                      setShowNewCategoryInput(value === 'Add New Category');
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
                   />
                 </FormControl>
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
                          <Textarea placeholder="Enter product description" {...field} disabled={isSubmitting} />
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
