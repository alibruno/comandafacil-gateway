import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppShell from './AppShell';
import AuthPage from '../features/auth/AuthPage';
import { useAuth } from '../state/AuthContext';
import { WorkspaceProvider } from '../state/WorkspaceContext';

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('../features/orders/OrdersPage'));
const RestaurantPage = lazy(() => import('../features/restaurant/RestaurantPage'));

function RouteLoading() {
	return <div role="status" style={{ padding: 32, color: '#727a73', fontSize: 13 }}>Carregando...</div>;
}

function ProtectedApp() {
	const { token, isChecking } = useAuth();
	if (isChecking) return <RouteLoading />;
	if (!token) return <Navigate to="/acesso" replace />;
	return <WorkspaceProvider><Outlet /></WorkspaceProvider>;
}

export default function App() {
	return (
		<Routes>
			<Route path="acesso" element={<AuthPage />} />
			<Route path="login" element={<AuthPage initialMode="login" />} />
			<Route path="cadastro" element={<AuthPage initialMode="register" />} />
			<Route element={<ProtectedApp />}>
				<Route element={<AppShell />}>
					<Route index element={<Suspense fallback={<RouteLoading />}><DashboardPage /></Suspense>} />
					<Route path="pedidos" element={<Suspense fallback={<RouteLoading />}><OrdersPage /></Suspense>} />
					<Route path="restaurante" element={<Suspense fallback={<RouteLoading />}><RestaurantPage /></Suspense>} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Route>
		</Routes>
	);
}