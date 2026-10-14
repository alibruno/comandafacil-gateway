export type OrderStatus = 'cozinha' | 'preparo' | 'pronto' | 'finalizado';

export interface Table {
	id: string;
	name: string;
	capacity: number;
	createdAt: string;
	available: boolean;
}

export interface Category {
	id: string;
	name: string;
	active: boolean;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	available: boolean;
	categoryId: string;
}

export interface OrderItem {
	id: string;
	productId: string;
	name: string;
	quantity: number;
	unitPrice: number;
	note: string;
}

export interface Order {
	id: string;
	tableId: string;
	waiter: string;
	items: OrderItem[];
	notes: string;
	status: OrderStatus;
	openedAt: string;
}

export const statusLabels: Record<OrderStatus, string> = {
	cozinha: 'Na cozinha',
	preparo: 'Em preparo',
	pronto: 'Pronto para servir',
	finalizado: 'Finalizado',
};

export const makeId = (): string => crypto.randomUUID();