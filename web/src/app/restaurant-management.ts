import { Component, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Mesa, MesaDraft, ModalMode } from './mesas/mesa.model';
import { MesaDialog } from './mesas/mesa-dialog/mesa-dialog';
import { MesaSummary } from './mesas/mesa-summary/mesa-summary';
import { MesaTable } from './mesas/mesa-table/mesa-table';
import { RestaurantHeader } from './restaurant-header/restaurant-header';

@Component({
  imports: [Button, MesaDialog, MesaSummary, MesaTable, RestaurantHeader],
  selector: 'app-restaurant-management',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class RestaurantManagement {
  protected readonly mesas = signal<Mesa[]>([
    { id: 1, nome: 'Mesa 01', capacidade: 4, dataCadastro: '2026-09-12', disponivel: true },
    { id: 2, nome: 'Mesa 02', capacidade: 2, dataCadastro: '2026-09-09', disponivel: false },
    { id: 3, nome: 'Mesa 03', capacidade: 6, dataCadastro: '2026-08-28', disponivel: true },
    { id: 4, nome: 'Mesa 04', capacidade: 4, dataCadastro: '2026-08-21', disponivel: true },
  ]);

  protected readonly modalVisible = signal(false);
  protected readonly modalMode = signal<ModalMode>('create');
  protected readonly selectedMesa = signal<Mesa | null>(null);

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

    if (this.modalMode() === 'edit' && selected) {
      this.mesas.update((mesas) =>
        mesas.map((mesa) => (mesa.id === selected.id ? { ...mesa, ...draft } : mesa)),
      );
    } else {
      this.mesas.update((mesas) => [
        ...mesas,
        { id: Math.max(0, ...mesas.map((mesa) => mesa.id)) + 1, ...draft },
      ]);
    }

    this.closeModal();
  }

  protected deleteMesa(): void {
    const selected = this.selectedMesa();
    if (!selected) return;

    this.mesas.update((mesas) => mesas.filter((mesa) => mesa.id !== selected.id));
    this.closeModal();
  }

  protected closeModal(): void {
    this.modalVisible.set(false);
    this.selectedMesa.set(null);
  }
}