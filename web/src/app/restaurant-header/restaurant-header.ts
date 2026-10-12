import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';

type ActiveSection = 'restaurant' | 'orders';

@Component({
  imports: [Button, NgOptimizedImage, RouterLink],
  selector: 'app-restaurant-header',
  styleUrl: './restaurant-header.css',
  templateUrl: './restaurant-header.html',
})
export class RestaurantHeader {
  private readonly router = inject(Router);

  readonly pageTitle = input('Mesas do restaurante');
  readonly activeSection = input<ActiveSection>('restaurant');

  protected logout(): void {
    void this.router.navigateByUrl('/');
  }
}