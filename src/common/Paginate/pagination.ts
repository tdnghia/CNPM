import { PaginationResultInterface } from './pagination.result.interface';

export class Pagination<PaginationEntity> {
  public data: PaginationEntity[];
  public totalPage: number;
  public total: number;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.data = paginationResults.results;
    this.totalPage = paginationResults.results.length;
    this.total = paginationResults.total;
  }
}
