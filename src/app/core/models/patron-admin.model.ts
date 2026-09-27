// Patrons at the desk (L0–L0d), addressed by the Member ID.
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
