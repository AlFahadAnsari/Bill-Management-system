"use client";

import type * as React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

import type { BillItem } from '@/types'; // Keep using the base BillItem type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Define a more specific type for the item within this component's context,
// including the potentially overridden bill price.
interface BillItemWithBillPrice extends BillItem {
  billPrice?: number; // Optional price for this specific bill item
}

interface BillItemRowProps {
  item: BillItemWithBillPrice; // Use the extended type
  // Unified handler for changing quantity or price
  onItemChange: (productId: string, field: 'quantity' | 'billPrice', value: number) => void;
  onRemove: (productId: string) => void;
}

export function BillItemRow({ item, onItemChange, onRemove }: BillItemRowProps) {

  // Use the overridden bill price if available, otherwise the original product price
  const displayPrice = item.billPrice ?? item.price;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onItemChange(item.id, 'quantity', newQuantity);
    } else if (e.target.value === '') {
      // Allow empty input, treat as 0 for calculation purposes
      onItemChange(item.id, 'quantity', 0);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPriceString = e.target.value;
      // Allow empty input or valid numbers (including decimals)
      if (newPriceString === '') {
          onItemChange(item.id, 'billPrice', item.price); // Reset to original if empty
      } else {
          const newPrice = parseFloat(newPriceString);
          if (!isNaN(newPrice) && newPrice >= 0) {
              onItemChange(item.id, 'billPrice', newPrice);
          }
      }
  };

  const incrementQuantity = () => {
    onItemChange(item.id, 'quantity', item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 0) {
      onItemChange(item.id, 'quantity', item.quantity - 1);
    }
  };

  // Calculate item total using the display price
  const itemTotal = (displayPrice * item.quantity).toFixed(2);

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.category}</TableCell>
      {/* Unit Price Cell - Now an Input */}
      <TableCell className="text-right w-32">
         <div className="flex items-center justify-end">
           <span className="mr-1">₹</span>
           <Input
             type="number"
             step="0.01"
             min="0"
             value={displayPrice.toFixed(2)} // Display formatted price
             onChange={handlePriceChange}
             className="h-8 w-24 text-right px-1" // Adjust width as needed
             aria-label={`Unit price for ${item.name}`}
           />
         </div>
      </TableCell>
       {/* Quantity Cell */}
      <TableCell className="text-center">
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={decrementQuantity}
            disabled={item.quantity <= 0}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <Input
            type="number"
            min="0"
            value={item.quantity === 0 && document.activeElement !== e?.target ? '' : item.quantity} // Show empty if 0 and not focused
            onChange={handleQuantityChange}
            className="h-8 w-16 text-center px-1"
            aria-label={`Quantity for ${item.name}`}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={incrementQuantity}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      </TableCell>
       {/* Total Cell */}
      <TableCell className="text-right">₹{itemTotal}</TableCell>
      {/* Remove Cell */}
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Remove {item.name}</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
