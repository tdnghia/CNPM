import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileSkill } from 'src/entity/ProfileSkill.entity';
import { Skill } from 'src/entity/skill.entity';
import { User } from 'src/entity/user.entity';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, User, ProfileSkill])],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
