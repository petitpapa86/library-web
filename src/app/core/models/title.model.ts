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
