export type OrderStatus = 'cozinha' | 'preparo' | 'pronto' | 'finalizado';
export type OrderFilter = 'all' | OrderStatus;
export type OrderDialogMode = 'create' | 'edit' | 'view';

export interface OrderItem {
  id: string;
  name: string;
  detail: string;
  unitPrice: number;
  quantity: number;
  note: string;
}

export interface Order {
  id: string;
  table: string;
  waiter: string;
  items: OrderItem[];
  notes: string;
  total: number;
  status: OrderStatus;
  openedAt: string;
}

export type OrderDraft = Omit<Order, 'id' | 'openedAt'>;