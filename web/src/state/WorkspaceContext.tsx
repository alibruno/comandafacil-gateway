import { createContext, useContext, useEffect, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from 'react';
import { seedCategories, seedOrders, seedProducts, seedTables } from '../data/seed';
import type { Category, Order, Product, Table } from '../types';

function usePersistedState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
	const [value, setValue] = useState<T>(() => {
		try {
			const stored = localStorage.getItem(key);
			return stored ? (JSON.parse(stored) as T) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {
			return;
		}
	}, [key, value]);
	return [value, setValue];
}

interface WorkspaceValue {
	tables: Table[];
	setTables: Dispatch<SetStateAction<Table[]>>;
	orders: Order[];
	setOrders: Dispatch<SetStateAction<Order[]>>;
	products: Product[];
	setProducts: Dispatch<SetStateAction<Product[]>>;
	categories: Category[];
	setCategories: Dispatch<SetStateAction<Category[]>>;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: PropsWithChildren) {
	const [tables, setTables] = usePersistedState('comandafacil.tables', seedTables);
	const [orders, setOrders] = usePersistedState('comandafacil.orders', seedOrders);
	const [products, setProducts] = usePersistedState('comandafacil.products', seedProducts);
	const [categories, setCategories] = usePersistedState('comandafacil.categories', seedCategories);
	return (
		<WorkspaceContext.Provider value={{ tables, setTables, orders, setOrders, products, setProducts, categories, setCategories }}>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	const value = useContext(WorkspaceContext);
	if (!value) throw new Error('useWorkspace precisa ser usado dentro de WorkspaceProvider.');
	return value;
}