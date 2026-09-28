import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AnonymisedPatron, EnrollPatronRequest, EnrolledPatron, PatronClosure, PatronContact, PatronDeskView } from '../models';

// Patrons at the desk (L0–L0e), by Member ID.
@Injectable({ providedIn: 'root' })
export class PatronAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/patrons';

  // L0e — contact, status, account, and payments, with every fine and payment id.
  async lookup(memberId: string): Promise<PatronDeskView> {
    return firstValueFrom(this.http.get<PatronDeskView>(this.patron(memberId)));
  }

  async enroll(request: EnrollPatronRequest): Promise<EnrolledPatron> {
    return firstValueFrom(this.http.post<EnrolledPatron>(this.base, request));
  }

  // L0b — replaces both: a field left empty is removed; at least one must stay.
  async changeContact(memberId: string, email: string | null, phone: string | null): Promise<PatronContact> {
    return firstValueFrom(this.http.put<PatronContact>(`${this.patron(memberId)}/contact`, { email, phone }));
  }

  async close(memberId: string): Promise<PatronClosure> {
    return firstValueFrom(this.http.put<PatronClosure>(`${this.patron(memberId)}/closure`, null));
  }

  async reopen(memberId: string): Promise<PatronClosure> {
    return firstValueFrom(this.http.delete<PatronClosure>(`${this.patron(memberId)}/closure`));
  }

  async anonymise(memberId: string): Promise<AnonymisedPatron> {
    return firstValueFrom(this.http.put<AnonymisedPatron>(`${this.patron(memberId)}/anonymisation`, null));
  }

  private patron(memberId: string): string {
    return `${this.base}/${encodeURIComponent(memberId.trim())}`;
  }
}
