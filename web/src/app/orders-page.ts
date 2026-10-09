import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-orders-page',
  template: `
    <main class="orders-placeholder">
      <a routerLink="/" class="back-link">← Voltar ao início</a>
      <p class="eyebrow">Cozinha &amp; atendimento</p>
      <h1>Pedidos, no tempo certo.</h1>
      <p>A área de gerenciamento de pedidos estará disponível em breve.</p>
      <a routerLink="/restaurante" class="restaurant-link">Ir para gerenciamento do restaurante</a>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #f8f7f3; color: #152e30; font-family: 'Plus Jakarta Sans', sans-serif; }
    .orders-placeholder { display: flex; min-height: 100vh; width: min(720px, calc(100% - 2.5rem)); flex-direction: column; justify-content: center; margin: auto; }
    .back-link, .restaurant-link { width: fit-content; color: #152e30; font-size: .85rem; font-weight: 700; text-decoration: none; }
    .back-link { margin-bottom: 4rem; }
    .eyebrow { color: #a13711; font-size: .68rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
    h1 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.6rem, 7vw, 4.5rem); font-weight: 600; line-height: 1.1; }
    main > p:not(.eyebrow) { color: #697679; font-size: .95rem; line-height: 1.7; }
    .restaurant-link { margin-top: 1rem; background: #e88a24; padding: .9rem 1rem; }
    :focus-visible { outline: 2px solid #a13711; outline-offset: 3px; }
  `,
})
export class OrdersPage {}