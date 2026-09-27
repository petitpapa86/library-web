// GET /me/account (P5). Dates are library dates (yyyy-MM-dd); amounts are in the account's currency (R-02).
export interface AccountTitle {
  readonly title: string;
  readonly author: string;
  readonly isbn: string;
}

export interface AccountLoan {
  readonly loanId: string;
  readonly titleId: string;
  readonly title: AccountTitle | null;
  readonly barcode: string;
  readonly borrowedOn: string;
  readonly dueDate: string;
  readonly renewed: boolean;
  readonly overdueSince: string | null;
}

export type HoldStatus = 'WAITING' | 'READY';

export interface AccountHold {
  readonly holdId: string;
  readonly titleId: string;
  readonly title: AccountTitle | null;
  readonly status: HoldStatus;
  readonly placedAt: string;
  readonly position: number | null;
  readonly pickupDeadline: string | null;
}

export interface AccountFineEntry {
  readonly kind: 'WAIVED' | 'ADJUSTED' | 'PAID';
  readonly amount: number;
  readonly reason: string | null;
  readonly at: string;
  readonly reversed: boolean;
}

export interface AccountFine {
  readonly fineId: string;
  readonly kind: 'OVERDUE' | 'REPLACEMENT';
  readonly dueDate: string;
  readonly status: 'ACCRUING' | 'CLOSED' | 'WAIVED' | 'CLEARED';
  readonly accrued: number;
  readonly accruedAsOf: string;
  readonly owed: number;
  readonly entries: readonly AccountFineEntry[];
}

export interface AccountPastLoan {
  readonly loanId: string;
  readonly titleId: string;
  readonly title: AccountTitle | null;
  readonly borrowedOn: string;
  readonly dueDate: string;
  readonly returnedOn: string;
  readonly lost: boolean;
}

export interface Account {
  readonly memberId: string;
  readonly balance: number;
  readonly currency: string;
  readonly loans: readonly AccountLoan[];
  readonly holds: readonly AccountHold[];
  readonly fines: readonly AccountFine[];
  readonly history: readonly AccountPastLoan[];
}
