export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  createdAt?: Date; // Optional, Prisma adds these
  updatedAt?: Date; // Optional, Prisma adds these
}

export interface BillItem extends Product {
  quantity: number;
}

export interface Bill {
  id: string;
  items: BillItem[];
  totalAmount: number;
  createdAt: Date;
}
