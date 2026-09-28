import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FinesFacade } from '../../../core/facades/fines.facade';
import { Outcome } from '../../../core/facades/outcome';
import { PatronAdminFacade } from '../../../core/facades/patron-admin.facade';
import { PatronLookupFacade } from '../../../core/facades/patron-lookup.facade';
import { EnrollPatronRequest } from '../../../core/models';
import { ErrorBannerComponent, FlashComponent, LoadingComponent } from '../../../shared/components';
import { EnrollFormComponent } from '../presentation/enroll-form.component';
import { FineOverride, FineOverrideFormComponent } from '../presentation/fine-override-form.component';
import { PatronAction, PatronActionsComponent } from '../presentation/patron-actions.component';
import { PatronCardComponent } from '../presentation/patron-card.component';
import { PatronLookupFormComponent } from '../presentation/patron-lookup-form.component';

@Component({
  selector: 'app-patrons-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EnrollFormComponent, PatronActionsComponent, PatronLookupFormComponent, PatronCardComponent, FineOverrideFormComponent,
    FlashComponent, ErrorBannerComponent, LoadingComponent,
  ],
  template: `
    <h1>Patrons</h1>
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    <section>
      <h2>Look up a patron</h2>
      <app-patron-lookup-form [busy]="lookup.isLoading()" (lookUp)="lookUp($event)" />
      @if (lookup.error(); as message) {
        <app-error-banner [message]="message" />
      } @else if (lookup.view(); as view) {
        <app-patron-card [view]="view" [busy]="busy()" (pickFine)="pickedFine.set($event)"
          (reversal)="run(fines.reversePayment($event.paymentId, $event.reason))" />
        @if (pickedFine()) {
          <div class="panel">
            <app-fine-override-form [busy]="busy()" [fineId]="pickedFine()" (override)="override($event)" />
          </div>
        }
      } @else if (lookup.isLoading()) {
        <app-loading />
      }
    </section>
    <section>
      <h2>Enroll a patron</h2>
      <app-enroll-form [busy]="busy()" [done]="enrolled()" (enroll)="enroll($event)" />
    </section>
    <section>
      <h2>Manage a patron</h2>
      <app-patron-actions [busy]="busy()" [lookedUp]="lookup.memberId()" (act)="act($event)" />
    </section>
  `,
})
export class PatronsContainerComponent {
  private readonly patrons = inject(PatronAdminFacade);
  protected readonly lookup = inject(PatronLookupFacade);
  protected readonly fines = inject(FinesFacade);
  protected readonly busy = signal(false);
  protected readonly enrolled = signal(0);
  protected readonly pickedFine = signal<string | null>(null);
  protected readonly outcome = signal<Outcome | null>(null);

  protected lookUp(memberId: string): void {
    this.pickedFine.set(null);
    this.outcome.set(null);
    this.lookup.lookUp(memberId);
  }

  protected async enroll(request: EnrollPatronRequest): Promise<void> {
    if ((await this.run(this.patrons.enroll(request))).ok) this.enrolled.update(n => n + 1);
  }

  protected act(action: PatronAction): Promise<Outcome> {
    switch (action.kind) {
      case 'contact': return this.run(this.patrons.changeContact(action.memberId, action.email, action.phone));
      case 'close': return this.run(this.patrons.close(action.memberId));
      case 'reopen': return this.run(this.patrons.reopen(action.memberId));
      case 'anonymise': return this.run(this.patrons.anonymise(action.memberId));
    }
  }

  protected async override(o: FineOverride): Promise<void> {
    const request = { reason: o.reason, note: o.note };
    const outcome = await this.run(o.amount === null ? this.fines.waive(o.fineId, request) : this.fines.adjust(o.fineId, o.amount, request));
    if (outcome.ok) this.pickedFine.set(null);
  }

  protected async run(action: Promise<Outcome>): Promise<Outcome> {
    this.busy.set(true);
    const outcome = await action;
    this.outcome.set(outcome);
    this.busy.set(false);
    return outcome;
  }
}
