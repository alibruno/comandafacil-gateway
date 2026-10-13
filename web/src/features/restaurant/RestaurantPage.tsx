import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	Add, DeleteOutline, EditOutlined, EventSeatOutlined,
	RestaurantMenuOutlined, TableRestaurantOutlined,
} from '@mui/icons-material';
import {
	Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
	Divider, IconButton, MenuItem, Paper, Stack, Switch, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { useWorkspace } from '../../state/WorkspaceContext';
import { makeId, type Category, type Product, type Table } from '../../types';
import { money, shortDate } from '../../shared/format';

type EditTarget = { kind: 'table'; value: Table | null } | { kind: 'product'; value: Product | null };
type DeleteTarget = { kind: 'table'; value: Table } | { kind: 'product'; value: Product } | { kind: 'category'; value: Category };

export default function RestaurantPage() {
	const { tables, setTables, products, setProducts, categories, setCategories, orders } = useWorkspace();
	const [params, setParams] = useSearchParams();
	const [tab, setTab] = useState(params.get('tab') === 'cardapio' ? 1 : 0);
	const [categoryFilter, setCategoryFilter] = useState('todos');
	const [editor, setEditor] = useState<EditTarget | null>(null);
	const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
	const [categoryDialog, setCategoryDialog] = useState(false);
	const [categoryName, setCategoryName] = useState('');
	const [error, setError] = useState('');
	const [name, setName] = useState('');
	const [capacity, setCapacity] = useState(4);
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [categoryId, setCategoryId] = useState('');

	useEffect(() => setTab(params.get('tab') === 'cardapio' ? 1 : 0), [params]);
	useEffect(() => {
		if (!editor) return;
		setError('');
		if (editor.kind === 'table') {
			setName(editor.value?.name ?? '');
			setCapacity(editor.value?.capacity ?? 4);
		} else {
			setName(editor.value?.name ?? '');
			setCapacity(4);
			setDescription(editor.value?.description ?? '');
			setPrice(editor.value ? String(editor.value.price) : '');
			setCategoryId(editor.value?.categoryId ?? categories[0]?.id ?? '');
		}
	}, [editor, categories]);

	const occupied = tables.filter((table) => !table.available).length;
	const availableProducts = products.filter((product) => product.available).length;
	const visibleProducts = useMemo(() => categoryFilter === 'todos' ? products : products.filter((product) => product.categoryId === categoryFilter), [categoryFilter, products]);

	const selectTab = (_event: React.SyntheticEvent, next: number) => {
		setTab(next);
		setParams(next === 1 ? { tab: 'cardapio' } : {});
	};
	const submitEditor = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editor || !name.trim()) return;
		if (editor.kind === 'table') {
			const value: Table = { id: editor.value?.id ?? makeId(), name: name.trim(), capacity, createdAt: editor.value?.createdAt ?? new Date().toISOString().slice(0, 10), available: editor.value?.available ?? true };
			setTables((current) => editor.value ? current.map((table) => table.id === value.id ? value : table) : [...current, value]);
		} else {
			if (!categoryId || Number(price) <= 0) { setError('Escolha uma categoria e informe um preço maior que zero.'); return; }
			const value: Product = { id: editor.value?.id ?? makeId(), name: name.trim(), description: description.trim(), price: Number(price), categoryId, available: editor.value?.available ?? true };
			setProducts((current) => editor.value ? current.map((product) => product.id === value.id ? value : product) : [...current, value]);
		}
		setEditor(null);
	};

	const addCategory = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = categoryName.trim();
		if (!trimmed || categories.some((category) => category.name.toLocaleLowerCase('pt-BR') === trimmed.toLocaleLowerCase('pt-BR'))) return;
		const value = { id: makeId(), name: trimmed, active: true };
		setCategories((current) => [...current, value]);
		setCategoryId(value.id);
		setCategoryName('');
		setCategoryDialog(false);
	};

	const confirmDelete = () => {
		if (!deleting) return;
		if (deleting.kind === 'table') setTables((current) => current.filter((table) => table.id !== deleting.value.id));
		if (deleting.kind === 'product') setProducts((current) => current.filter((product) => product.id !== deleting.value.id));
		if (deleting.kind === 'category') {
			setCategories((current) => current.filter((category) => category.id !== deleting.value.id));
			setProducts((current) => current.filter((product) => product.categoryId !== deleting.value.id));
			if (categoryFilter === deleting.value.id) setCategoryFilter('todos');
		}
		setDeleting(null);
	};

	return (
		<Box className="page-enter" sx={{ display: 'grid', gap: 3 }}>
			<Box>
				<Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 650, textTransform: 'uppercase', letterSpacing: 1 }}>CONFIGURAÇÃO DA CASA</Typography>
				<Typography variant="h1" sx={{ fontSize: { xs: 32, sm: 40 }, mt: 0.8 }}>Salão e cardápio</Typography>
				<Typography sx={{ color: 'text.secondary', mt: 0.6, fontSize: 14 }}>Organize os espaços e os pratos da casa.</Typography>
			</Box>

			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
				<Summary icon={<TableRestaurantOutlined />} label="Mesas cadastradas" value={tables.length} detail={`${occupied} ocupadas`} />
				<Summary icon={<EventSeatOutlined />} label="Lugares disponíveis" value={tables.filter((table) => table.available).reduce((total, table) => total + table.capacity, 0)} detail="Capacidade livre" />
				<Summary icon={<RestaurantMenuOutlined />} label="Itens disponíveis" value={availableProducts} detail={`${categories.length} categorias`} />
			</Box>

			<Paper variant="outlined" sx={{ borderColor: '#e5e8e2', borderRadius: 1 }}>
				<Box sx={{ borderBottom: '1px solid #e9ebe6', px: 1.5 }}><Tabs value={tab} onChange={selectTab} aria-label="Gerenciar salão ou cardápio"><Tab label="Mesas" /><Tab label="Cardápio" /></Tabs></Box>
				{tab === 0 ? (
					<Box>
						<Box sx={{ p: 2.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
							<Box><Typography variant="h2" sx={{ fontSize: 20 }}>Mesas do salão</Typography><Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.4 }}>{tables.length} mesas cadastradas</Typography></Box>
							<Button variant="contained" startIcon={<Add />} onClick={() => setEditor({ kind: 'table', value: null })}>Nova mesa</Button>
						</Box>
						<Divider />
						<Box sx={{ overflowX: 'auto' }}><Box component="table" sx={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', textAlign: 'left' }}>
							<thead><tr>{['Mesa', 'Lugares', 'Cadastro', 'Disponibilidade', ''].map((label) => <Box component="th" key={label} sx={{ px: 2.2, py: 1.4, color: 'text.secondary', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Box>)}</tr></thead>
							<tbody>{tables.map((table) => <Box component="tr" className="data-row" key={table.id} sx={{ borderTop: '1px solid #eef0ec' }}>
								<Box component="td" sx={{ px: 2.2, py: 1.6, fontSize: 13, fontWeight: 650 }}>{table.name}</Box>
								<Box component="td" sx={{ px: 2.2, py: 1.6, fontSize: 12, color: 'text.secondary' }}>{table.capacity} lugares</Box>
								<Box component="td" sx={{ px: 2.2, py: 1.6, fontSize: 12, color: 'text.secondary' }}>{shortDate(table.createdAt)}</Box>
								<Box component="td" sx={{ px: 2.2, py: 1.6 }}><Chip size="small" label={table.available ? 'Disponível' : 'Ocupada'} sx={{ height: 24, fontSize: 10, fontWeight: 700, bgcolor: table.available ? '#e5f0e8' : '#f8e8e4', color: table.available ? '#387456' : '#a24c3e' }} /></Box>
								<Box component="td" sx={{ px: 1.5, py: 1, textAlign: 'right', whiteSpace: 'nowrap' }}>
									<Button size="small" color="inherit" onClick={() => setTables((current) => current.map((item) => item.id === table.id ? { ...item, available: !item.available } : item))}>{table.available ? 'Ocupar' : 'Liberar'}</Button>
									<IconButton size="small" aria-label={`Editar ${table.name}`} onClick={() => setEditor({ kind: 'table', value: table })}><EditOutlined fontSize="small" /></IconButton>
									<IconButton size="small" aria-label={`Excluir ${table.name}`} color="error" onClick={() => setDeleting({ kind: 'table', value: table })}><DeleteOutline fontSize="small" /></IconButton>
								</Box>
							</Box>)}</tbody>
						</Box></Box>
						{tables.length === 0 && <Typography sx={{ py: 5, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>Nenhuma mesa cadastrada.</Typography>}
					</Box>
				) : (
					<Box>
						<Box sx={{ p: 2.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
							<Box><Typography variant="h2" sx={{ fontSize: 20 }}>Cardápio da casa</Typography><Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.4 }}>{products.length} itens cadastrados</Typography></Box>
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Button variant="outlined" onClick={() => setCategoryDialog(true)}>Categorias</Button><Button variant="contained" startIcon={<Add />} onClick={() => { if (!categories.length) { setCategoryDialog(true); return; } setEditor({ kind: 'product', value: null }); }}>Novo produto</Button></Stack>
						</Box>
						<Divider />
						<Box sx={{ px: 2.2, py: 1.5, display: 'flex', gap: 0.8, overflowX: 'auto' }}>
							<Chip clickable label="Todas" onClick={() => setCategoryFilter('todos')} color={categoryFilter === 'todos' ? 'primary' : 'default'} />
							{categories.map((category) => <Chip key={category.id} clickable label={category.name} onClick={() => setCategoryFilter(category.id)} color={categoryFilter === category.id ? 'primary' : 'default'} />)}
						</Box>
						<Box sx={{ overflowX: 'auto' }}><Box component="table" sx={{ width: '100%', minWidth: 690, borderCollapse: 'collapse', textAlign: 'left' }}>
							<thead><tr>{['Produto', 'Categoria', 'Preço', 'Disponibilidade', ''].map((label) => <Box component="th" key={label} sx={{ px: 2.2, py: 1.4, color: 'text.secondary', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Box>)}</tr></thead>
							<tbody>{visibleProducts.map((product) => <Box component="tr" className="data-row" key={product.id} sx={{ borderTop: '1px solid #eef0ec' }}>
								<Box component="td" sx={{ px: 2.2, py: 1.4, maxWidth: 380 }}><Typography sx={{ fontSize: 13, fontWeight: 650 }}>{product.name}</Typography><Typography noWrap sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3 }}>{product.description}</Typography></Box>
								<Box component="td" sx={{ px: 2.2, py: 1.4, fontSize: 12, color: 'text.secondary' }}>{categories.find((category) => category.id === product.categoryId)?.name ?? 'Sem categoria'}</Box>
								<Box component="td" sx={{ px: 2.2, py: 1.4, fontSize: 12, fontWeight: 650 }}>{money(product.price)}</Box>
								<Box component="td" sx={{ px: 1.2, py: 1.4 }}><Stack direction="row" alignItems="center"><Switch size="small" checked={product.available} onChange={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, available: !item.available } : item))} inputProps={{ 'aria-label': `${product.available ? 'Desativar' : 'Ativar'} ${product.name}` }} /><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{product.available ? 'Disponível' : 'Indisponível'}</Typography></Stack></Box>
								<Box component="td" sx={{ px: 1.2, py: 1, textAlign: 'right', whiteSpace: 'nowrap' }}><IconButton size="small" aria-label={`Editar ${product.name}`} onClick={() => setEditor({ kind: 'product', value: product })}><EditOutlined fontSize="small" /></IconButton><IconButton size="small" aria-label={`Excluir ${product.name}`} color="error" onClick={() => setDeleting({ kind: 'product', value: product })}><DeleteOutline fontSize="small" /></IconButton></Box>
							</Box>)}</tbody>
						</Box></Box>
						{visibleProducts.length === 0 && <Typography sx={{ py: 5, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>Nenhum produto nesta categoria.</Typography>}
						{categories.length > 0 && <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ px: 2.2, py: 1.4, borderTop: '1px solid #eef0ec', flexWrap: 'wrap', gap: 1 }}>
							<Typography sx={{ fontSize: 11, color: 'text.secondary', alignSelf: 'center' }}>Categorias</Typography>
							{categories.map((category) => <Stack key={category.id} direction="row" alignItems="center" spacing={0.3}><Typography sx={{ fontSize: 11 }}>{category.name}</Typography><IconButton size="small" aria-label={`Excluir categoria ${category.name}`} onClick={() => setDeleting({ kind: 'category', value: category })}><DeleteOutline sx={{ fontSize: 16 }} /></IconButton></Stack>)}
						</Stack>}
					</Box>
				)}
			</Paper>

			<Dialog open={Boolean(editor)} onClose={() => setEditor(null)} fullWidth maxWidth="sm">
				<form onSubmit={submitEditor}>
					<DialogTitle sx={{ fontFamily: 'Fraunces, serif', fontSize: 24 }}>{editor?.kind === 'table' ? (editor.value ? 'Editar mesa' : 'Nova mesa') : (editor?.value ? 'Editar produto' : 'Novo produto')}</DialogTitle>
					<DialogContent sx={{ pt: '14px !important' }}><Stack spacing={2}>
						<TextField required autoFocus label={editor?.kind === 'table' ? 'Nome da mesa' : 'Nome do produto'} value={name} onChange={(event) => setName(event.target.value)} />
						{editor?.kind === 'table' ? <TextField required type="number" label="Capacidade" value={capacity} onChange={(event) => setCapacity(Math.max(1, Number(event.target.value)))} slotProps={{ htmlInput: { min: 1, max: 50 } }} /> : <>
							<TextField multiline minRows={2} label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} />
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
								<TextField required type="number" label="Preço (R$)" value={price} onChange={(event) => setPrice(event.target.value)} slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
								<TextField select required fullWidth label="Categoria" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}</TextField>
							</Stack>
						</>}
						{error && <Typography role="alert" sx={{ color: 'error.main', fontSize: 12 }}>{error}</Typography>}
					</Stack></DialogContent>
					<DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setEditor(null)} color="inherit">Cancelar</Button><Button type="submit" variant="contained">Salvar</Button></DialogActions>
				</form>
			</Dialog>

			<Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} fullWidth maxWidth="xs">
				<form onSubmit={addCategory}>
					<DialogTitle sx={{ fontFamily: 'Fraunces, serif', fontSize: 23 }}>Nova categoria</DialogTitle>
					<DialogContent sx={{ pt: '14px !important' }}><TextField autoFocus required fullWidth label="Nome da categoria" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} /></DialogContent>
					<DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setCategoryDialog(false)} color="inherit">Cancelar</Button><Button type="submit" variant="contained">Adicionar</Button></DialogActions>
				</form>
			</Dialog>

			<Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontFamily: 'Fraunces, serif', fontSize: 23 }}>Confirmar exclusão</DialogTitle>
				<DialogContent><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{deleting?.kind === 'table' ? (orders.some((order) => order.tableId === deleting.value.id && order.status !== 'finalizado') ? `A mesa ${deleting.value.name} possui pedidos em andamento e não pode ser excluída.` : `Excluir ${deleting.value.name}?`) : deleting?.kind === 'category' ? `Excluir a categoria ${deleting.value.name} também removerá os produtos associados.` : `Excluir ${deleting?.value.name}?`}</Typography></DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setDeleting(null)} color="inherit">Fechar</Button><Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting?.kind === 'table' && orders.some((order) => order.tableId === deleting.value.id && order.status !== 'finalizado')}>Excluir</Button></DialogActions>
			</Dialog>
		</Box>
	);
}

function Summary({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
	return <Paper variant="outlined" sx={{ p: 2, borderColor: '#e5e8e2', borderRadius: 1 }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{label}</Typography><Box sx={{ color: 'primary.main' }}>{icon}</Box></Stack><Typography sx={{ fontSize: 28, fontWeight: 700, mt: 1 }}>{value}</Typography><Typography sx={{ color: 'text.secondary', fontSize: 11, mt: 0.3 }}>{detail}</Typography></Paper>;
}