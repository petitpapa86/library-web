// GET /titles (P1).
export interface TitleSummary {
  readonly titleId: string;
  readonly isbn: string;
  readonly title: string;
  readonly author: string;
  readonly genre: string;
}

export interface TitleSearchPage {
  readonly items: readonly TitleSummary[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

export interface TitleSearchQuery {
  readonly title?: string;
  readonly author?: string;
  readonly genre?: string;
  readonly page: number;
}

// Title management at the desk (L1a–L1d). The ISBN is set once, when the title is added (C-12).
export interface TitleDraft {
  readonly title: string;
  readonly author: string;
  readonly genre: string;
}

export interface NewTitle extends TitleDraft {
  readonly isbn: string;
}
