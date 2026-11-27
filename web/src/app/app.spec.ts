import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';
import { API_URL } from './core/api-url';
import { AuthService } from './core/auth.service';
import { RestaurantDataService } from './core/restaurant-data.service';
import { HomeAuth } from './pages/home/components/home-auth/home-auth';
import { HomeHero } from './pages/home/components/home-hero/home-hero';
import { HomePage } from './pages/home/home-page';
import { Mesa, MesaDraft } from './pages/restaurant/mesa.model';
import { Order } from './pages/orders/order.model';
import { OrdersPage } from './pages/orders/orders-page';
import { RestaurantHeader } from './shared/components/restaurant-header/restaurant-header';

const existingOrder: Order = {
  id: 'PED-1054',
  table: 'Mesa 02 · Salão',
  waiter: 'Jean-Pierre',
  items: [
    { id: '1054-1', name: 'Boeuf Bourguignon', detail: 'R$ 79,00 un.', unitPrice: 79, quantity: 2, note: '' },
  ],
  notes: '',
  total: 158,
  status: 'preparo',
  openedAt: '2026-11-27T01:00:00-03:00',
};

const existingMesa: Mesa = {
  id: 2,
  nome: existingOrder.table,
  capacidade: 4,
  dataCadastro: '2026-11-27',
  disponivel: true,
};

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App, HomeHero, HomePage, HomeAuth, OrdersPage, RestaurantHeader],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the home page and opens its login dialog', async () => {
    const fixture = TestBed.createComponent(HomeHero);
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent)
      .toContain('Bem-vindo ao ComandaFácil');

    const home = TestBed.createComponent(HomePage);
    home.detectChanges();
    const compiled = home.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.home-login-button')?.click();
    home.detectChanges();
    expect(compiled.querySelector('#login-title')?.textContent).toContain('Acesse o sistema');
  });

  it('authenticates with the backend after a valid login form', async () => {
    const fixture = TestBed.createComponent(HomeAuth);
    fixture.componentInstance.mode.set('login');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const email = compiled.querySelector<HTMLInputElement>('#login-email');
    const password = compiled.querySelector<HTMLInputElement>('#login-password');
    if (!email || !password) throw new Error('Login form did not open');
    email.value = 'manager@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'password123';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('form button[type="submit"]')?.click();

    const request = TestBed.inject(HttpTestingController).expectOne(`${API_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({ token: 'test-token', email: 'manager@example.com', name: 'Manager' });
    await fixture.whenStable();

    expect(TestBed.inject(AuthService).authenticated()).toBe(true);
    expect(TestBed.inject(AuthService).currentUser()?.name).toBe('Manager');
  });

  it('registers a user through the backend', () => {
    const auth = TestBed.inject(AuthService);
    auth.register({
      name: 'Manager',
      email: 'manager@example.com',
      password: 'password123',
    }).subscribe();

    const request = TestBed.inject(HttpTestingController).expectOne(`${API_URL}/auth/register`);
    expect(request.request.body).toEqual({
      name: 'Manager',
      email: 'manager@example.com',
      password: 'password123',
    });
    request.flush({ token: 'registered-token', email: 'manager@example.com', name: 'Manager' });

    expect(auth.authenticated()).toBe(true);
  });

  it('redirects unauthenticated visits to protected routes to the login page', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/pedidos');
    expect(router.url).toContain('login=true');
    expect(router.url).toContain('returnUrl');
  });

  it('clears the session when logging out', async () => {
    localStorage.setItem('comandafacil-token', 'test-token');
    localStorage.setItem('comandafacil-email', 'manager@example.com');
    localStorage.setItem('comandafacil-name', 'Manager');
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/pedidos');

    const fixture = TestBed.createComponent(RestaurantHeader);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.header-logout-button')?.click();
    await fixture.whenStable();

    expect(auth.authenticated()).toBe(false);
    expect(router.url).toBe('/');
  });

  it('loads and mutates mesa state through the API service', () => {
    localStorage.setItem('comandafacil-token', 'mesa-token');
    localStorage.setItem('comandafacil-email', 'manager@example.com');
    localStorage.setItem('comandafacil-name', 'Manager');
    const data = TestBed.inject(RestaurantDataService);
    const http = TestBed.inject(HttpTestingController);
    const mesa: Mesa = {
      id: 1,
      nome: 'Mesa 01',
      capacidade: 4,
      dataCadastro: '2026-11-27',
      disponivel: true,
    };
    const draft: MesaDraft = {
      nome: 'Mesa 02',
      capacidade: 6,
      dataCadastro: '2026-11-27',
      disponivel: false,
    };

    data.loadMesas().subscribe();
    const loading = http.expectOne({ method: 'GET', url: `${API_URL}/mesas` });
    expect(loading.request.headers.get('Authorization')).toBe('Bearer mesa-token');
    loading.flush([mesa]);
    expect(data.mesas()).toEqual([mesa]);

    data.createMesa(draft).subscribe();
    http.expectOne({ method: 'POST', url: `${API_URL}/mesas` }).flush({ ...draft, id: 2 });
    expect(data.mesas().map((item) => item.id)).toEqual([1, 2]);

    data.updateMesa(2, { ...draft, nome: 'Mesa atualizada' }).subscribe();
    http.expectOne({ method: 'PUT', url: `${API_URL}/mesas/2` })
      .flush({ ...draft, id: 2, nome: 'Mesa atualizada' });
    expect(data.mesas()[1].nome).toBe('Mesa atualizada');

    data.deleteMesa(1).subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/mesas/1` }).flush(null);
    expect(data.mesas().map((item) => item.id)).toEqual([2]);
  });

  it('creates an order through the API and refreshes the signal state', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(`${API_URL}/pedidos`).flush([]);
    TestBed.inject(HttpTestingController).expectOne(`${API_URL}/mesas`).flush([{
      id: 1,
      nome: 'Mesa 01',
      capacidade: 4,
      dataCadastro: '2026-11-27',
      disponivel: true,
    }]);
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

    const request = TestBed.inject(HttpTestingController).expectOne(`${API_URL}/pedidos`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.table).toBe('Mesa 01');
    expect(request.request.body.total).toBeUndefined();
    request.flush({
      id: 'PED-0001',
      table: 'Mesa 01',
      waiter: 'Jean-Pierre',
      items: [{ id: 'item-server', name: 'Croque Monsieur', detail: '', unitPrice: 96, quantity: 1, note: '' }],
      notes: '',
      total: 96,
      status: 'cozinha',
      openedAt: '2026-11-27T01:00:00-03:00',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.order-card')?.textContent).toContain('PED-0001');
    expect(compiled.querySelector('.order-card')?.textContent).toContain('1x Croque Monsieur');
    expect(compiled.querySelector('.order-card')?.textContent).toContain('R$ 96,00');
  });

  it('updates, details and deletes an order through the API', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(`${API_URL}/pedidos`).flush([existingOrder]);
    TestBed.inject(HttpTestingController).expectOne(`${API_URL}/mesas`).flush([existingMesa]);
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

    const update = TestBed.inject(HttpTestingController).expectOne(`${API_URL}/pedidos/${existingOrder.id}`);
    expect(update.request.method).toBe('PUT');
    update.flush({ ...existingOrder, items: [{ ...existingOrder.items[0], quantity: 3 }], total: 237 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.querySelector('.order-card')?.textContent).toContain('3x Boeuf Bourguignon');

    compiled.querySelector<HTMLButtonElement>('.view-order-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#order-dialog-title')?.textContent).toContain(existingOrder.id);
    expect(compiled.querySelector('.view-item-list')?.textContent).toContain('Boeuf Bourguignon');
    compiled.querySelector<HTMLButtonElement>('.dialog-close')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.delete-order-button')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.confirm-delete-order')?.click();

    const deletion = TestBed.inject(HttpTestingController).expectOne(`${API_URL}/pedidos/${existingOrder.id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.querySelector('.order-card')).toBeNull();
  });

  it('disables order creation when no restaurant tables exist', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_URL}/pedidos`).flush([]);
    http.expectOne(`${API_URL}/mesas`).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const newOrderButton = compiled.querySelector<HTMLButtonElement>('.new-order-button');
    expect(newOrderButton?.disabled).toBe(true);
    expect(compiled.textContent).toContain('Cadastre uma mesa na aba Restaurante');
    newOrderButton?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('#order-dialog-title')).toBeNull();
    http.expectNone({ method: 'POST', url: `${API_URL}/pedidos` });
  });
});
