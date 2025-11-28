export interface PaginatorResponse<T>{
    currentPage: number,
    totalPages: number,
    pageSize: number,
    totalCount: number,
    title?: string,
    columns?: string[],
    hasPrevious: boolean,
    hasNext: boolean,
    paginationApplied: boolean
    items: T
}