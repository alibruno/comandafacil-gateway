import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { AuthService } from '../../../core/auth.service';

type ActiveSection = 'restaurant' | 'orders';

@Component({
  imports: [Button, NgOptimizedImage, RouterLink],
  selector: 'app-restaurant-header',
  templateUrl: './restaurant-header.html',
})
export class RestaurantHeader {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly pageTitle = input('Mesas do restaurante');
  readonly activeSection = input<ActiveSection>('restaurant');
  protected readonly userName = computed(() => this.auth.currentUser()?.name ?? 'Equipe');
  protected readonly userInitials = computed(() =>
    this.userName().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
  );

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}