import { Injectable, computed, inject, resource } from '@angular/core';
import { toApiError } from '../http/api-error';
import { FinesService } from '../services/fines.service';
import { ReportService } from '../services/report.service';

// The daily reports (L5a–L5c) and the reconciliation (QA-03), all fetched fresh when the reports screen opens.
@Injectable({ providedIn: 'root' })
export class ReportsFacade {
  private readonly reports = inject(ReportService);
  private readonly fines = inject(FinesService);

  private readonly _overdue = resource({ loader: () => this.reports.overdue() });
  private readonly _popular = resource({ loader: () => this.reports.popularTitles() });
  private readonly _activeFines = resource({ loader: () => this.reports.activeFines() });
  private readonly _reconciliation = resource({ loader: () => this.fines.reconcile() });

  readonly overdue = computed(() => this._overdue.value() ?? null);
  readonly popular = computed(() => this._popular.value() ?? null);
  readonly activeFines = computed(() => this._activeFines.value() ?? null);
  readonly reconciliation = computed(() => this._reconciliation.value() ?? null);
  readonly isLoading = computed(() =>
    this._overdue.isLoading() || this._popular.isLoading() || this._activeFines.isLoading() || this._reconciliation.isLoading());
  readonly error = computed(() => {
    const err = this._overdue.error() ?? this._popular.error() ?? this._activeFines.error() ?? this._reconciliation.error();
    return err ? toApiError(err.cause ?? err).message : null;
  });

  reload(): void {
    this._overdue.reload();
    this._popular.reload();
    this._activeFines.reload();
    this._reconciliation.reload();
  }
}
