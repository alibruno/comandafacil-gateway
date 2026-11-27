import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { HomePage } from './pages/home/home-page';

export const routes: Routes = [
	// A rota inicial é pública; as demais verificam a autenticação antes de abrir.
	{
		path: '',
		pathMatch: 'full',
		component: HomePage,
		title: 'ComandaFácil | Gestão de restaurante',
	},
	{
		path: 'restaurante',
		canActivate: [authGuard],
		// A tela só é carregada quando o usuário acessa esta rota.
		loadComponent: () =>
			import('./pages/restaurant/restaurant-management').then(
				(module) => module.RestaurantManagement,
			),
		title: 'Restaurante | ComandaFácil',
	},
	{
		path: 'pedidos',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./pages/orders/orders-page').then((module) => module.OrdersPage),
		title: 'Pedidos | ComandaFácil',
	},
	{ path: '**', redirectTo: '' },
];
