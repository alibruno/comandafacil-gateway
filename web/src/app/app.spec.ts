import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { HomePage } from './home-page';
import { HomeHero } from './home-hero/home-hero';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HomeHero, HomePage],
      providers: [...appConfig.providers],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the homepage welcome title', async () => {
    const fixture = TestBed.createComponent(HomeHero);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Bem-vindo ao ComandaFácil');
  });

  it('opens the matching dialog from each home header action', async () => {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.home-login-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#login-title')?.textContent).toContain('Acesse o sistema');
    expect(compiled.querySelector('#register-title')).toBeNull();

    compiled.querySelector<HTMLButtonElement>('.dialog-close')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.home-register-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#register-title')?.textContent).toContain('Criar conta');
    expect(compiled.querySelector('#login-title')).toBeNull();
  });
});
