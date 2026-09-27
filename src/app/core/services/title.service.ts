import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TitleSearchPage, TitleSearchQuery } from '../models';

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
}
