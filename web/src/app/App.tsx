import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './AppShell';

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('../features/orders/OrdersPage'));
const RestaurantPage = lazy(() => import('../features/restaurant/RestaurantPage'));

function RouteLoading() {
	return <div role="status" style={{ padding: 32, color: '#727a73', fontSize: 13 }}>Carregando...</div>;
}

export default function App() {
	return (
		<Routes>
			<Route element={<AppShell />}>
				<Route index element={<Suspense fallback={<RouteLoading />}><DashboardPage /></Suspense>} />
				<Route path="pedidos" element={<Suspense fallback={<RouteLoading />}><OrdersPage /></Suspense>} />
				<Route path="restaurante" element={<Suspense fallback={<RouteLoading />}><RestaurantPage /></Suspense>} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}