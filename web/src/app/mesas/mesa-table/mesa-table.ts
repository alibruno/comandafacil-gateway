import { DatePipe } from '@angular/common';
import { computed, Component, input, output, signal } from '@angular/core';
import { Mesa } from '../mesa.model';

@Component({
  imports: [DatePipe],
  selector: 'app-mesa-table',
  templateUrl: './mesa-table.html',
})
export class MesaTable {
  readonly mesas = input.required<Mesa[]>();
  readonly view = output<Mesa>();
  readonly edit = output<Mesa>();
  readonly remove = output<Mesa>();

  protected readonly searchTerm = signal('');
  protected readonly filteredMesas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return term
      ? this.mesas().filter((mesa) => mesa.nome.toLowerCase().includes(term))
      : this.mesas();
  });

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}