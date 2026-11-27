import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from '@openng/optimus-ui/card';

@Component({
  imports: [CardModule, RouterLink],
  selector: 'app-home-access-card',
  styleUrl: './home-access-card.css',
  templateUrl: './home-access-card.html',
})
export class HomeAccessCard {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly route = input.required<string>();
  readonly accent = input<'petrol' | 'amber'>('petrol');
}