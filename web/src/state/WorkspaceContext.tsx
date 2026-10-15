import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { apiRequest } from '../services/api';
import RestaurantSetupPage from '../features/restaurant/RestaurantSetupPage';
import type { Category, Order, OrderItem, OrderStatus, Product, Table } from '../types';
import { useAuth } from './AuthContext';

interface RestaurantDto {
	id: number;
	nome: string;
	ativo: boolean;
}

interface TableDto {
	id: number;
	nome: string;
	capacidade: number;
	dataCadastro: string;
	disponivel: boolean;
}

interface CategoryDto {
	id: number;
	nome: string;
	ativa: boolean;
}

interface ProductDto {
	id: number;
	categoriaId: number | null;
	nome: string;
	descricao: string;
	preco: number;
	disponivel: boolean;
}

interface OrderItemDto {
	id: number;
	produtoId: number;
	nomeProduto: string;
	precoUnitario: number;
	quantidade: number;
	observacao: string;
}

interface OrderDto {
	id: number;
	mesaId: number;
	garcomId: number | null;
	garcomNome: string;
	status: OrderStatus;
	notas: string;
	abertoEm: string;
	itens: OrderItemDto[];
}

type OrderDraft = Omit<Order, 'id' | 'openedAt'>;

interface WorkspaceValue {
	restaurant: RestaurantDto | null;
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
	reload: () => Promise<void>;
	createRestaurant: (name: string) => Promise<boolean>;
	tables: Table[];
	orders: Order[];
	products: Product[];
	categories: Category[];
	saveTable: (table: Table) => Promise<boolean>;
	deleteTable: (id: string) => Promise<boolean>;
	saveCategory: (category: Category) => Promise<Category | null>;
	deleteCategory: (id: string) => Promise<boolean>;
	saveProduct: (product: Product) => Promise<boolean>;
	deleteProduct: (id: string) => Promise<boolean>;
	saveOrder: (draft: OrderDraft, id: string | null) => Promise<boolean>;
	deleteOrder: (id: string) => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);
const PEDIDOS_API_PATH = '/api/pedidos/';

function mapTable(dto: TableDto): Table {
	return { id: String(dto.id), name: dto.nome, capacity: dto.capacidade, createdAt: dto.dataCadastro, available: dto.disponivel };
}

function mapCategory(dto: CategoryDto): Category {
	return { id: String(dto.id), name: dto.nome, active: dto.ativa };
}

function mapProduct(dto: ProductDto): Product {
	return { id: String(dto.id), name: dto.nome, description: dto.descricao ?? '', price: Number(dto.preco), available: dto.disponivel, categoryId: dto.categoriaId === null ? '' : String(dto.categoriaId) };
}

function mapOrderItem(dto: OrderItemDto): OrderItem {
	return { id: String(dto.id), productId: String(dto.produtoId), name: dto.nomeProduto, quantity: dto.quantidade, unitPrice: Number(dto.precoUnitario), note: dto.observacao ?? '' };
}

function mapOrder(dto: OrderDto): Order {
	return {
		id: String(dto.id),
		tableId: String(dto.mesaId),
		waiter: dto.garcomNome || (dto.garcomId ? `Atendente #${dto.garcomId}` : 'Não informado'),
		items: dto.itens.map(mapOrderItem),
		notes: dto.notas,
		status: dto.status,
		openedAt: new Date(dto.abertoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
	};
}

function numericId(id: string): number {
	const value = Number(id);
	if (!Number.isSafeInteger(value) || value < 1) throw new Error('O identificador recebido pelo servidor é inválido.');
	return value;
}

function requestOptions(method: string, body?: unknown): RequestInit {
	return { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) };
}

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : 'Não foi possível concluir a comunicação com o gateway.';
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
	const { token } = useAuth();
	const [restaurant, setRestaurant] = useState<RestaurantDto | null>(null);
	const [tables, setTables] = useState<Table[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadRestaurantData = useCallback(async (selectedRestaurant: RestaurantDto) => {
		if (!token) throw new Error('Sua sessão expirou. Entre novamente.');
		const prefix = `/api/restaurantes/${selectedRestaurant.id}`;
		const [tableDtos, categoryDtos, productDtos, orderDtos] = await Promise.all([
			apiRequest<TableDto[]>(token, `${prefix}/mesas`),
			apiRequest<CategoryDto[]>(token, `${prefix}/categorias`),
			apiRequest<ProductDto[]>(token, `${prefix}/produtos`),
			apiRequest<OrderDto[]>(token, PEDIDOS_API_PATH),
		]);
		setTables(tableDtos.map(mapTable));
		setCategories(categoryDtos.map(mapCategory));
		setProducts(productDtos.map(mapProduct));
		setOrders(orderDtos.map(mapOrder));
	}, [token]);

	const reload = useCallback(async () => {
		if (!token) {
			setIsLoading(false);
			return;
		}
		setError(null);
		setIsLoading(true);
		try {
			const restaurants = await apiRequest<RestaurantDto[]>(token, '/api/restaurantes');
			const selectedRestaurant = restaurants.find((item) => item.ativo) ?? restaurants[0] ?? null;
			setRestaurant(selectedRestaurant);
			if (selectedRestaurant) {
				await loadRestaurantData(selectedRestaurant);
			} else {
				setTables([]);
				setCategories([]);
				setProducts([]);
				setOrders([]);
			}
		} catch (requestError) {
			setError(errorText(requestError));
		} finally {
			setIsLoading(false);
		}
	}, [loadRestaurantData, token]);

	useEffect(() => {
		void reload();
	}, [reload]);

	const execute = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
		setError(null);
		try {
			return await action();
		} catch (requestError) {
			const message = errorText(requestError);
			setError(message);
			if (restaurant) {
				try {
					await loadRestaurantData(restaurant);
				} catch (refreshError) {
					setError(`${message} Não foi possível atualizar os dados: ${errorText(refreshError)}`);
				}
			}
			return null;
		}
	}, [loadRestaurantData, restaurant]);

	const createRestaurant = useCallback(async (name: string) => {
		if (!token) {
			setError('Sua sessão expirou. Entre novamente.');
			return false;
		}
		setError(null);
		try {
			const created = await apiRequest<RestaurantDto>(token, '/api/restaurantes', requestOptions('POST', { nome: name, ativo: true }));
			setRestaurant(created);
			await loadRestaurantData(created);
			return true;
		} catch (requestError) {
			setError(errorText(requestError));
			return false;
		}
	}, [loadRestaurantData, token]);

	const saveTable = useCallback(async (table: Table) => {
		if (!token || !restaurant) return false;
		const exists = tables.some((item) => item.id === table.id);
		const path = `/api/restaurantes/${restaurant.id}/mesas${exists ? `/${numericId(table.id)}` : ''}`;
		const dto = await execute(() => apiRequest<TableDto>(token, path, requestOptions(exists ? 'PATCH' : 'POST', {
			nome: table.name,
			capacidade: table.capacity,
			disponivel: table.available,
		})));
		if (!dto) return false;
		const saved = mapTable(dto);
		setTables((current) => exists ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
		return true;
	}, [execute, restaurant, tables, token]);

	const deleteTable = useCallback(async (id: string) => {
		if (!token || !restaurant) return false;
		const result = await execute(async () => {
			await apiRequest<void>(token, `/api/restaurantes/${restaurant.id}/mesas/${numericId(id)}`, requestOptions('DELETE'));
			return true;
		});
		if (!result) return false;
		setTables((current) => current.filter((table) => table.id !== id));
		return true;
	}, [execute, restaurant, token]);

	const saveCategory = useCallback(async (category: Category) => {
		if (!token || !restaurant) return null;
		const exists = categories.some((item) => item.id === category.id);
		const path = `/api/restaurantes/${restaurant.id}/categorias${exists ? `/${numericId(category.id)}` : ''}`;
		const dto = await execute(() => apiRequest<CategoryDto>(token, path, requestOptions(exists ? 'PATCH' : 'POST', {
			nome: category.name,
			ativa: category.active,
		})));
		if (!dto) return null;
		const saved = mapCategory(dto);
		setCategories((current) => exists ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
		return saved;
	}, [categories, execute, restaurant, token]);

	const deleteCategory = useCallback(async (id: string) => {
		if (!token || !restaurant) return false;
		const associatedProducts = products.filter((product) => product.categoryId === id);
		const result = await execute(async () => {
			for (const product of associatedProducts) {
				await apiRequest<void>(token, `/api/restaurantes/${restaurant.id}/produtos/${numericId(product.id)}`, requestOptions('DELETE'));
			}
			await apiRequest<void>(token, `/api/restaurantes/${restaurant.id}/categorias/${numericId(id)}`, requestOptions('DELETE'));
			return true;
		});
		if (!result) return false;
		setCategories((current) => current.filter((category) => category.id !== id));
		setProducts((current) => current.filter((product) => product.categoryId !== id));
		return true;
	}, [execute, products, restaurant, token]);

	const saveProduct = useCallback(async (product: Product) => {
		if (!token || !restaurant) return false;
		const exists = products.some((item) => item.id === product.id);
		const path = `/api/restaurantes/${restaurant.id}/produtos${exists ? `/${numericId(product.id)}` : ''}`;
		const dto = await execute(() => apiRequest<ProductDto>(token, path, requestOptions(exists ? 'PATCH' : 'POST', {
			categoriaId: numericId(product.categoryId),
			nome: product.name,
			descricao: product.description,
			preco: product.price,
			disponivel: product.available,
		})));
		if (!dto) return false;
		const saved = mapProduct(dto);
		setProducts((current) => exists ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
		return true;
	}, [execute, products, restaurant, token]);

	const deleteProduct = useCallback(async (id: string) => {
		if (!token || !restaurant) return false;
		const result = await execute(async () => {
			await apiRequest<void>(token, `/api/restaurantes/${restaurant.id}/produtos/${numericId(id)}`, requestOptions('DELETE'));
			return true;
		});
		if (!result) return false;
		setProducts((current) => current.filter((product) => product.id !== id));
		return true;
	}, [execute, restaurant, token]);

	const saveOrder = useCallback(async (draft: OrderDraft, id: string | null) => {
		if (!token || !restaurant) return false;
		const payload = {
			mesaId: numericId(draft.tableId),
			garcomId: null,
			garcomNome: draft.waiter,
			status: draft.status,
			notas: draft.notes,
			itens: draft.items.map((item) => ({
				produtoId: numericId(item.productId),
				nomeProduto: item.name,
				precoUnitario: item.unitPrice,
				quantidade: item.quantity,
				observacao: item.note,
			})),
		};
		const savedDto = await execute(() => apiRequest<OrderDto>(
			token,
			id ? `${PEDIDOS_API_PATH}${numericId(id)}/` : PEDIDOS_API_PATH,
			requestOptions(id ? 'PATCH' : 'POST', payload),
		));
		if (!savedDto) return false;
		const saved = mapOrder(savedDto);
		const updatedOrders = id
			? orders.map((order) => order.id === id ? saved : order)
			: [saved, ...orders];
		setOrders(updatedOrders);
		const affectedTableIds = new Set([saved.tableId, ...(id ? [orders.find((order) => order.id === id)?.tableId ?? saved.tableId] : [])]);
		for (const tableId of affectedTableIds) {
			const table = tables.find((item) => item.id === tableId);
			if (!table) continue;
			const available = !updatedOrders.some((order) => order.tableId === tableId && order.status !== 'finalizado');
			if (table.available !== available) {
				const updated = await execute(() => apiRequest<TableDto>(
					token,
					`/api/restaurantes/${restaurant.id}/mesas/${numericId(tableId)}`,
					requestOptions('PATCH', { nome: table.name, capacidade: table.capacity, disponivel: available }),
				));
				if (!updated) return true;
				setTables((current) => current.map((item) => item.id === tableId ? mapTable(updated) : item));
			}
		}
		return true;
	}, [execute, orders, restaurant, tables, token]);

	const deleteOrder = useCallback(async (id: string) => {
		if (!token) return false;
		const order = orders.find((item) => item.id === id);
		const result = await execute(async () => {
			await apiRequest<void>(token, `${PEDIDOS_API_PATH}${numericId(id)}/`, requestOptions('DELETE'));
			return true;
		});
		if (!result) return false;
		const updatedOrders = orders.filter((item) => item.id !== id);
		setOrders(updatedOrders);
		if (order && restaurant) {
			const table = tables.find((item) => item.id === order.tableId);
			const stillOccupied = updatedOrders.some((item) => item.tableId === order.tableId && item.status !== 'finalizado');
			if (table && table.available !== !stillOccupied) {
				const updated = await execute(() => apiRequest<TableDto>(
					token,
					`/api/restaurantes/${restaurant.id}/mesas/${numericId(table.id)}`,
					requestOptions('PATCH', { nome: table.name, capacidade: table.capacity, disponivel: !stillOccupied }),
				));
				if (!updated) return true;
				setTables((current) => current.map((item) => item.id === table.id ? mapTable(updated) : item));
			}
		}
		return true;
	}, [execute, orders, restaurant, tables, token]);

	const value = useMemo<WorkspaceValue>(() => ({
		restaurant, isLoading, error, clearError: () => setError(null), reload, createRestaurant,
		tables, orders, products, categories, saveTable, deleteTable, saveCategory, deleteCategory,
		saveProduct, deleteProduct, saveOrder, deleteOrder,
	}), [
		restaurant, isLoading, error, reload, createRestaurant, tables, orders, products, categories,
		saveTable, deleteTable, saveCategory, deleteCategory, saveProduct, deleteProduct, saveOrder, deleteOrder,
	]);

	return (
		<WorkspaceContext.Provider value={value}>
			{isLoading ? (
				<Box role="status" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
			) : (
				<>
					{error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
					{restaurant ? children : error ? (
						<Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'grid', placeContent: 'center', gap: 1, justifyItems: 'center', p: 3 }}>
							<Typography sx={{ color: 'text.secondary' }}>Não foi possível consultar os restaurantes.</Typography>
							<Button variant="contained" onClick={() => void reload()}>Tentar novamente</Button>
						</Box>
					) : <RestaurantSetupPage />}
				</>
			)}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	const value = useContext(WorkspaceContext);
	if (!value) throw new Error('useWorkspace precisa ser usado dentro de WorkspaceProvider.');
	return value;
}
