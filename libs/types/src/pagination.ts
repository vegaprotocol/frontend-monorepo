/**
 * Pagination constructs to support cursor based pagination in the API
 */
export interface Pagination {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}
