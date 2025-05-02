
"use client";

import type * as React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

import type { BillItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface BillItemRowProps {
  item: BillItem;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
}

export function BillItemRow({ item, onQuantityChange, onRemove }: BillItemRowProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onQuantityChange(item.id, newQuantity);
    } else if (e.target.value === '') {
      // Allow empty input, treat as 0 for calculation purposes
      onQuantityChange(item.id, 0);
    }
  };

  const incrementQuantity = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 0) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
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
      <TableCell className="text-right">₹{itemTotal}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Remove {item.name}</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

