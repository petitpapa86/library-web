import { AccountTitle } from './account.model';

// GET /me/notices (R-09: P3, P7), newest first. A hold notice has holdId and pickupDeadline, a loan notice loanId and
// dueDate; the others are null. readAt null = not read yet. Dates are library dates (yyyy-MM-dd).
export type NoticeKind = 'HOLD_READY' | 'LOAN_DUE_SOON' | 'LOAN_OVERDUE';

export interface MyNotice {
  readonly noticeId: string;
  readonly kind: NoticeKind;
  readonly titleId: string;
  readonly title: AccountTitle | null;
  readonly holdId: string | null;
  readonly pickupDeadline: string | null;
  readonly loanId: string | null;
  readonly dueDate: string | null;
  readonly postedAt: string;
  readonly readAt: string | null;
}
