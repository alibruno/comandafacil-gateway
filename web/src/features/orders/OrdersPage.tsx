import { useMemo, useState } from 'react';
import {
	Add, DeleteOutline, EditOutlined, Search, VisibilityOutlined,
} from '@mui/icons-material';
import {
	Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
	IconButton, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import OrderEditorDialog from './OrderEditorDialog';
import { useWorkspace } from '../../state/WorkspaceContext';
import { statusLabels, type Order, type OrderStatus } from '../../types';
import { money, orderTotal, tableName } from '../../shared/format';
import StatusChip from '../../shared/StatusChip';

type Filter = 'todos' | OrderStatus;
type OrderDraft = Omit<Order, 'id' | 'openedAt'>;
const filters: Filter[] = ['todos', 'cozinha', 'preparo', 'pronto', 'finalizado'];

export default function OrdersPage() {
	const { orders, tables, products, saveOrder: persistOrder, deleteOrder: removeOrder } = useWorkspace();
	const [filter, setFilter] = useState<Filter>('todos');
	const [search, setSearch] = useState('');
	const [editorOpen, setEditorOpen] = useState(false);
	const [editing, setEditing] = useState<Order | null>(null);
	const [viewing, setViewing] = useState<Order | null>(null);
	const [deleting, setDeleting] = useState<Order | null>(null);

	const counts = useMemo(() => ({
		todos: orders.length,
		cozinha: orders.filter((order) => order.status === 'cozinha').length,
		preparo: orders.filter((order) => order.status === 'preparo').length,
		pronto: orders.filter((order) => order.status === 'pronto').length,
		finalizado: orders.filter((order) => order.status === 'finalizado').length,
	}), [orders]);
	const visibleOrders = orders.filter((order) => {
		const matchesFilter = filter === 'todos' || order.status === filter;
		const haystack = `${order.id} ${order.waiter} ${tableName(order.tableId, tables)} ${order.items.map((item) => item.name).join(' ')}`.toLocaleLowerCase('pt-BR');
		return matchesFilter && haystack.includes(search.toLocaleLowerCase('pt-BR'));
	});

	const saveOrder = async (draft: OrderDraft) => {
		if (!await persistOrder(draft, editing?.id ?? null)) return false;
		setEditorOpen(false);
		setEditing(null);
		return true;
	};

	const deleteOrder = async () => {
		if (!deleting) return;
		if (await removeOrder(deleting.id)) setDeleting(null);
	};
	const openCreate = () => { setEditing(null); setEditorOpen(true); };
	const openEdit = (order: Order) => { setEditing(order); setEditorOpen(true); };
	const activeCount = orders.filter((order) => order.status !== 'finalizado').length;

	return (
		<Box className="page-enter" sx={{ display: 'grid', gap: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
				<Box>
					<Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 650, textTransform: 'uppercase', letterSpacing: 1 }}>COZINHA E ATENDIMENTO</Typography>
					<Typography variant="h1" sx={{ fontSize: { xs: 32, sm: 40 }, mt: 0.8 }}>Pedidos</Typography>
					<Typography sx={{ color: 'text.secondary', mt: 0.6, fontSize: 14 }}>{activeCount} pedidos em andamento neste turno.</Typography>
				</Box>
				<Button variant="contained" startIcon={<Add />} onClick={openCreate}>Novo pedido</Button>
			</Box>

			<Paper variant="outlined" sx={{ p: { xs: 1.3, sm: 2 }, borderColor: '#e5e8e2', borderRadius: 1, display: 'grid', gap: 2 }}>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ md: 'center' }}>
					<Box><Typography variant="h2" sx={{ fontSize: 20 }}>Pedidos do turno</Typography><Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.4 }}>{visibleOrders.length} de {orders.length} comandas</Typography></Box>
					<TextField size="small" placeholder="Buscar pedido, mesa ou prato" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 19 }} /> } }} sx={{ width: { xs: '100%', md: 280 } }} />
				</Stack>
				<Box sx={{ overflowX: 'auto', pb: 0.3 }}>
					<ToggleButtonGroup exclusive value={filter} onChange={(_, value: Filter | null) => value && setFilter(value)} aria-label="Filtrar pedidos por etapa" size="small" sx={{ minWidth: 'max-content', '& .MuiToggleButton-root': { px: 1.2, py: 0.7, fontSize: 11, borderColor: '#e5e8e2', textTransform: 'none' }, '& .Mui-selected': { bgcolor: '#e5eee8 !important', color: '#244b43', fontWeight: 700 } }}>
						{filters.map((value) => <ToggleButton key={value} value={value}>{value === 'todos' ? 'Todos' : statusLabels[value]} <Box component="span" sx={{ ml: 0.7, color: 'text.secondary' }}>{counts[value]}</Box></ToggleButton>)}
					</ToggleButtonGroup>
				</Box>
			</Paper>

			<Box sx={{ display: 'grid', gap: 1.3 }}>
				{visibleOrders.map((order) => (
					<Paper key={order.id} variant="outlined" sx={{ borderColor: '#e5e8e2', borderRadius: 1, p: { xs: 1.7, sm: 2.2 }, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: { xs: 1.2, sm: 2.5 }, alignItems: 'center' }}>
						<Box sx={{ minWidth: 0 }}>
							<Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap" spacing={1}>
								<Typography sx={{ fontWeight: 700, fontSize: 14 }}>{order.id}</Typography>
								<Chip size="small" label={tableName(order.tableId, tables)} sx={{ height: 23, fontSize: 10, bgcolor: '#f2f3ef' }} />
								<StatusChip status={order.status} />
							</Stack>
							<Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(' · ')}</Typography>
							{order.notes && <Typography sx={{ color: '#8b634f', fontSize: 11, mt: 0.65 }}>Nota: {order.notes}</Typography>}
							<Stack direction="row" spacing={1.5} sx={{ mt: 1.1 }}><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{order.waiter}</Typography><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{order.openedAt}</Typography></Stack>
						</Box>
						<Box sx={{ display: 'grid', justifyItems: 'end', gap: 1 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{money(orderTotal(order))}</Typography>
							<Stack direction="row" spacing={0.2}>
								<IconButton aria-label={`Visualizar pedido ${order.id}`} size="small" onClick={() => setViewing(order)}><VisibilityOutlined fontSize="small" /></IconButton>
								<IconButton aria-label={`Editar pedido ${order.id}`} size="small" onClick={() => openEdit(order)}><EditOutlined fontSize="small" /></IconButton>
								<IconButton aria-label={`Excluir pedido ${order.id}`} size="small" color="error" onClick={() => setDeleting(order)}><DeleteOutline fontSize="small" /></IconButton>
							</Stack>
						</Box>
					</Paper>
				))}
				{!visibleOrders.length && <Paper variant="outlined" sx={{ py: 7, borderColor: '#e5e8e2', textAlign: 'center', color: 'text.secondary' }}><Typography sx={{ fontSize: 14 }}>Nenhum pedido encontrado nesta etapa.</Typography></Paper>}
			</Box>

			<OrderEditorDialog open={editorOpen} order={editing} tables={tables} products={products.filter((product) => product.available || editing?.items.some((item) => item.productId === product.id))} onClose={() => { setEditorOpen(false); setEditing(null); }} onSave={saveOrder} />
			<Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="sm">
				{viewing && <>
					<DialogTitle sx={{ fontFamily: 'Fraunces, serif', fontSize: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>{viewing.id}<StatusChip status={viewing.status} /></DialogTitle>
					<DialogContent dividers>
						<Stack direction="row" spacing={3} sx={{ mb: 2 }}><Box><Typography sx={{ color: 'text.secondary', fontSize: 11 }}>MESA</Typography><Typography sx={{ fontSize: 13, fontWeight: 650 }}>{tableName(viewing.tableId, tables)}</Typography></Box><Box><Typography sx={{ color: 'text.secondary', fontSize: 11 }}>ATENDENTE</Typography><Typography sx={{ fontSize: 13, fontWeight: 650 }}>{viewing.waiter}</Typography></Box><Box><Typography sx={{ color: 'text.secondary', fontSize: 11 }}>ABERTO</Typography><Typography sx={{ fontSize: 13, fontWeight: 650 }}>{viewing.openedAt}</Typography></Box></Stack>
						<Divider />
						<Stack spacing={1.2} sx={{ py: 2 }}>{viewing.items.map((item) => <Stack key={item.id} direction="row" justifyContent="space-between" gap={2}><Box><Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.quantity}× {item.name}</Typography>{item.note && <Typography sx={{ color: 'text.secondary', fontSize: 11, mt: 0.3 }}>{item.note}</Typography>}</Box><Typography sx={{ fontSize: 13, whiteSpace: 'nowrap' }}>{money(item.unitPrice * item.quantity)}</Typography></Stack>)}</Stack>
						<Divider />
						<Stack direction="row" justifyContent="space-between" sx={{ pt: 1.5 }}><Typography sx={{ fontSize: 13, fontWeight: 700 }}>Total</Typography><Typography sx={{ fontSize: 14, fontWeight: 700 }}>{money(orderTotal(viewing))}</Typography></Stack>
						{viewing.notes && <Box sx={{ mt: 2, p: 1.3, bgcolor: '#f6f5f0', borderRadius: 1 }}><Typography sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Observações do pedido</Typography><Typography sx={{ fontSize: 12, mt: 0.5 }}>{viewing.notes}</Typography></Box>}
					</DialogContent>
					<DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setViewing(null)} color="inherit">Fechar</Button><Button variant="contained" onClick={() => { const order = viewing; setViewing(null); openEdit(order); }}>Editar pedido</Button></DialogActions>
				</>}
			</Dialog>
			<Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontFamily: 'Fraunces, serif', fontSize: 23 }}>Excluir pedido?</DialogTitle>
				<DialogContent><Typography sx={{ color: 'text.secondary', fontSize: 13 }}>O pedido {deleting?.id} será removido. Esta ação não pode ser desfeita.</Typography></DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setDeleting(null)} color="inherit">Manter pedido</Button><Button onClick={deleteOrder} color="error" variant="contained">Excluir pedido</Button></DialogActions>
			</Dialog>
		</Box>
	);
}