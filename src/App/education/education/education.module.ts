import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationsEntity } from 'src/entity/education.entity';
import { EducationProfile } from 'src/entity/EducationProfile.entity';
import { Profile } from 'src/entity/profile.entity';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  imports: [TypeOrmModule.forFeature([EducationsEntity, Profile, EducationProfile])],
  controllers: [EducationController],
  providers: [EducationService]
})
export class EducationModule {}
