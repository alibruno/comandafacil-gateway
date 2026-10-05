import { Component, signal } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { form, FormField, min, required, schema } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';

@Component({
  imports: [Button, DatePipe, Dialog, FormField, NgOptimizedImage],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly mesas = signal<Mesa[]>([
    { id: 1, nome: 'Mesa 01', capacidade: 4, dataCadastro: '2026-09-12', disponivel: true },
    { id: 2, nome: 'Mesa 02', capacidade: 2, dataCadastro: '2026-09-09', disponivel: false },
    { id: 3, nome: 'Mesa 03', capacidade: 6, dataCadastro: '2026-08-28', disponivel: true },
    { id: 4, nome: 'Mesa 04', capacidade: 4, dataCadastro: '2026-08-21', disponivel: true },
  ]);

  protected readonly searchTerm = signal('');
  protected readonly modalVisible = signal(false);
  protected readonly modalMode = signal<ModalMode>('create');
  protected readonly selectedMesa = signal<Mesa | null>(null);
  protected readonly mesaDraft = signal<MesaDraft>(this.emptyDraft());
  protected readonly mesaForm = form(
    this.mesaDraft,
    schema((path) => {
      required(path.nome);
      min(path.capacidade, 1);
    }),
  );

  protected readonly filteredMesas = () => {
    const term = this.searchTerm().trim().toLowerCase();
    return term
      ? this.mesas().filter((mesa) => mesa.nome.toLowerCase().includes(term))
      : this.mesas();
  };

  protected readonly availableCount = () => this.mesas().filter((mesa) => mesa.disponivel).length;

  protected readonly occupiedCount = () => this.mesas().length - this.availableCount();

  protected readonly modalTitle = () => {
    switch (this.modalMode()) {
      case 'create':
        return 'Nova mesa';
      case 'edit':
        return 'Editar mesa';
      case 'view':
        return 'Detalhes da mesa';
      case 'delete':
        return 'Remover mesa';
    }
  };

  protected readonly isFormMode = () =>
    this.modalMode() === 'create' || this.modalMode() === 'edit';

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected openCreateModal(): void {
    this.modalMode.set('create');
    this.selectedMesa.set(null);
    this.mesaDraft.set(this.emptyDraft());
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
    this.mesaDraft.set({ ...mesa });
    this.modalVisible.set(true);
  }

  protected openDeleteModal(mesa: Mesa): void {
    this.modalMode.set('delete');
    this.selectedMesa.set(mesa);
    this.modalVisible.set(true);
  }

  protected saveMesa(): void {
    if (!this.mesaForm().valid()) {
      this.mesaForm().markAsTouched();
      return;
    }

    const draft = this.mesaForm().value();
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

  private emptyDraft(): MesaDraft {
    return {
      nome: '',
      capacidade: 2,
      dataCadastro: new Date().toISOString().slice(0, 10),
      disponivel: true,
    };
  }
}

type ModalMode = 'create' | 'view' | 'edit' | 'delete';

interface Mesa {
  id: number;
  nome: string;
  capacidade: number;
  dataCadastro: string;
  disponivel: boolean;
}

interface MesaDraft {
  nome: string;
  capacidade: number;
  dataCadastro: string;
  disponivel: boolean;
}
