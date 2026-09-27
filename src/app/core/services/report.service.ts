import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActiveFinesReport, OverdueReport, PopularTitlesReport } from '../models';

// L5a–L5c, as of today's library date.
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  async overdue(): Promise<OverdueReport> {
    return firstValueFrom(this.http.get<OverdueReport>('/api/reports/overdue'));
  }

  async popularTitles(): Promise<PopularTitlesReport> {
    return firstValueFrom(this.http.get<PopularTitlesReport>('/api/reports/popular-titles'));
  }

  async activeFines(): Promise<ActiveFinesReport> {
    return firstValueFrom(this.http.get<ActiveFinesReport>('/api/reports/active-fines'));
  }
}
