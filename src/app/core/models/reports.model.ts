// Daily reports (L5a–L5c) and the balance reconciliation (QA-03).
export interface ReportTitle {
  readonly title: string;
  readonly author: string;
  readonly isbn: string;
}

export interface OverdueLoan {
  readonly loanId: string;
  readonly patron: { readonly memberId: string; readonly name: string; readonly email: string | null; readonly phone: string | null } | null;
  readonly titleId: string;
  readonly title: ReportTitle | null;
  readonly barcode: string;
  readonly borrowedOn: string;
  readonly dueDate: string;
  readonly overdueSince: string;
  readonly daysOverdue: number;
  readonly renewed: boolean;
}

export interface OverdueReport {
  readonly asOf: string;
  readonly loans: readonly OverdueLoan[];
}

export interface PopularTitlesReport {
  readonly asOf: string;
  readonly from: string;
  readonly windowDays: number;
  readonly top: number;
  readonly titles: readonly { readonly rank: number; readonly titleId: string; readonly title: ReportTitle | null; readonly checkouts: number }[];
}

export interface ActiveFinesReport {
  readonly asOf: string;
  readonly owed: number;
  readonly currency: string;
  readonly fines: number;
  readonly patrons: number;
}

export interface Reconciliation {
  readonly checkedAt: string;
  readonly balanced: boolean;
  readonly accounts: number;
  readonly fines: number;
  readonly balance: number;
  readonly currency: string;
  readonly findings: readonly { readonly code: string; readonly patronId: string; readonly recordId: string; readonly detail: string }[];
}
