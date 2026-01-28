export interface PagedRequest<T> {
  filters?: T;
  pageNumber: number;
  pageSize: number;
}