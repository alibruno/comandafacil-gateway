import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
	Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon,
	ListItemText, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../state/AuthContext';
import { currentDateLabel } from '../shared/format';

const navigation = [
	{ label: 'Visão geral', to: '/', icon: <DashboardOutlinedIcon /> },
	{ label: 'Pedidos', to: '/pedidos', icon: <ReceiptLongOutlinedIcon /> },
	{ label: 'Salão e cardápio', to: '/restaurante', icon: <TableRestaurantOutlinedIcon /> },
];

function Navigation({ onNavigate, name, email }: { onNavigate?: () => void; name: string; email: string }) {
	return (
		<>
			<Box sx={{ px: 2.5, pt: 3.5, pb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<Box sx={{ width: 35, height: 35, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontSize: 21 }}>c</Box>
				<Box>
					<Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 650, lineHeight: 1.1 }}>comanda<span style={{ color: '#bd654a' }}>fácil</span></Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: 10, mt: 0.4, letterSpacing: 0.3 }}>PAINEL DO RESTAURANTE</Typography>
				</Box>
			</Box>
			<Typography sx={{ px: 3, mb: 1, color: '#929991', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 }}>Operação</Typography>
			<List sx={{ px: 1.5, pt: 0 }}>
				{navigation.map((item) => (
					<ListItemButton
						key={item.to}
						component={NavLink}
						to={item.to}
						end={item.to === '/'}
						onClick={onNavigate}
						className="nav-link"
						sx={{ borderRadius: 1, minHeight: 46, mb: 0.5, px: 1.5, color: 'text.secondary', '&[aria-current="page"] .MuiListItemIcon-root': { color: '#fff' } }}
					>
						<ListItemIcon sx={{ minWidth: 37, color: 'inherit' }}>{item.icon}</ListItemIcon>
						<ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
					</ListItemButton>
				))}
			</List>
			<Box sx={{ mt: 'auto', mx: 2, mb: 2, p: 1.5, borderTop: '1px solid #e8ebe6', display: 'flex', alignItems: 'center', gap: 1.2 }}>
				<Avatar sx={{ width: 34, height: 34, bgcolor: '#e9d7c8', color: '#634d3c', fontSize: 12, fontWeight: 700 }}>{name.slice(0, 2).toUpperCase()}</Avatar>
				<Box sx={{ minWidth: 0 }}>
					<Typography noWrap sx={{ fontSize: 12, fontWeight: 700 }}>{name}</Typography>
					<Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{email}</Typography>
				</Box>
			</Box>
		</>
	);
}

export default function AppShell() {
	const theme = useTheme();
	const mobile = useMediaQuery(theme.breakpoints.down('md'));
	const [drawerOpen, setDrawerOpen] = useState(false);
	const location = useLocation();
	const { user, signOut } = useAuth();
	const pageTitle = location.pathname === '/pedidos' ? 'Pedidos' : location.pathname === '/restaurante' ? 'Salão e cardápio' : 'Visão geral';
	const userName = user?.name ?? '';
	const userEmail = user?.email ?? '';
	const drawerContent = <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}><Navigation onNavigate={() => setDrawerOpen(false)} name={userName} email={userEmail} /></Box>;

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex' }}>
			{mobile ? (
				<Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
					<Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}><IconButton aria-label="Fechar menu" onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton></Box>
					{drawerContent}
				</Drawer>
			) : (
				<Box component="aside" sx={{ width: 250, flexShrink: 0, bgcolor: '#fff', borderRight: '1px solid #e9ebe6', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', inset: '0 auto 0 0' }}>
					<Navigation name={userName} email={userEmail} />
				</Box>
			)}
			<Box component="main" sx={{ flex: 1, minWidth: 0, ml: { md: '250px' } }}>
				<Box component="header" sx={{ height: 64, px: { xs: 2, sm: 3.5, lg: 5 }, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.72)', borderBottom: '1px solid #e9ebe6' }}>
					{mobile && <IconButton aria-label="Abrir menu" onClick={() => setDrawerOpen(true)} edge="start"><MenuIcon /></IconButton>}
					<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{pageTitle}</Typography>
					<Typography sx={{ ml: 'auto', fontSize: 12, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>{currentDateLabel()}</Typography>
					<Typography noWrap sx={{ ml: 'auto', maxWidth: 180, fontSize: 12, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>{userName}</Typography>
					<Tooltip title="Sair">
						<IconButton aria-label="Sair da conta" onClick={signOut} size="small">
							<LogoutRounded fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
				<Box sx={{ p: { xs: 2, sm: 3.5, lg: 5 }, maxWidth: 1540, mx: 'auto' }}><Outlet /></Box>
			</Box>
		</Box>
	);
}