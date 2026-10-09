import { Routes } from '@angular/router';
import { HomePage } from './home-page';

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
			import('./restaurant-management').then((module) => module.RestaurantManagement),
		title: 'Restaurante | ComandaFácil',
	},
	{
		path: 'pedidos',
		loadComponent: () => import('./orders-page').then((module) => module.OrdersPage),
		title: 'Pedidos | ComandaFácil',
	},
	{ path: '**', redirectTo: '' },
];
