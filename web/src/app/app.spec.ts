import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { HomePage } from './home-page';
import { HomeHero } from './home-hero/home-hero';
import { HomeAuth } from './home-auth/home-auth';
import { Router } from '@angular/router';
import { OrdersPage } from './orders-page';
import { RestaurantHeader } from './restaurant-header/restaurant-header';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HomeHero, HomePage, HomeAuth, OrdersPage],
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

  it('returns to the public home when the user logs out', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/pedidos');

    const fixture = TestBed.createComponent(RestaurantHeader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.header-logout-button')?.click();
    await fixture.whenStable();

    expect(router.url).toBe('/');
  });

  it.each([
    { mode: 'login' as const, fields: { '#login-email': 'manager@example.com', '#login-password': 'password123' } },
    { mode: 'register' as const, fields: { '#register-name': 'Manager', '#register-email': 'manager@example.com', '#register-password': 'password123', '#register-confirm-password': 'password123' } },
  ])('redirects to restaurant management after valid $mode', async ({ mode, fields }) => {
    const fixture = TestBed.createComponent(HomeAuth);
    const router = TestBed.inject(Router);
    fixture.componentInstance.mode.set(mode);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    for (const [selector, value] of Object.entries(fields)) {
      const input = compiled.querySelector<HTMLInputElement>(selector);
      if (!input) throw new Error(`Missing input: ${selector}`);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('form button[type="submit"]')?.click();
    await fixture.whenStable();

    expect(router.url).toBe('/restaurante');
  });

  it('creates an order from the new order dialog', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.new-order-button')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.add-item-button')?.click();
    fixture.detectChanges();

    const name = compiled.querySelector<HTMLInputElement>('#new-item-name');
    const price = compiled.querySelector<HTMLInputElement>('#new-item-price');
    if (!name || !price) throw new Error('Order form did not open');
    name.value = 'Croque Monsieur';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    price.value = '96';
    price.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.add-item-confirm')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('form button[type="submit"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.order-card')?.textContent).toContain('PED-1055');
    expect(compiled.querySelector('.order-card')?.textContent).toContain('1x Croque Monsieur');
    expect(compiled.querySelector('.order-card')?.textContent).toContain('R$ 96,00');
  });

  it('updates an existing order from the edit dialog', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.edit-order-button')?.click();
    fixture.detectChanges();

    const increaseFirstItem = compiled.querySelectorAll<HTMLButtonElement>('.quantity-change');
    if (!increaseFirstItem[1]) throw new Error('Edit form did not open');
    increaseFirstItem[1].click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('form button[type="submit"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.order-card')?.textContent).toContain('3x Boeuf Bourguignon');
    expect(compiled.querySelector('.order-card')?.textContent).toContain('R$ 307,80');
  });

  it('views and deletes an order', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.view-order-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#order-dialog-title')?.textContent).toContain('PED-1054');
    expect(compiled.querySelector('.view-item-list')?.textContent).toContain('Boeuf Bourguignon');

    compiled.querySelector<HTMLButtonElement>('.save-order-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#order-dialog-title')?.textContent).toContain('Editar pedido');

    compiled.querySelector<HTMLButtonElement>('.dialog-close')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.delete-order-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#delete-order-title')?.textContent).toContain('PED-1054');
    compiled.querySelector<HTMLButtonElement>('.confirm-delete-order')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.order-card')?.textContent).not.toContain('PED-1054');
  });
});
