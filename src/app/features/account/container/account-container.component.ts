import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MyAccountFacade } from '../../../core/facades/my-account.facade';
import { NoticesFacade } from '../../../core/facades/notices.facade';
import { Outcome } from '../../../core/facades/outcome';
import { EmptyStateComponent, ErrorBannerComponent, FlashComponent, LoadingComponent } from '../../../shared/components';
import { FinesComponent } from '../presentation/fines.component';
import { HistoryComponent } from '../presentation/history.component';
import { HoldsComponent } from '../presentation/holds.component';
import { LoansComponent } from '../presentation/loans.component';
import { NoticesComponent } from '../presentation/notices.component';

// P5 — my account: notices (R-09), loans, holds, fines and balance, loan history.
@Component({
  selector: 'app-account-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, NoticesComponent, LoansComponent, HoldsComponent, FinesComponent, HistoryComponent,
    LoadingComponent, ErrorBannerComponent, EmptyStateComponent, FlashComponent,
  ],
  template: `
    <h1>My account</h1>
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    @if (facade.error(); as error) {
      <app-error-banner [message]="error.message" [retryable]="error.code !== 'PATRON_NOT_LINKED'" (retry)="facade.reload()" />
    } @else if (facade.account(); as account) {
      <p class="summary">
        Member <strong class="mono">{{ account.memberId }}</strong> ·
        Balance <strong [class.danger]="account.balance > 0">{{ account.balance | currency: account.currency }}</strong>
      </p>

      @if (notices.notices().length) {
        <section>
          <h2>Notices</h2>
          <app-notices [notices]="notices.notices()" [busyId]="busyId()" (markRead)="markRead($event)" />
        </section>
      }

      <section>
        <h2>Loans</h2>
        @if (account.loans.length) {
          <app-loans [loans]="account.loans" [busyId]="busyId()" (renew)="run($event, facade.renew($event))" />
        } @else {
          <app-empty-state message="You have nothing on loan." />
        }
      </section>

      <section>
        <h2>Holds</h2>
        @if (account.holds.length) {
          <app-holds [holds]="account.holds" [busyId]="busyId()" (cancel)="run($event, facade.cancelHold($event))" />
        } @else {
          <app-empty-state message="You have no holds." />
        }
      </section>

      @if (account.fines.length) {
        <section>
          <h2>Fines</h2>
          <app-fines [fines]="account.fines" [currency]="account.currency" />
        </section>
      }

      <section>
        <h2>History</h2>
        @if (account.history.length) {
          <app-history [history]="account.history" />
        } @else {
          <app-empty-state message="No returned loans yet." />
        }
      </section>
    } @else {
      <app-loading />
    }
  `,
})
export class AccountContainerComponent implements OnInit {
  protected readonly facade = inject(MyAccountFacade);
  protected readonly notices = inject(NoticesFacade);
  protected readonly outcome = signal<Outcome | null>(null);
  protected readonly busyId = signal<string | null>(null);

  // The account and notices change at the desk and in the daily run, so they are fetched fresh on every visit.
  ngOnInit(): void {
    this.facade.reload();
    this.notices.reload();
  }

  protected async markRead(noticeId: string): Promise<void> {
    this.busyId.set(noticeId);
    await this.notices.markRead(noticeId);
    this.busyId.set(null);
  }

  protected async run(id: string, action: Promise<Outcome>): Promise<void> {
    this.busyId.set(id);
    this.outcome.set(await action);
    this.busyId.set(null);
  }
}
