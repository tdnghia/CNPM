import { BaseRepository } from 'src/common/Base/base.repository';
import { EntityRepository, Repository } from 'typeorm';
import { Job } from '../../entity/job.entity';
@EntityRepository(Job)
export class JobRepository extends BaseRepository<Job> {}
