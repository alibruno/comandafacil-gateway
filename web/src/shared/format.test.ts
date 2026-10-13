import { describe, expect, it } from 'vitest';
import { money, orderTotal, tableName } from './format';
import type { Order, Table } from '../types';

const order: Order = {
	id: 'PED-1',
	tableId: 'mesa-1',
	waiter: 'Ana',
	items: [
		{ id: 'item-1', productId: 'prod-1', name: 'Prato', quantity: 2, unitPrice: 18.5, note: '' },
		{ id: 'item-2', productId: 'prod-2', name: 'Suco', quantity: 1, unitPrice: 7, note: '' },
	],
	notes: '',
	status: 'cozinha',
	openedAt: 'agora',
};

describe('format helpers', () => {
	it('soma os subtotais dos itens do pedido', () => {
		expect(orderTotal(order)).toBe(44);
	});

	it('formata valores como moeda brasileira', () => {
		expect(money(44).replace(/\u00a0/g, ' ')).toBe('R$ 44,00');
	});

	it('resolve mesa por id e indica referência removida', () => {
		const tables: Table[] = [{ id: 'mesa-1', name: 'Mesa 01', capacity: 4, createdAt: '2026-10-01', available: true }];
		expect(tableName('mesa-1', tables)).toBe('Mesa 01');
		expect(tableName('missing', tables)).toBe('Mesa removida');
	});
});