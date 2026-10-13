import type { Category, Order, Product, Table } from '../types';

export const seedTables: Table[] = [
	{ id: 'mesa-01', name: 'Mesa 01', capacity: 4, createdAt: '2026-09-12', available: true },
	{ id: 'mesa-02', name: 'Mesa 02', capacity: 2, createdAt: '2026-09-09', available: false },
	{ id: 'mesa-03', name: 'Mesa 03', capacity: 6, createdAt: '2026-08-28', available: false },
	{ id: 'mesa-04', name: 'Mesa 04', capacity: 4, createdAt: '2026-08-21', available: true },
	{ id: 'mesa-05', name: 'Mesa 05', capacity: 4, createdAt: '2026-08-18', available: false },
];

export const seedCategories: Category[] = [
	{ id: 'cat-pratos', name: 'Pratos principais', active: true },
	{ id: 'cat-entradas', name: 'Entradas', active: true },
	{ id: 'cat-bebidas', name: 'Bebidas', active: true },
	{ id: 'cat-sobremesas', name: 'Sobremesas', active: true },
];

export const seedProducts: Product[] = [
	{ id: 'prod-1', name: 'Boeuf Bourguignon', description: 'Cozido lentamente ao vinho tinto, com purê da casa.', price: 79, available: true, categoryId: 'cat-pratos' },
	{ id: 'prod-2', name: 'Risoto de Cogumelos', description: 'Arroz arbóreo, cogumelos frescos e parmesão.', price: 56, available: true, categoryId: 'cat-pratos' },
	{ id: 'prod-3', name: 'Croque Monsieur', description: 'Presunto artesanal, gruyère e molho béchamel.', price: 38.8, available: true, categoryId: 'cat-entradas' },
	{ id: 'prod-4', name: 'Sauvignon Blanc', description: 'Taça de vinho branco da casa.', price: 34, available: true, categoryId: 'cat-bebidas' },
	{ id: 'prod-5', name: 'Tarte Tatin', description: 'Maçãs caramelizadas, massa folhada e creme fresco.', price: 32, available: false, categoryId: 'cat-sobremesas' },
];

export const seedOrders: Order[] = [
	{
		id: 'PED-1054', tableId: 'mesa-02', waiter: 'Jean-Pierre',
		items: [
			{ id: 'item-1', productId: 'prod-1', name: 'Boeuf Bourguignon', quantity: 2, unitPrice: 79, note: 'Ao ponto' },
			{ id: 'item-2', productId: 'prod-3', name: 'Croque Monsieur', quantity: 1, unitPrice: 38.8, note: '' },
		], notes: 'Molho à parte; pão bem crocante.', status: 'preparo', openedAt: 'há 14 min',
	},
	{
		id: 'PED-1053', tableId: 'mesa-05', waiter: 'Marcella V.',
		items: [{ id: 'item-3', productId: 'prod-2', name: 'Risoto de Cogumelos', quantity: 2, unitPrice: 56, note: '' }],
		notes: 'Ponto da carne menos.', status: 'cozinha', openedAt: 'há 6 min',
	},
	{
		id: 'PED-1052', tableId: 'mesa-03', waiter: 'Jean-Pierre',
		items: [{ id: 'item-4', productId: 'prod-4', name: 'Sauvignon Blanc', quantity: 2, unitPrice: 34, note: '' }],
		notes: '', status: 'pronto', openedAt: 'há 28 min',
	},
	{
		id: 'PED-1051', tableId: 'mesa-01', waiter: 'Thomas B.',
		items: [{ id: 'item-5', productId: 'prod-1', name: 'Boeuf Bourguignon', quantity: 1, unitPrice: 79, note: '' }],
		notes: 'Mesa de celebração.', status: 'finalizado', openedAt: 'às 19:54',
	},
];