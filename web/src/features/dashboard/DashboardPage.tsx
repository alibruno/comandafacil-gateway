import { Link } from 'react-router-dom';
import {
	ArrowForwardOutlined, CheckCircleOutline, LunchDiningOutlined,
	ReceiptLongOutlined, TableRestaurantOutlined,
} from '@mui/icons-material';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useWorkspace } from '../../state/WorkspaceContext';
import { money, orderTotal, tableName } from '../../shared/format';
import StatusChip from '../../shared/StatusChip';

export default function DashboardPage() {
	const { orders, tables, products } = useWorkspace();
	const activeOrders = orders.filter((order) => order.status !== 'finalizado');
	const occupiedTables = tables.filter((table) => !table.available).length;
	const todaySales = orders.filter((order) => order.status === 'finalizado').reduce((sum, order) => sum + orderTotal(order), 0);
	const metrics = [
		{ label: 'Pedidos em andamento', value: activeOrders.length, meta: `${orders.length} pedidos no turno`, icon: <ReceiptLongOutlined />, tint: '#e5eee8' },
		{ label: 'Mesas ocupadas', value: `${occupiedTables}/${tables.length}`, meta: `${tables.length - occupiedTables} disponíveis agora`, icon: <TableRestaurantOutlined />, tint: '#f4e7dc' },
		{ label: 'Itens no cardápio', value: products.length, meta: `${products.filter((product) => product.available).length} disponíveis`, icon: <LunchDiningOutlined />, tint: '#f1ebd9' },
		{ label: 'Pedidos concluídos', value: orders.filter((order) => order.status === 'finalizado').length, meta: `${money(todaySales)} em pedidos encerrados`, icon: <CheckCircleOutline />, tint: '#e8e9e2' },
	];
	const recentOrders = [...orders].slice(0, 4);

	return (
		<Box className="page-enter" sx={{ display: 'grid', gap: 4 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
				<Box>
					<Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 650, textTransform: 'uppercase', letterSpacing: 1 }}>TERÇA-FEIRA · SERVIÇO DA NOITE</Typography>
					<Typography variant="h1" sx={{ fontSize: { xs: 32, sm: 40 }, mt: 0.8 }}>Tudo em ordem?</Typography>
					<Typography sx={{ color: 'text.secondary', mt: 0.6, fontSize: 14 }}>Aqui está o ritmo da casa neste momento.</Typography>
				</Box>
				<Button component={Link} to="/pedidos" variant="contained" endIcon={<ArrowForwardOutlined />} sx={{ px: 2, py: 1.1 }}>Acompanhar pedidos</Button>
			</Box>

			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
				{metrics.map((metric) => (
					<Paper key={metric.label} variant="outlined" sx={{ p: { xs: 1.6, sm: 2.2 }, borderColor: '#e5e8e2', borderRadius: 1, minHeight: 140 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
							<Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>{metric.label}</Typography>
							<Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: metric.tint, display: 'grid', placeItems: 'center', color: 'primary.main', flexShrink: 0 }}>{metric.icon}</Box>
						</Box>
						<Typography sx={{ fontSize: { xs: 22, sm: 28 }, fontWeight: 700, mt: 1.3, lineHeight: 1.1 }}>{metric.value}</Typography>
						<Typography sx={{ color: 'text.secondary', fontSize: 11, mt: 0.8 }}>{metric.meta}</Typography>
					</Paper>
				))}
			</Box>

			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.6fr) minmax(260px, 0.8fr)' }, gap: 3 }}>
				<Paper variant="outlined" sx={{ borderColor: '#e5e8e2', borderRadius: 1 }}>
					<Box sx={{ p: 2.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Box><Typography variant="h2" sx={{ fontSize: 20 }}>Pedidos recentes</Typography><Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.4 }}>Acompanhe o que está acontecendo na cozinha</Typography></Box>
						<Button component={Link} to="/pedidos" size="small" endIcon={<ArrowForwardOutlined />}>Ver todos</Button>
					</Box>
					<Divider />
					{recentOrders.length ? recentOrders.map((order, index) => (
						<Box key={order.id} className="data-row" sx={{ px: 2.2, py: 1.7, display: 'grid', gridTemplateColumns: '1fr auto', gap: 1.5, borderBottom: index < recentOrders.length - 1 ? '1px solid #eef0ec' : 0 }}>
							<Box sx={{ minWidth: 0 }}>
								<Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap"><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{order.id}</Typography><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{tableName(order.tableId, tables)}</Typography></Stack>
								<Typography noWrap sx={{ color: 'text.secondary', fontSize: 12, mt: 0.6 }}>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(' · ')}</Typography>
							</Box>
							<Box sx={{ display: 'grid', justifyItems: 'end', gap: 0.8 }}><StatusChip status={order.status} /><Typography sx={{ fontSize: 12, fontWeight: 700 }}>{money(orderTotal(order))}</Typography></Box>
						</Box>
					)) : <Typography sx={{ p: 3, color: 'text.secondary', fontSize: 13 }}>Nenhum pedido registrado.</Typography>}
				</Paper>

				<Box sx={{ display: 'grid', alignContent: 'start', gap: 2 }}>
					<Paper variant="outlined" sx={{ borderColor: '#e5e8e2', borderRadius: 1, p: 2.2 }}>
						<Typography variant="h2" sx={{ fontSize: 20 }}>O salão</Typography>
						<Box sx={{ mt: 2.4, display: 'flex', alignItems: 'baseline', gap: 0.8 }}><Typography sx={{ fontSize: 32, fontWeight: 700 }}>{occupiedTables}</Typography><Typography sx={{ color: 'text.secondary', fontSize: 13 }}>de {tables.length} mesas ocupadas</Typography></Box>
						<Box sx={{ mt: 1.3, height: 8, borderRadius: 6, bgcolor: '#e9ece7', overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${tables.length ? occupiedTables / tables.length * 100 : 0}%`, bgcolor: '#bd654a', transition: 'width 250ms ease' }} /></Box>
						<Button component={Link} to="/restaurante" size="small" sx={{ mt: 1.6, px: 0 }}>Gerenciar mesas</Button>
					</Paper>
					<Paper sx={{ borderRadius: 1, p: 2.3, bgcolor: '#244b43', color: '#fff', backgroundImage: 'linear-gradient(120deg, #244b43 0%, #315e50 100%)' }}>
						<Typography sx={{ color: '#bcd1c3', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pequeno cuidado</Typography>
						<Typography variant="h2" sx={{ fontSize: 21, mt: 0.8 }}>Cardápio atualizado?</Typography>
						<Typography sx={{ color: '#e0eae3', fontSize: 12, lineHeight: 1.7, mt: 0.8 }}>Revise a disponibilidade dos pratos antes de começar o serviço.</Typography>
						<Button component={Link} to="/restaurante?tab=cardapio" sx={{ mt: 1, color: '#fff', px: 0 }}>Abrir cardápio <ArrowForwardOutlined sx={{ ml: 0.8, fontSize: 17 }} /></Button>
					</Paper>
				</Box>
			</Box>
		</Box>
	);
}