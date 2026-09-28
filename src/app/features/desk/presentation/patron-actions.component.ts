import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export type PatronAction =
  | { readonly kind: 'contact'; readonly memberId: string; readonly email: string | null; readonly phone: string | null }
  | { readonly kind: 'close' | 'reopen' | 'anonymise'; readonly memberId: string };

// An enrolled patron, by Member ID: new contact details (L0b, both fields replaced), close and reopen (L0c), and
// anonymise a closed patron (L0d), which can't be undone, so it asks twice.
@Component({
  selector: 'app-patron-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="$event.preventDefault()">
      <label>Member ID <input formControlName="memberId" autocomplete="off" placeholder="M000001" /></label>
      <fieldset>
        <legend>Contact details</legend>
        <p class="small muted">Both are replaced: a field left empty is removed. At least one must stay.</p>
        <div class="grid-2">
          <label>Email <input formControlName="email" type="email" autocomplete="off" /></label>
          <label>Phone <input formControlName="phone" type="tel" autocomplete="off" /></label>
        </div>
        <div class="actions"><button type="button" [disabled]="noMember() || busy()" (click)="contact()">Save contact</button></div>
      </fieldset>
      <fieldset>
        <legend>Membership</legend>
        <div class="actions">
          <button type="button" [disabled]="noMember() || busy()" (click)="emit('close')">Close</button>
          <button type="button" [disabled]="noMember() || busy()" (click)="emit('reopen')">Reopen</button>
          @if (!confirming()) {
            <button type="button" class="danger-button" [disabled]="noMember() || busy()" (click)="confirming.set(true)">Anonymise…</button>
          } @else {
            <span class="confirm">
              Erase {{ memberId() }}'s name, email, phone and login for good?
              <button type="button" class="danger-button" [disabled]="busy()" (click)="emit('anonymise'); confirming.set(false)">Anonymise</button>
              <button type="button" (click)="confirming.set(false)">Keep</button>
            </span>
          }
        </div>
      </fieldset>
    </form>
  `,
})
export class PatronActionsComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  // Filled from the patron looked up (L0e).
  readonly lookedUp = input<string | null>(null);
  readonly act = output<PatronAction>();

  protected readonly confirming = signal(false);
  protected readonly form = this.fb.group({ memberId: ['', Validators.required], email: [''], phone: [''] });

  constructor() {
    effect(() => {
      const memberId = this.lookedUp();
      if (memberId) this.form.controls.memberId.setValue(memberId);
    });
  }

  protected memberId(): string {
    return this.form.controls.memberId.value.trim();
  }

  protected noMember(): boolean {
    return this.memberId() === '';
  }

  protected contact(): void {
    const { email, phone } = this.form.getRawValue();
    this.act.emit({ kind: 'contact', memberId: this.memberId(), email: email.trim() || null, phone: phone.trim() || null });
  }

  protected emit(kind: 'close' | 'reopen' | 'anonymise'): void {
    this.act.emit({ kind, memberId: this.memberId() });
  }
}
