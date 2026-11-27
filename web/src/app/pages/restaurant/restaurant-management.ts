import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { RestaurantHeader } from '../../shared/components/restaurant-header/restaurant-header';
import { RestaurantDataService } from '../../core/restaurant-data.service';
import { MesaDialog } from './components/mesa-dialog/mesa-dialog';
import { MesaSummary } from './components/mesa-summary/mesa-summary';
import { MesaTable } from './components/mesa-table/mesa-table';
import { Mesa, MesaDraft, ModalMode } from './mesa.model';

@Component({
  imports: [Button, MesaDialog, MesaSummary, MesaTable, RestaurantHeader],
  selector: 'app-restaurant-management',
  templateUrl: './restaurant-management.html',
})
export class RestaurantManagement implements OnInit {
  protected readonly data = inject(RestaurantDataService);
  protected readonly mesas = this.data.mesas;

  protected readonly modalVisible = signal(false);
  protected readonly modalMode = signal<ModalMode>('create');
  protected readonly selectedMesa = signal<Mesa | null>(null);

  ngOnInit(): void {
    this.data.loadMesas().subscribe({
      error: (error: unknown) => console.error('Falha ao carregar mesas:', error),
    });
  }

  protected openCreateModal(): void {
    this.modalMode.set('create');
    this.selectedMesa.set(null);
    this.modalVisible.set(true);
  }

  protected openViewModal(mesa: Mesa): void {
    this.modalMode.set('view');
    this.selectedMesa.set(mesa);
    this.modalVisible.set(true);
  }

  protected openEditModal(mesa: Mesa): void {
    this.modalMode.set('edit');
    this.selectedMesa.set(mesa);
    this.modalVisible.set(true);
  }

  protected openDeleteModal(mesa: Mesa): void {
    this.modalMode.set('delete');
    this.selectedMesa.set(mesa);
    this.modalVisible.set(true);
  }

  protected saveMesa(draft: MesaDraft): void {
    const selected = this.selectedMesa();
    const request = this.modalMode() === 'edit' && selected
      ? this.data.updateMesa(selected.id, draft)
      : this.data.createMesa(draft);

    request.subscribe({
      next: () => this.closeModal(),
      error: (error: unknown) => console.error('Falha ao salvar mesa:', error),
    });
  }

  protected deleteMesa(): void {
    const selected = this.selectedMesa();
    if (!selected) return;

    this.data.deleteMesa(selected.id).subscribe({
      next: () => this.closeModal(),
      error: (error: unknown) => console.error('Falha ao remover mesa:', error),
    });
  }

  protected closeModal(): void {
    this.modalVisible.set(false);
    this.selectedMesa.set(null);
  }
}