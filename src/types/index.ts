export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // This is the base price from the database
  createdAt?: Date; // Optional, Prisma adds these
  updatedAt?: Date; // Optional, Prisma adds these
  description?: string;
}

export interface BillItem extends Product {
  quantity: number;
  // Note: The 'billPrice' override is handled within the components
  // (BillGenerator, BillItemRow) where it's needed, not necessarily
  // required in the base type unless you plan to store overridden prices.
  // If you DO store it, add: billPrice?: number;
}


export interface Bill {
  id: string;
  items: BillItem[]; // These items might have overridden prices when generated/saved
  totalAmount: number;
  createdAt: Date;
}
