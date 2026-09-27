import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReportsFacade } from '../../../core/facades/reports.facade';
import { ErrorBannerComponent, LoadingComponent } from '../../../shared/components';
import { ReportsComponent } from '../presentation/reports.component';

@Component({
  selector: 'app-reports-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReportsComponent, LoadingComponent, ErrorBannerComponent],
  template: `
    <div class="title-row">
      <h1>Reports</h1>
      <button type="button" [disabled]="facade.isLoading()" (click)="facade.reload()">Refresh</button>
    </div>
    @if (facade.error(); as message) {
      <app-error-banner [message]="message" [retryable]="true" (retry)="facade.reload()" />
    }
    @if (facade.isLoading() && !facade.overdue()) {
      <app-loading />
    }
    <app-reports [overdue]="facade.overdue()" [popular]="facade.popular()"
      [activeFines]="facade.activeFines()" [reconciliation]="facade.reconciliation()" />
  `,
})
export class ReportsContainerComponent implements OnInit {
  protected readonly facade = inject(ReportsFacade);

  // Reports move with every checkout and payment, so they are fetched fresh on every visit.
  ngOnInit(): void {
    this.facade.reload();
  }
}
