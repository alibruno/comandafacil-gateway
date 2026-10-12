import { computed, Component, input } from '@angular/core';
import { Mesa } from '../mesa.model';

@Component({
  selector: 'app-mesa-summary',
  templateUrl: './mesa-summary.html',
})
export class MesaSummary {
  readonly mesas = input.required<Mesa[]>();
  protected readonly availableCount = computed(
    () => this.mesas().filter((mesa) => mesa.disponivel).length,
  );
  protected readonly occupiedCount = computed(() => this.mesas().length - this.availableCount());
}