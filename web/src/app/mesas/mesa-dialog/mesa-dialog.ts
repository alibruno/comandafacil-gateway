import { DatePipe } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { form, FormField, min, required, schema } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { Mesa, MesaDraft, ModalMode } from '../mesa.model';

@Component({
  imports: [Button, DatePipe, Dialog, FormField],
  selector: 'app-mesa-dialog',
  templateUrl: './mesa-dialog.html',
})
export class MesaDialog {
  readonly visible = input.required<boolean>();
  readonly mode = input.required<ModalMode>();
  readonly selectedMesa = input<Mesa | null>(null);
  readonly close = output<void>();
  readonly save = output<MesaDraft>();
  readonly remove = output<void>();

  protected readonly mesaDraft = linkedSignal(() => {
    const mesa = this.selectedMesa();
    return mesa
      ? { ...mesa }
      : {
          nome: '',
          capacidade: 2,
          dataCadastro: new Date().toISOString().slice(0, 10),
          disponivel: true,
        };
  });
  protected readonly mesaForm = form(
    this.mesaDraft,
    schema((path) => {
      required(path.nome);
      min(path.capacidade, 1);
    }),
  );
  protected readonly modalTitle = computed(() => {
    switch (this.mode()) {
      case 'create':
        return 'Nova mesa';
      case 'edit':
        return 'Editar mesa';
      case 'view':
        return 'Detalhes da mesa';
      case 'delete':
        return 'Remover mesa';
    }
  });
  protected readonly isFormMode = computed(
    () => this.mode() === 'create' || this.mode() === 'edit',
  );

  protected saveMesa(): void {
    if (!this.mesaForm().valid()) {
      this.mesaForm().markAsTouched();
      return;
    }

    this.save.emit(this.mesaForm().value());
  }

  protected onVisibleChange(visible: boolean): void {
    if (!visible) this.close.emit();
  }
}