import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';
import { Experience } from 'src/entity/experience.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/entity/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Experience, Profile])],
  providers: [ExperienceService],
  controllers: [ExperienceController]
})
export class ExperienceModule {}
