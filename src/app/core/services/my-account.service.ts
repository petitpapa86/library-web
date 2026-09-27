import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Account, MyHold, MyLoan } from '../models';

// The signed-in patron's own lending (/me routes). The first call links the Keycloak login to the patron enrolled
// with the same verified email (ADR-005).
@Injectable({ providedIn: 'root' })
export class MyAccountService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/me';

  async account(): Promise<Account> {
    return firstValueFrom(this.http.get<Account>(`${this.base}/account`));
  }

  async checkOut(titleId: string): Promise<MyLoan> {
    return firstValueFrom(this.http.post<MyLoan>(`${this.base}/loans`, { titleId }));
  }

  async renew(loanId: string): Promise<MyLoan> {
    return firstValueFrom(this.http.post<MyLoan>(`${this.base}/loans/${loanId}/renewal`, null));
  }

  async placeHold(titleId: string): Promise<MyHold> {
    return firstValueFrom(this.http.post<MyHold>(`${this.base}/holds`, { titleId }));
  }

  async cancelHold(holdId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/holds/${holdId}/cancellation`, null));
  }
}
