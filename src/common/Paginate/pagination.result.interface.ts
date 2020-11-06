export interface PaginationResultInterface<PaginationEnterty> {
  results: PaginationEnterty[];
  total: number;
  next?: string;
  previous?: string;
}
