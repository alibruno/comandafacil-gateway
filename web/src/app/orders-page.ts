import { Component, computed, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { OrderDialog } from './orders/order-dialog/order-dialog';
import { Order, OrderDialogMode, OrderDraft, OrderFilter, OrderItem, OrderStatus } from './orders/order.model';
import { RestaurantHeader } from './restaurant-header/restaurant-header';

@Component({
  imports: [Button, Dialog, OrderDialog, RestaurantHeader],
  selector: 'app-orders-page',
  styleUrl: './orders-page.css',
  templateUrl: './orders-page.html',
})
export class OrdersPage {
  protected readonly orders = signal<Order[]>([
    {
      id: 'PED-1054',
      table: 'Mesa 02 · Salão',
      waiter: 'Jean-Pierre',
      items: [
        { id: '1054-1', name: 'Boeuf Bourguignon', detail: 'R$ 79,00 un.', unitPrice: 79, quantity: 2, note: 'Ponto da carne ao ponto' },
        { id: '1054-2', name: 'Croque Monsieur', detail: 'R$ 38,80 un.', unitPrice: 38.8, quantity: 1, note: '' },
        { id: '1054-3', name: 'Côtes du Rhône (Taça)', detail: 'R$ 16,00 un.', unitPrice: 16, quantity: 2, note: '' },
      ],
      notes: 'Molho à parte; pão bem crocante.',
      total: 228.8,
      status: 'preparo',
      openedAt: 'há 14 min',
    },
    {
      id: 'PED-1053',
      table: 'Mesa 05 · Varanda',
      waiter: 'Marcella V.',
      items: [
        { id: '1053-1', name: 'Filet Mignon au Poivre', detail: 'R$ 108,00 un.', unitPrice: 108, quantity: 1, note: 'Ponto da carne menos' },
        { id: '1053-2', name: 'Risoto de Cogumelos', detail: 'R$ 56,00 un.', unitPrice: 56, quantity: 1, note: '' },
      ],
      notes: 'Ponto da carne menos.',
      total: 164,
      status: 'cozinha',
      openedAt: 'há 6 min',
    },
    {
      id: 'PED-1052',
      table: 'Mesa 08 · Gazebo',
      waiter: 'Jean-Pierre',
      items: [
        { id: '1052-1', name: 'Salmão Grelhado ao Molho de Ervas', detail: 'R$ 65,00 un.', unitPrice: 65, quantity: 2, note: '' },
        { id: '1052-2', name: 'Sauvignon Blanc', detail: 'R$ 34,00 un.', unitPrice: 34, quantity: 2, note: '' },
      ],
      notes: '',
      total: 198,
      status: 'pronto',
      openedAt: 'há 28 min',
    },
    {
      id: 'PED-1051',
      table: 'Mesa 01 · Salão',
      waiter: 'Thomas B.',
      items: [
        { id: '1051-1', name: 'Confit de Canard', detail: 'R$ 142,00 un.', unitPrice: 142, quantity: 1, note: '' },
        { id: '1051-2', name: 'Gratin Dauphinois', detail: 'R$ 52,00 un.', unitPrice: 52, quantity: 1, note: '' },
        { id: '1051-3', name: 'Pinot Noir', detail: 'R$ 116,00 un.', unitPrice: 116, quantity: 1, note: '' },
      ],
      notes: 'Mesa de celebração.',
      total: 310,
      status: 'preparo',
      openedAt: 'há 21 min',
    },
    {
      id: 'PED-1050',
      table: 'Mesa 11 · Salão',
      waiter: 'Marcella V.',
      items: [
        { id: '1050-1', name: 'Sopa de Cebola Gratinada', detail: 'R$ 32,00 un.', unitPrice: 32, quantity: 2, note: '' },
        { id: '1050-2', name: 'Steak Tartare', detail: 'R$ 70,00 un.', unitPrice: 70, quantity: 1, note: '' },
      ],
      notes: '',
      total: 134,
      status: 'finalizado',
      openedAt: 'às 19:54',
    },
    {
      id: 'PED-1049',
      table: 'Mesa 04 · Centro',
      waiter: 'Jean-Pierre',
      items: [
        { id: '1049-1', name: 'Ratatouille', detail: 'R$ 48,00 un.', unitPrice: 48, quantity: 1, note: '' },
        { id: '1049-2', name: 'Robalo Selado', detail: 'R$ 108,00 un.', unitPrice: 108, quantity: 1, note: '' },
        { id: '1049-3', name: 'Água', detail: 'R$ 8,00 un.', unitPrice: 8, quantity: 2, note: '' },
      ],
      notes: '',
      total: 172,
      status: 'finalizado',
      openedAt: 'às 19:30',
    },
  ]);

  protected readonly filters: { label: string; value: OrderFilter }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Na cozinha', value: 'cozinha' },
    { label: 'Em preparo', value: 'preparo' },
    { label: 'Prontos', value: 'pronto' },
    { label: 'Finalizados', value: 'finalizado' },
  ];
  protected readonly activeFilter = signal<OrderFilter>('all');
  protected readonly dialogVisible = signal(false);
  protected readonly dialogMode = signal<OrderDialogMode>('create');
  protected readonly selectedOrder = signal<Order | null>(null);
  protected readonly deleteTarget = signal<Order | null>(null);
  protected readonly filteredOrders = computed(() => {
    const filter = this.activeFilter();
    return filter === 'all' ? this.orders() : this.orders().filter((order) => order.status === filter);
  });
  protected readonly statusCounts = computed(() => ({
    cozinha: this.orders().filter((order) => order.status === 'cozinha').length,
    preparo: this.orders().filter((order) => order.status === 'preparo').length,
    pronto: this.orders().filter((order) => order.status === 'pronto').length,
    finalizado: this.orders().filter((order) => order.status === 'finalizado').length,
  }));
  protected readonly filterCounts = computed(() => ({
    all: this.orders().length,
    ...this.statusCounts(),
  }));
  protected readonly activeCount = computed(
    () => this.orders().filter((order) => order.status !== 'finalizado').length,
  );

  protected setFilter(filter: OrderFilter): void {
    this.activeFilter.set(filter);
  }

  protected openCreateDialog(): void {
    this.dialogMode.set('create');
    this.selectedOrder.set(null);
    this.dialogVisible.set(true);
  }

  protected openEditDialog(order: Order): void {
    this.dialogMode.set('edit');
    this.selectedOrder.set(order);
    this.dialogVisible.set(true);
  }

  protected openViewDialog(order: Order): void {
    this.dialogMode.set('view');
    this.selectedOrder.set(order);
    this.dialogVisible.set(true);
  }

  protected editFromView(order: Order): void {
    this.openEditDialog(order);
  }

  protected openDeleteConfirmation(order: Order): void {
    this.deleteTarget.set(order);
  }

  protected closeDeleteConfirmation(visible: boolean): void {
    if (!visible) this.deleteTarget.set(null);
  }

  protected confirmDeleteOrder(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.orders.update((orders) => orders.filter((order) => order.id !== target.id));
    this.deleteTarget.set(null);
  }

  protected saveOrder(draft: OrderDraft): void {
    const selected = this.selectedOrder();

    if (this.dialogMode() === 'edit' && selected) {
      this.orders.update((orders) =>
        orders.map((order) => (order.id === selected.id ? { ...order, ...draft } : order)),
      );
    } else {
      const latestId = Math.max(1048, ...this.orders().map((order) => Number(order.id.slice(4))));
      this.orders.update((orders) => [
        {
          ...draft,
          id: `PED-${latestId + 1}`,
          openedAt: 'agora',
        },
        ...orders,
      ]);
      this.activeFilter.set('all');
    }

    this.closeDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.selectedOrder.set(null);
  }

  protected statusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      cozinha: 'Na cozinha',
      preparo: 'Em preparo',
      pronto: 'Pronto para servir',
      finalizado: 'Finalizado',
    };
    return labels[status];
  }

  protected statusClass(status: OrderStatus): string {
    return `status--${status}`;
  }

  protected formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  protected itemsSummary(items: OrderItem[]): string {
    return items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
  }
}