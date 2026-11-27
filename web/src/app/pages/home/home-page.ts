import { Component, signal } from '@angular/core';
import { HomeAccessCard } from './components/home-access-card/home-access-card';
import { HomeAuth } from './components/home-auth/home-auth';
import { HomeHeader } from './components/home-header/home-header';
import { HomeHero } from './components/home-hero/home-hero';
import { AuthMode } from './home-page.types';

@Component({
  imports: [HomeAccessCard, HomeAuth, HomeHeader, HomeHero],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  host: {
    class: 'block min-h-svh font-sans text-[#152e30]',
  },
})
export class HomePage {
  protected readonly authMode = signal<AuthMode | null>(null);

  protected openAuth(mode: AuthMode): void {
    this.authMode.set(mode);
  }
}