import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Outcome } from '../../../core/facades/outcome';
import { PatronAdminFacade } from '../../../core/facades/patron-admin.facade';
import { EnrollPatronRequest } from '../../../core/models';
import { FlashComponent } from '../../../shared/components';
import { EnrollFormComponent } from '../presentation/enroll-form.component';
import { PatronAction, PatronActionsComponent } from '../presentation/patron-actions.component';

@Component({
  selector: 'app-patrons-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EnrollFormComponent, PatronActionsComponent, FlashComponent],
  template: `
    <h1>Patrons</h1>
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    <section>
      <h2>Enroll a patron</h2>
      <app-enroll-form [busy]="busy()" [done]="enrolled()" (enroll)="enroll($event)" />
    </section>
    <section>
      <h2>Manage a patron</h2>
      <app-patron-actions [busy]="busy()" (act)="act($event)" />
    </section>
  `,
})
export class PatronsContainerComponent {
  private readonly patrons = inject(PatronAdminFacade);
  protected readonly busy = signal(false);
  protected readonly enrolled = signal(0);
  protected readonly outcome = signal<Outcome | null>(null);

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

  private async run(action: Promise<Outcome>): Promise<Outcome> {
    this.busy.set(true);
    const outcome = await action;
    this.outcome.set(outcome);
    this.busy.set(false);
    return outcome;
  }
}
