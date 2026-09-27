import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdjustedFine, FineOverrideRequest, RecordedPayment, Reconciliation, ReversedPayment, WaivedFine } from '../models';

// Fines and payments at the desk (L4a–L4d) and the reconciliation check (QA-03).
@Injectable({ providedIn: 'root' })
export class FinesService {
  private readonly http = inject(HttpClient);

  async recordPayment(memberId: string, amount: number): Promise<RecordedPayment> {
    return firstValueFrom(this.http.post<RecordedPayment>('/api/payments', { memberId: memberId.trim(), amount }));
  }

  async reversePayment(paymentId: string, reason: string): Promise<ReversedPayment> {
    return firstValueFrom(this.http.post<ReversedPayment>(`/api/payments/${paymentId.trim()}/reversal`, { reason }));
  }

  async waive(fineId: string, request: FineOverrideRequest): Promise<WaivedFine> {
    return firstValueFrom(this.http.post<WaivedFine>(`/api/fines/${fineId.trim()}/waiver`, request));
  }

  async adjust(fineId: string, amount: number, request: FineOverrideRequest): Promise<AdjustedFine> {
    return firstValueFrom(this.http.post<AdjustedFine>(`/api/fines/${fineId.trim()}/reductions`, { amount, ...request }));
  }

  async reconcile(): Promise<Reconciliation> {
    return firstValueFrom(this.http.get<Reconciliation>('/api/fines/reconciliation'));
  }
}
