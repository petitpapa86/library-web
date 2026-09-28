import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountFine, AccountTitle, PatronDeskView } from '../../../core/models';

const fineKinds: Record<AccountFine['kind'], string> = { OVERDUE: 'Late return', REPLACEMENT: 'Lost copy' };
const fineStatuses: Record<AccountFine['status'], string> = {
  ACCRUING: 'still growing', CLOSED: 'to pay', WAIVED: 'waived', CLEARED: 'paid',
};

// L0e — a patron at the desk: who they are, what they have out, what they owe and paid. Each fine can be waived or
// lowered (L4a, L4b) and each payment reversed (L4d, reason required) from here, without typing an id.
@Component({
  selector: 'app-patron-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    @let v = view();
    @let p = v.patron;
    @let a = v.account;
    <div class="panel stack">
      <div class="title-row">
        <div>
          <h3>{{ p.name ?? 'Anonymised patron' }} <span class="mono small muted">{{ p.memberId }}</span></h3>
          <p class="small">
            @if (p.anonymisedAt) {
              <span class="tag tag-danger">anonymised {{ p.anonymisedAt | date: 'mediumDate' }}</span>
            } @else if (p.closed) {
              <span class="tag tag-danger">closed {{ p.closedAt | date: 'mediumDate' }}</span>
            } @else {
              <span class="tag tag-ok">open</span>
            }
            · enrolled {{ p.enrolledAt | date: 'mediumDate' }}
            · {{ p.loginLinked ? 'self-service login linked' : 'no self-service login yet' }}
          </p>
          @if (!p.anonymisedAt) {
            <p class="small muted">{{ p.email ?? 'no email' }} · {{ p.phone ?? 'no phone' }}</p>
          }
        </div>
        <p class="stat-value" [class.danger]="a.balance > 0">{{ a.balance | currency: a.currency }}</p>
      </div>

      <h4>Loans</h4>
      @if (a.loans.length) {
        <table>
          <thead><tr><th>Title</th><th>Copy</th><th>Due</th></tr></thead>
          <tbody>
            @for (l of a.loans; track l.loanId) {
              <tr [class.overdue]="l.overdueSince">
                <td>{{ name(l.title) }}</td>
                <td class="mono small">{{ l.barcode }}</td>
                <td>
                  {{ l.dueDate | date: 'mediumDate' }}
                  @if (l.overdueSince) { <span class="tag tag-danger">overdue</span> }
                  @if (l.renewed) { <span class="tag">renewed</span> }
                </td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="empty">Nothing on loan.</p>
      }

      <h4>Holds</h4>
      @if (a.holds.length) {
        <table>
          <thead><tr><th>Title</th><th>Status</th></tr></thead>
          <tbody>
            @for (h of a.holds; track h.holdId) {
              <tr>
                <td>{{ name(h.title) }}</td>
                <td>
                  @if (h.status === 'READY') {
                    <span class="tag tag-ok">ready</span> collect by {{ h.pickupDeadline | date: 'mediumDate' }}
                  } @else {
                    waiting, #{{ h.position }} in the queue
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="empty">No holds.</p>
      }

      <h4>Fines</h4>
      @if (a.fines.length) {
        <table>
          <thead><tr><th>Fine</th><th>Status</th><th class="right">Accrued</th><th class="right">Owed</th><th></th></tr></thead>
          <tbody>
            @for (f of a.fines; track f.fineId) {
              <tr>
                <td>
                  {{ kind(f) }} · {{ fineTitle(f.fineId) }}<br />
                  <span class="mono small muted">{{ f.fineId }}</span>
                </td>
                <td>{{ status(f) }}</td>
                <td class="right">{{ f.accrued | currency: a.currency }}</td>
                <td class="right">{{ f.owed | currency: a.currency }}</td>
                <td class="right">
                  @if (f.owed > 0) {
                    <button type="button" class="link" [disabled]="busy()" (click)="pickFine.emit(f.fineId)">Waive or lower…</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="empty">No fines.</p>
      }

      <h4>Payments</h4>
      @if (v.payments.length) {
        <table>
          <thead><tr><th>Paid</th><th class="right">Amount</th><th>To fines</th><th></th></tr></thead>
          <tbody>
            @for (pay of v.payments; track pay.paymentId) {
              <tr>
                <td>{{ pay.recordedAt | date: 'medium' }}<br /><span class="mono small muted">{{ pay.paymentId }}</span></td>
                <td class="right">{{ pay.amount | currency: a.currency }}</td>
                <td class="small">
                  @for (s of pay.shares; track s.fineId) {
                    {{ s.amount | currency: a.currency }} to {{ fineTitle(s.fineId) }}<br />
                  }
                </td>
                <td class="right">
                  @if (pay.reversedAt) {
                    <span class="tag tag-danger">reversed {{ pay.reversedAt | date: 'mediumDate' }}</span>
                    <br /><span class="small muted">{{ pay.reversalReason }}</span>
                  } @else if (reversing() === pay.paymentId) {
                    <form class="actions" [formGroup]="reasonForm" (ngSubmit)="reverse(pay.paymentId)">
                      <input formControlName="reason" placeholder="Why reverse it?" aria-label="Reversal reason" maxlength="500" />
                      <button type="submit" class="danger-button" [disabled]="reasonForm.invalid || busy()">Reverse</button>
                      <button type="button" (click)="reversing.set(null)">Keep</button>
                    </form>
                  } @else {
                    <button type="button" class="link" [disabled]="busy()" (click)="startReversal(pay.paymentId)">Reverse…</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="empty">No payments.</p>
      }

      @if (a.history.length) {
        <h4>Returned loans</h4>
        <table>
          <thead><tr><th>Title</th><th>Borrowed</th><th>Returned</th></tr></thead>
          <tbody>
            @for (h of a.history; track h.loanId) {
              <tr>
                <td>{{ name(h.title) }}</td>
                <td>{{ h.borrowedOn | date: 'mediumDate' }}</td>
                <td>{{ h.returnedOn | date: 'mediumDate' }} @if (h.lost) { <span class="tag tag-danger">lost</span> }</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class PatronCardComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly view = input.required<PatronDeskView>();
  readonly busy = input(false);
  readonly pickFine = output<string>();
  readonly reversal = output<{ paymentId: string; reason: string }>();

  protected readonly reversing = signal<string | null>(null);
  protected readonly reasonForm = this.fb.group({ reason: ['', Validators.required] });

  // An overdue fine takes its loan's id, so a fine names the title it was for; a replacement fee is named by its kind.
  private readonly loanTitles = computed(() => {
    const { loans, history } = this.view().account;
    return new Map([...loans, ...history].map(l => [l.loanId, l.title] as const));
  });

  protected name(title: AccountTitle | null): string {
    return title?.title ?? 'Title no longer in the catalog';
  }

  protected fineTitle(fineId: string): string {
    const title = this.loanTitles().get(fineId);
    if (title) return `“${title.title}”`;
    const fine = this.view().account.fines.find(f => f.fineId === fineId);
    return fine ? fineKinds[fine.kind].toLowerCase() : 'a fine';
  }

  protected kind(fine: AccountFine): string {
    return fineKinds[fine.kind];
  }

  protected status(fine: AccountFine): string {
    return fineStatuses[fine.status];
  }

  protected startReversal(paymentId: string): void {
    this.reasonForm.reset();
    this.reversing.set(paymentId);
  }

  protected reverse(paymentId: string): void {
    if (this.reasonForm.invalid) return;
    this.reversal.emit({ paymentId, reason: this.reasonForm.getRawValue().reason.trim() });
    this.reversing.set(null);
  }
}
