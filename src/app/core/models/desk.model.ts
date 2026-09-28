// Librarian desk: circulation by Member ID + barcode (L3a–L3c) and copies by barcode (L2a–L2c, L3c).
export type CopyCondition = 'NEW' | 'GOOD' | 'WORN' | 'DAMAGED';
export const copyConditions: readonly CopyCondition[] = ['NEW', 'GOOD', 'WORN', 'DAMAGED'];

export type CopyStatus = 'AVAILABLE' | 'ON_LOAN' | 'SET_ASIDE' | 'IN_MAINTENANCE' | 'LOST';

// What the desk does to a copy by barcode: from the copy in hand (/desk/copies) or a title's copies (L2d).
export type CopyAction =
  | { readonly kind: 'condition'; readonly barcode: string; readonly condition: CopyCondition }
  | { readonly kind: 'maintenance' | 'backInService' | 'found'; readonly barcode: string };

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

// GET /titles/{id}/copies (L2d), by barcode. Lendable is false for a deleted title, whose copies are still listed.
export interface TitleCopy {
  readonly copyId: string;
  readonly barcode: string;
  readonly condition: CopyCondition;
  readonly status: CopyStatus;
  readonly addedAt: string;
}

export interface TitleCopies {
  readonly titleId: string;
  readonly lendable: boolean;
  readonly copies: readonly TitleCopy[];
}
