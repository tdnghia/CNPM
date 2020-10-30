import { take } from 'lodash';
import { Repository } from 'typeorm';
import { Pagination, PaginationOption } from '../Paginate';

export class BaseRepository<T> extends Repository<T> {
  async paginate(
    options: PaginationOption,
    selects?: Array<string>,
    relations?: Array<string>,
  ): Promise<Pagination<T>> {
    if (relations && selects) {
      const [results, count] = await this.findAndCount({
        take: options.limit,
        skip: options.page,
        relations: [...relations],
        where: {
          active: false,
        },
      });
      return new Pagination<T>({ results, total: count });
    }
    const [results, count] = await this.findAndCount({
      take: options.limit,
      skip: options.page,
      where: {
        active: false,
      },
    });
    return new Pagination<T>({ results, total: count });
  }
}
