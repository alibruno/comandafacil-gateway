import { Component, signal } from '@angular/core';
import { HomeAccessCard } from './home-access-card/home-access-card';
import { HomeAuth } from './home-auth/home-auth';
import { HomeHeader } from './home-header/home-header';
import { HomeHero } from './home-hero/home-hero';
import { AuthMode } from './home-page.types';

@Component({
  imports: [HomeAccessCard, HomeAuth, HomeHeader, HomeHero],
  selector: 'app-home-page',
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly authMode = signal<AuthMode | null>(null);

  protected openAuth(mode: AuthMode): void {
    this.authMode.set(mode);
  }
}