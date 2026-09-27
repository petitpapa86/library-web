import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DeskFacade } from '../../../core/facades/desk.facade';
import { Outcome } from '../../../core/facades/outcome';
import { FlashComponent } from '../../../shared/components';
import { CirculationFormComponent } from '../presentation/circulation-form.component';

@Component({
  selector: 'app-circulation-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CirculationFormComponent, FlashComponent],
  template: `
    <h1>Circulation</h1>
    <app-circulation-form
      [busy]="busy()"
      [done]="done()"
      (checkOut)="run(desk.checkOut($event.memberId, $event.barcode))"
      (return)="run(desk.return($event.memberId, $event.barcode, $event.toMaintenance))"
      (lost)="run(desk.markLost($event.memberId, $event.barcode))"
    />
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
  `,
})
export class CirculationContainerComponent {
  protected readonly desk = inject(DeskFacade);
  protected readonly busy = signal(false);
  protected readonly done = signal(0);
  protected readonly outcome = signal<Outcome | null>(null);

  protected async run(action: Promise<Outcome>): Promise<void> {
    this.busy.set(true);
    const outcome = await action;
    this.outcome.set(outcome);
    if (outcome.ok) this.done.update(n => n + 1);
    this.busy.set(false);
  }
}
