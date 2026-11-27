import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { RestaurantHeader } from '../../shared/components/restaurant-header/restaurant-header';
import { RestaurantDataService } from '../../core/restaurant-data.service';
import { OrderDialog } from './components/order-dialog/order-dialog';
import { Order, OrderDialogMode, OrderDraft, OrderFilter, OrderItem, OrderStatus } from './order.model';

@Component({
  imports: [Button, Dialog, OrderDialog, RestaurantHeader],
  selector: 'app-orders-page',
  templateUrl: './orders-page.html',
  host: {
    class: 'block min-h-screen font-sans',
  },
})
export class OrdersPage implements OnInit {
  protected readonly data = inject(RestaurantDataService);
  protected readonly orders = this.data.orders;
  protected readonly mesas = this.data.mesas;

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

  ngOnInit(): void {
    this.data.loadMesas().subscribe({
      error: (error: unknown) => console.error('Falha ao carregar mesas:', error),
    });
    this.data.loadOrders().subscribe({
      error: (error: unknown) => console.error('Falha ao carregar pedidos:', error),
    });
  }

  protected setFilter(filter: OrderFilter): void {
    this.activeFilter.set(filter);
  }

  protected openCreateDialog(): void {
    if (this.data.loadingMesas() || this.mesas().length === 0) return;
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

    this.data.deleteOrder(target.id).subscribe({
      next: () => this.deleteTarget.set(null),
      error: (error: unknown) => console.error('Falha ao remover pedido:', error),
    });
  }

  protected saveOrder(draft: OrderDraft): void {
    const selected = this.selectedOrder();
    const isEditing = this.dialogMode() === 'edit' && selected !== null;
    const request = this.dialogMode() === 'edit' && selected
      ? this.data.updateOrder(selected.id, draft)
      : this.data.createOrder(draft);

    request.subscribe({
      next: () => {
        if (!isEditing) this.activeFilter.set('all');
        this.closeDialog();
      },
      error: (error: unknown) => console.error('Falha ao salvar pedido:', error),
    });
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
    const classes: Record<OrderStatus, string> = {
      cozinha: 'bg-[#e5ebeb] text-[#152e30]',
      preparo: 'bg-[#f99a26]/18 text-[#8b5000]',
      pronto: 'bg-[#e8f2e5] text-[#38623b]',
      finalizado: 'bg-[#f4f6f8] text-[#77818c]',
    };
    return classes[status];
  }

  protected formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  protected itemsSummary(items: OrderItem[]): string {
    return items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
  }
}
