import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Skill } from 'src/entity/skill.entity';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillService extends TypeOrmCrudService<Skill> {
    constructor(
        @InjectRepository(Skill) repo,
        private readonly skillRepository: SkillRepository,
    ) {
        super(repo);
    }
}
