import { BaseRepository } from 'src/common/Base/base.repository';
import { Skill } from 'src/entity/skill.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Skill)
export class SkillRepository extends BaseRepository<Skill> {}
