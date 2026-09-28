import { Account } from './account.model';

// Patrons at the desk (L0–L0e), addressed by the Member ID.
export interface EnrollPatronRequest {
  readonly fullName: string;
  readonly email: string | null;
  readonly phone: string | null;
}

export interface EnrolledPatron {
  readonly patronId: string;
  readonly memberId: string;
}

export interface PatronContact {
  readonly patronId: string;
  readonly memberId: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly loginLinked: boolean;
}

export interface PatronClosure {
  readonly patronId: string;
  readonly memberId: string;
  readonly closed: boolean;
  readonly closedAt: string | null;
}

export interface AnonymisedPatron {
  readonly patronId: string;
  readonly memberId: string;
  readonly anonymisedAt: string;
}

// GET /patrons/{memberId} (L0e). Anonymised: name, email and phone are null.
export interface DeskPatron {
  readonly patronId: string;
  readonly memberId: string;
  readonly name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly enrolledAt: string;
  readonly closed: boolean;
  readonly closedAt: string | null;
  readonly anonymisedAt: string | null;
  readonly loginLinked: boolean;
}

export interface DeskPaymentShare {
  readonly fineId: string;
  readonly amount: number;
}

// Newest first; in the account's currency.
export interface DeskPayment {
  readonly paymentId: string;
  readonly amount: number;
  readonly recordedAt: string;
  readonly shares: readonly DeskPaymentShare[];
  readonly reversedAt: string | null;
  readonly reversalReason: string | null;
}

// Account is what the patron sees of themselves (P5), with every fine's id.
export interface PatronDeskView {
  readonly patron: DeskPatron;
  readonly account: Account;
  readonly payments: readonly DeskPayment[];
}

// GET /patrons?q= (L0f): open and closed patrons whose name or email contains q; never an anonymised one.
export interface PatronMatch {
  readonly patronId: string;
  readonly memberId: string;
  readonly name: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly closed: boolean;
}

export interface PatronSearchPage {
  readonly items: readonly PatronMatch[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}
