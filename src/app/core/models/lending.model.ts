// POST /me/loans (P2), POST /me/loans/{id}/renewal (P4).
export interface MyLoan {
  readonly loanId: string;
  readonly titleId: string;
  readonly barcode: string;
  readonly dueDate: string;
}

// POST /me/holds (P3).
export interface MyHold {
  readonly holdId: string;
  readonly titleId: string;
  readonly status: string;
  readonly placedAt: string;
}
