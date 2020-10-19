import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobService } from './jobs.service';
import { Job } from 'src/entity/job.entity';
import { User } from 'src/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, User])],
  providers: [JobService],
  controllers: [JobsController],
})
export class JobsModule {}
