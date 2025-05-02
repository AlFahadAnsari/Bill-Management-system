export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
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
