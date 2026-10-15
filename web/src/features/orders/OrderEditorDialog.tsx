import { useEffect, useState, type FormEvent } from 'react';
import {
	Add, RemoveCircleOutline,
} from '@mui/icons-material';
import {
	Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
	MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import type { Order, OrderItem, OrderStatus, Product, Table } from '../../types';
import { makeId, statusLabels } from '../../types';
import { money, orderTotal } from '../../shared/format';

type OrderDraft = Omit<Order, 'id' | 'openedAt'>;

interface Props {
	open: boolean;
	order: Order | null;
	tables: Table[];
	products: Product[];
	onClose: () => void;
	onSave: (draft: OrderDraft) => Promise<boolean>;
}

const statuses: OrderStatus[] = ['cozinha', 'preparo', 'pronto', 'finalizado'];

export default function OrderEditorDialog({ open, order, tables, products, onClose, onSave }: Props) {
	const [tableId, setTableId] = useState('');
	const [waiter, setWaiter] = useState('');
	const [status, setStatus] = useState<OrderStatus>('cozinha');
	const [notes, setNotes] = useState('');
	const [items, setItems] = useState<OrderItem[]>([]);
	const [error, setError] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		const firstProduct = products[0];
		setTableId(order?.tableId ?? tables.find((table) => table.available)?.id ?? tables[0]?.id ?? '');
		setWaiter(order?.waiter ?? '');
		setStatus(order?.status ?? 'cozinha');
		setNotes(order?.notes ?? '');
		setItems(order?.items ?? (firstProduct ? [{ id: makeId(), productId: firstProduct.id, name: firstProduct.name, quantity: 1, unitPrice: firstProduct.price, note: '' }] : []));
		setError('');
	}, [open, order, products, tables]);

	const updateItem = (id: string, update: Partial<OrderItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...update } : item));
	const selectProduct = (itemId: string, productId: string) => {
		const product = products.find((candidate) => candidate.id === productId);
		if (product) updateItem(itemId, { productId, name: product.name, unitPrice: product.price });
	};
	const addItem = () => {
		const product = products[0];
		if (product) setItems((current) => [...current, { id: makeId(), productId: product.id, name: product.name, quantity: 1, unitPrice: product.price, note: '' }]);
	};

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!tableId || !waiter.trim() || !items.length || items.some((item) => item.quantity < 1)) {
			setError('Informe mesa, atendente e pelo menos um item com quantidade válida.');
			return;
		}
		setIsSaving(true);
		try {
			await onSave({ tableId, waiter: waiter.trim(), status, notes: notes.trim(), items });
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 1, m: 1.5 } }}>
			<form onSubmit={submit}>
				<DialogTitle sx={{ pb: 0.5, fontFamily: 'Fraunces, serif', fontSize: 25 }}>{order ? `Editar ${order.id}` : 'Novo pedido'}</DialogTitle>
				<DialogContent sx={{ pt: '18px !important' }}>
					<Stack spacing={2.2}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
							<TextField select fullWidth required label="Mesa" value={tableId} onChange={(event) => setTableId(event.target.value)}>
								{tables.filter((table) => table.available || table.id === order?.tableId).map((table) => <MenuItem key={table.id} value={table.id}>{table.name} · {table.capacity} lugares</MenuItem>)}
							</TextField>
							<TextField fullWidth required label="Atendente" value={waiter} onChange={(event) => setWaiter(event.target.value)} />
						</Stack>
						{order && <TextField select label="Etapa" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
							{statuses.map((value) => <MenuItem key={value} value={value}>{statusLabels[value]}</MenuItem>)}
						</TextField>}
						<BoxTitle title="Itens do pedido" action={<Button size="small" startIcon={<Add />} onClick={addItem} disabled={!products.length}>Adicionar</Button>} />
						{items.map((item) => (
							<Box key={item.id} sx={{ display: 'grid', gap: 0.8 }}>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
								<TextField select fullWidth label="Produto" value={item.productId} onChange={(event) => selectProduct(item.id, event.target.value)}>
									{products.map((product) => <MenuItem key={product.id} value={product.id}>{product.name} · {money(product.price)}</MenuItem>)}
								</TextField>
								<TextField label="Qtd." type="number" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Math.max(1, Number(event.target.value)) })} slotProps={{ htmlInput: { min: 1 } }} sx={{ width: { xs: '100%', sm: 92 } }} />
								<IconButton aria-label={`Remover ${item.name}`} onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))} color="error"><RemoveCircleOutline /></IconButton>
							</Stack>
							<TextField size="small" label={`Observação de ${item.name}`} value={item.note} onChange={(event) => updateItem(item.id, { note: event.target.value })} />
							</Box>
						))}
						{!items.length && <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Adicione um produto disponível no cardápio.</Typography>}
						{items.length > 0 && <Typography sx={{ textAlign: 'right', fontSize: 14, fontWeight: 700 }}>Total {money(orderTotal({ id: '', tableId, waiter, status, items, notes, openedAt: '' }))}</Typography>}
						<TextField label="Observações" multiline minRows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
						{error && <Typography role="alert" sx={{ color: 'error.main', fontSize: 12 }}>{error}</Typography>}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5 }}>
					<Button onClick={onClose} color="inherit">Cancelar</Button>
					<Button type="submit" variant="contained" disabled={isSaving}>{isSaving ? 'Salvando...' : order ? 'Salvar alterações' : 'Criar pedido'}</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

function BoxTitle({ title, action }: { title: string; action: React.ReactNode }) {
	return <Stack direction="row" alignItems="center" justifyContent="space-between"><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{title}</Typography>{action}</Stack>;
}