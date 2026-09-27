import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CopyCondition, CopyView, DeskLoan, DeskLostLoan, DeskReturn } from '../models';

// The desk's circulation (L3a–L3c) and copy handling (L2b, L2c, L3c): a Member ID and the barcode of the copy in hand.
@Injectable({ providedIn: 'root' })
export class DeskService {
  private readonly http = inject(HttpClient);

  async checkOut(memberId: string, barcode: string): Promise<DeskLoan> {
    return firstValueFrom(this.http.post<DeskLoan>('/api/loans', { memberId, barcode }));
  }

  async return(memberId: string, barcode: string, toMaintenance: boolean): Promise<DeskReturn> {
    return firstValueFrom(this.http.post<DeskReturn>('/api/loans/returns', { memberId, barcode, toMaintenance }));
  }

  async markLost(memberId: string, barcode: string): Promise<DeskLostLoan> {
    return firstValueFrom(this.http.post<DeskLostLoan>('/api/loans/losses', { memberId, barcode }));
  }

  async changeCondition(barcode: string, condition: CopyCondition): Promise<CopyView> {
    return firstValueFrom(this.http.put<CopyView>(`${this.copy(barcode)}/condition`, { condition }));
  }

  async sendToMaintenance(barcode: string): Promise<CopyView> {
    return firstValueFrom(this.http.put<CopyView>(`${this.copy(barcode)}/maintenance`, null));
  }

  async endMaintenance(barcode: string): Promise<CopyView> {
    return firstValueFrom(this.http.delete<CopyView>(`${this.copy(barcode)}/maintenance`));
  }

  async markFound(barcode: string): Promise<CopyView> {
    return firstValueFrom(this.http.post<CopyView>(`${this.copy(barcode)}/found`, null));
  }

  private copy(barcode: string): string {
    return `/api/copies/${encodeURIComponent(barcode.trim())}`;
  }
}
