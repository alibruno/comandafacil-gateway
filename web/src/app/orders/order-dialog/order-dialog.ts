import { Component, inject, input, OnChanges, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Order, OrderDialogMode, OrderDraft, OrderItem, OrderStatus } from '../order.model';

type OrderItemForm = FormGroup<{
  id: FormControl<string>;
  name: FormControl<string>;
  detail: FormControl<string>;
  unitPrice: FormControl<number>;
  quantity: FormControl<number>;
  note: FormControl<string>;
}>;

@Component({
  imports: [Button, Dialog, InputText, ReactiveFormsModule],
  selector: 'app-order-dialog',
  styleUrl: './order-dialog.css',
  templateUrl: './order-dialog.html',
})
export class OrderDialog implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = input.required<boolean>();
  readonly mode = input.required<OrderDialogMode>();
  readonly order = input<Order | null>(null);
  readonly close = output<void>();
  readonly save = output<OrderDraft>();
  readonly editRequested = output<Order>();

  protected readonly orderForm = this.formBuilder.nonNullable.group({
    table: ['', Validators.required],
    waiter: ['', Validators.required],
    items: this.formBuilder.nonNullable.array<OrderItemForm>([], Validators.minLength(1)),
    notes: [''],
    status: ['cozinha' as OrderStatus, Validators.required],
  });
  protected readonly newItemForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    detail: [''],
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    note: [''],
  });
  protected readonly statusChoices: { label: string; value: OrderStatus }[] = [
    { label: 'Na cozinha', value: 'cozinha' },
    { label: 'Em preparo', value: 'preparo' },
    { label: 'Pronto p/ servir', value: 'pronto' },
    { label: 'Finalizado', value: 'finalizado' },
  ];
  protected addingItem = false;

  ngOnChanges(): void {
    const order = this.mode() !== 'create' ? this.order() : null;
    this.orderForm.controls.table.reset(order?.table ?? 'Mesa 01');
    this.orderForm.controls.waiter.reset(order?.waiter ?? 'Jean-Pierre');
    this.orderForm.controls.notes.reset(order?.notes ?? '');
    this.orderForm.controls.status.reset(order?.status ?? 'cozinha');
    this.orderForm.controls.items.clear();
    order?.items.forEach((item) => this.orderForm.controls.items.push(this.createItemForm(item)));
    this.orderForm.markAsPristine();
    this.orderForm.markAsUntouched();
    this.newItemForm.reset({ name: '', detail: '', unitPrice: 0, quantity: 1, note: '' });
    this.addingItem = false;
  }

  protected onVisibleChange(visible: boolean): void {
    if (!visible) this.close.emit();
  }

  protected setStatus(status: OrderStatus): void {
    this.orderForm.controls.status.setValue(status);
  }

  protected adjustQuantity(index: number, change: number): void {
    const quantity = this.orderForm.controls.items.at(index).controls.quantity;
    quantity.setValue(Math.max(1, quantity.value + change));
    quantity.markAsDirty();
  }

  protected removeItem(index: number): void {
    this.orderForm.controls.items.removeAt(index);
    this.orderForm.controls.items.markAsTouched();
  }

  protected addItem(): void {
    if (this.newItemForm.invalid) {
      this.newItemForm.markAllAsTouched();
      return;
    }

    const item = this.newItemForm.getRawValue();
    this.orderForm.controls.items.push(
      this.createItemForm({ ...item, id: `item-${Date.now()}` }),
    );
    this.orderForm.controls.items.markAsTouched();
    this.newItemForm.reset({ name: '', detail: '', unitPrice: 0, quantity: 1, note: '' });
    this.addingItem = false;
  }

  protected itemTotal(item: OrderItem): number {
    return item.unitPrice * item.quantity;
  }

  protected itemsSubtotal(): number {
    return this.orderForm.controls.items.getRawValue().reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
  }

  protected formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  protected statusLabel(status: OrderStatus): string {
    return this.statusChoices.find((choice) => choice.value === status)?.label ?? status;
  }

  protected saveOrder(): void {
    if (this.orderForm.invalid || this.orderForm.controls.items.length === 0) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue();
    const { items, ...fields } = formValue;
    this.save.emit({
      ...fields,
      items,
      total: items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    });
  }

  private createItemForm(item: OrderItem): OrderItemForm {
    return this.formBuilder.nonNullable.group({
      id: [item.id],
      name: [item.name, Validators.required],
      detail: [item.detail],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0.01)]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      note: [item.note],
    });
  }
}