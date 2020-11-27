import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Skill } from 'src/entity/skill.entity';

@Injectable()
export class SkillService extends TypeOrmCrudService<Skill> {
  constructor(
    @InjectRepository(Skill) repo,
    // private readonly skillRepository: SkillRepository,
  ) {
    console.log('service constructor');

    super(repo);
  }

  async test() {
    return 'test';
  }
}
