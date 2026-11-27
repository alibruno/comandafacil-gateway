import { DatePipe } from '@angular/common';
import { computed, Component, input, output, signal } from '@angular/core';
import { Mesa } from '../../mesa.model';

@Component({
  imports: [DatePipe],
  selector: 'app-mesa-table',
  templateUrl: './mesa-table.html',
})
export class MesaTable {
  // Dados que chegam do pai e eventos que a tabela devolve para ele.
  readonly mesas = input.required<Mesa[]>();
  readonly view = output<Mesa>();
  readonly edit = output<Mesa>();
  readonly remove = output<Mesa>();

  // O filtro é estado local; computed recalcula a lista quando busca ou mesas mudam.
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