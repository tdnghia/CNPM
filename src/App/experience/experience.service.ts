import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Experience } from 'src/entity/experience.entity';

@Injectable()
export class ExperienceService extends TypeOrmCrudService<Experience> {
    constructor(
        @InjectRepository(Experience) repo,
      ) {
        super(repo);
      }
}
