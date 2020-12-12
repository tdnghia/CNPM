import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EducationsEntity } from 'src/entity/education.entity';

@Injectable()
export class EducationService extends TypeOrmCrudService<EducationsEntity> {
    constructor(
        @InjectRepository(EducationsEntity) repo,
      ) {
        super(repo);
      }
}
