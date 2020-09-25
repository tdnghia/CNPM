import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Job } from 'src/entity/job.entity';
import { JobRepository } from './jobs.repository';

@Injectable()
export class JobService extends TypeOrmCrudService<Job> {
  constructor(
    @InjectRepository(Job) repo,
    private readonly categoryRepository: JobRepository,
  ) {
    super(repo);
  }
}
