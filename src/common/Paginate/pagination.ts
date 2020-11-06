import { PaginationResultInterface } from './pagination.result.interface';

export class Pagination<PaginationEntity> {
  public results: PaginationEntity[];
  public totalPage: number;
  public total: number;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results;
    this.totalPage = paginationResults.results.length;
    this.total = paginationResults.total;
  }
}
