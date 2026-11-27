import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class HomePage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly authMode = signal<AuthMode | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params.get('login') === 'true') this.authMode.set('login');
    });
  }

  protected openAuth(mode: AuthMode): void {
    this.authMode.set(mode);
  }

  protected completeAuthentication(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/restaurante';
    void this.router.navigateByUrl(destination);
  }
}