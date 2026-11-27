import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { API_URL } from './api-url';
import { apiErrorMessage } from './api-error';
import { Mesa, MesaDraft } from '../pages/restaurant/mesa.model';
import { Order, OrderDraft } from '../pages/orders/order.model';

@Injectable({ providedIn: 'root' })
export class RestaurantDataService {
  private readonly http = inject(HttpClient);

  // Signals mantêm os dados e os estados de carregamento/erro compartilhados entre telas.
  readonly mesas = signal<Mesa[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly loadingMesas = signal(false);
  readonly loadingOrders = signal(false);
  readonly mesaError = signal<string | null>(null);
  readonly orderError = signal<string | null>(null);

  // Cada método chama a API e atualiza o signal local quando a resposta chega.
  loadMesas(): Observable<Mesa[]> {
    return this.track(
      this.http.get<Mesa[]>(`${API_URL}/mesas`),
      this.loadingMesas,
      this.mesaError,
    ).pipe(tap((mesas) => this.mesas.set(mesas)));
  }

  createMesa(draft: MesaDraft): Observable<Mesa> {
    return this.track(
      this.http.post<Mesa>(`${API_URL}/mesas`, draft),
      this.loadingMesas,
      this.mesaError,
    ).pipe(tap((mesa) => this.mesas.update((mesas) => [...mesas, mesa])));
  }

  updateMesa(id: number, draft: MesaDraft): Observable<Mesa> {
    return this.track(
      this.http.put<Mesa>(`${API_URL}/mesas/${id}`, draft),
      this.loadingMesas,
      this.mesaError,
    ).pipe(
      tap((updated) => this.mesas.update((mesas) =>
        mesas.map((mesa) => mesa.id === updated.id ? updated : mesa),
      )),
    );
  }

  deleteMesa(id: number): Observable<void> {
    return this.track(
      this.http.delete<void>(`${API_URL}/mesas/${id}`),
      this.loadingMesas,
      this.mesaError,
    ).pipe(tap(() => this.mesas.update((mesas) => mesas.filter((mesa) => mesa.id !== id))));
  }

  loadOrders(): Observable<Order[]> {
    return this.track(
      this.http.get<Order[]>(`${API_URL}/pedidos`),
      this.loadingOrders,
      this.orderError,
    ).pipe(tap((orders) => this.orders.set(orders)));
  }

  createOrder(draft: OrderDraft): Observable<Order> {
    return this.track(
      this.http.post<Order>(`${API_URL}/pedidos`, this.orderRequest(draft)),
      this.loadingOrders,
      this.orderError,
    ).pipe(tap((order) => this.orders.update((orders) => [order, ...orders])));
  }

  updateOrder(id: string, draft: OrderDraft): Observable<Order> {
    return this.track(
      this.http.put<Order>(`${API_URL}/pedidos/${id}`, this.orderRequest(draft)),
      this.loadingOrders,
      this.orderError,
    ).pipe(
      tap((updated) => this.orders.update((orders) =>
        orders.map((order) => order.id === updated.id ? updated : order),
      )),
    );
  }

  deleteOrder(id: string): Observable<void> {
    return this.track(
      this.http.delete<void>(`${API_URL}/pedidos/${id}`),
      this.loadingOrders,
      this.orderError,
    ).pipe(tap(() => this.orders.update((orders) => orders.filter((order) => order.id !== id))));
  }

  private orderRequest(draft: OrderDraft) {
    return {
      table: draft.table,
      waiter: draft.waiter,
      items: draft.items.map((item) => ({
        name: item.name,
        detail: item.detail,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        note: item.note,
      })),
      notes: draft.notes,
      status: draft.status,
    };
  }

  private track<T>(
    request: Observable<T>,
    loading: WritableSignal<boolean>,
    errorMessage: WritableSignal<string | null>,
  ): Observable<T> {
    loading.set(true);
    errorMessage.set(null);

    return request.pipe(
      catchError((error: unknown) => {
        errorMessage.set(apiErrorMessage(error));
        return throwError(() => error);
      }),
      finalize(() => loading.set(false)),
    );
  }
}
