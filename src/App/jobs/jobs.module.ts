import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobService } from './jobs.service';
import { Job } from 'src/entity/job.entity';
import { User } from 'src/entity/user.entity';
import { Category } from 'src/entity/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, User, Category])],
  providers: [JobService],
  controllers: [JobsController],
})
export class JobsModule {}
