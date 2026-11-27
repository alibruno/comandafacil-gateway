import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home-page';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: HomePage,
		title: 'ComandaFácil | Gestão de restaurante',
	},
	{
		path: 'restaurante',
		loadComponent: () =>
			import('./pages/restaurant/restaurant-management').then(
				(module) => module.RestaurantManagement,
			),
		title: 'Restaurante | ComandaFácil',
	},
	{
		path: 'pedidos',
		loadComponent: () =>
			import('./pages/orders/orders-page').then((module) => module.OrdersPage),
		title: 'Pedidos | ComandaFácil',
	},
	{ path: '**', redirectTo: '' },
];
