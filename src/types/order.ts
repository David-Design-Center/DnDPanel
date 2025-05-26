export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
  createdBy?: string;
  dueDate?: string;
  paymentOption?: string;
  productDetails?: string;
  user?: string;
}