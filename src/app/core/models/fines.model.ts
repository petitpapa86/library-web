// Fines at the desk (L4a–L4d). Amounts are in the library's one currency (R-02).
export type OverrideReason = 'SYSTEM_ERROR' | 'LOST_ITEM_PAID_FOR' | 'OTHER';
export const overrideReasons: readonly { readonly code: OverrideReason; readonly label: string }[] = [
  { code: 'SYSTEM_ERROR', label: 'System error' },
  { code: 'LOST_ITEM_PAID_FOR', label: 'Lost item paid for' },
  { code: 'OTHER', label: 'Other (note required)' },
];

export interface PaymentAllocation {
  readonly fineId: string;
  readonly applied: number;
  readonly owed: number;
  readonly status: string;
}

export interface RecordedPayment {
  readonly paymentId: string;
  readonly memberId: string;
  readonly amount: number;
  readonly currency: string;
  readonly allocations: readonly PaymentAllocation[];
  readonly balance: number;
  readonly recordedAt: string;
}

export interface ReversedPayment {
  readonly paymentId: string;
  readonly patronId: string;
  readonly amount: number;
  readonly currency: string;
  readonly reason: string;
  readonly restored: readonly PaymentAllocation[];
  readonly balance: number;
  readonly reversedAt: string;
}

export interface FineOverrideRequest {
  readonly reason: OverrideReason;
  readonly note: string | null;
}

export interface WaivedFine {
  readonly fineId: string;
  readonly status: string;
  readonly waived: number;
  readonly owed: number;
  readonly currency: string;
}

export interface AdjustedFine {
  readonly fineId: string;
  readonly status: string;
  readonly reduced: number;
  readonly owed: number;
  readonly currency: string;
  readonly adjustment: number;
}
