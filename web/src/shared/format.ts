import type { Order, Table } from '../types';

export const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const orderTotal = (order: Order) => order.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
export const tableName = (id: string, tables: Table[]) => tables.find((table) => table.id === id)?.name ?? 'Mesa removida';
export const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');