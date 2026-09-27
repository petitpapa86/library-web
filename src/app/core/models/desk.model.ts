// Librarian desk: circulation by Member ID + barcode (L3a–L3c) and copies by barcode (L2a–L2c, L3c).
export type CopyCondition = 'NEW' | 'GOOD' | 'WORN' | 'DAMAGED';
export const copyConditions: readonly CopyCondition[] = ['NEW', 'GOOD', 'WORN', 'DAMAGED'];

export type CopyStatus = 'AVAILABLE' | 'ON_LOAN' | 'SET_ASIDE' | 'IN_MAINTENANCE' | 'LOST';

export interface DeskLoan {
  readonly loanId: string;
  readonly memberId: string;
  readonly barcode: string;
  readonly titleId: string;
  readonly dueDate: string;
}

// copyStatus says where the copy went: back on the shelf, set aside for a hold, or to maintenance.
export interface DeskReturn extends DeskLoan {
  readonly returnedAt: string;
  readonly copyStatus: CopyStatus;
}

export interface DeskLostLoan extends DeskLoan {
  readonly lostAt: string;
}

export interface CopyView {
  readonly copyId: string;
  readonly titleId: string;
  readonly barcode: string;
  readonly condition: CopyCondition;
  readonly status: CopyStatus;
}
