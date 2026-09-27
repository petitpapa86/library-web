import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CopyCondition, CopyView, NewTitle, TitleDraft, TitleSearchPage, TitleSearchQuery, TitleSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/titles';

  // P1 — the filters are ANDed; none browses the whole catalog.
  async search(query: TitleSearchQuery, pageSize = 20): Promise<TitleSearchPage> {
    let params = new HttpParams().set('page', query.page).set('pageSize', pageSize);
    for (const key of ['title', 'author', 'genre'] as const) {
      const value = query[key]?.trim();
      if (value) params = params.set(key, value);
    }
    return firstValueFrom(this.http.get<TitleSearchPage>(this.base, { params }));
  }

  // L1a
  async add(title: NewTitle): Promise<{ titleId: string; isbn: string }> {
    return firstValueFrom(this.http.post<{ titleId: string; isbn: string }>(this.base, title));
  }

  // L1b — the ISBN can't change.
  async update(titleId: string, draft: TitleDraft): Promise<TitleSummary> {
    return firstValueFrom(this.http.put<TitleSummary>(`${this.base}/${titleId}`, draft));
  }

  // L1c
  async remove(titleId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/${titleId}`));
  }

  // L1d
  async restore(titleId: string): Promise<TitleSummary> {
    return firstValueFrom(this.http.post<TitleSummary>(`${this.base}/${titleId}/restoration`, null));
  }

  // L2a
  async addCopy(titleId: string, barcode: string, condition: CopyCondition): Promise<CopyView> {
    return firstValueFrom(this.http.post<CopyView>(`${this.base}/${titleId}/copies`, { barcode, condition }));
  }
}
