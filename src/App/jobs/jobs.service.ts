import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Job } from 'src/entity/job.entity';
import { JobRepository } from './jobs.repository';
import { getManager } from 'typeorm';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class JobService extends TypeOrmCrudService<Job> {
  private tableName = 'job_favorite ';
  constructor(
    @InjectRepository(Job) repo,
    private readonly repository: JobRepository,
    private readonly userRepository: UserRepository,
  ) {
    super(repo);
  }

  async addFavoritesJob(jobId: string, userId: string) {
    const manager = getManager();
    const job = await this.repository.findOne({ where: { id: jobId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!job) {
      throw new NotFoundException(`Job not found`);
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const favoritesByUser = await manager.query(
        `SELECT * FROM ${this.tableName} WHERE "jobId"='${jobId}' and "userId"='${userId}'`,
      );

      if (favoritesByUser.length == 0) {
        await manager.query(
          `INSERT INTO ${this.tableName} values('${jobId}','${userId}')`,
        );
        return { status: true };
      } else {
        await manager.query(
          `DELETE FROM ${this.tableName} WHERE "jobId"='${jobId}' and "userId"='${userId}'`,
        );
        return { status: false };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Internal Server Error Exception ${error}`,
      );
    }
  }

  async getFavoritesByUser(userId: string) {
    const manager = getManager();
    const favoritesJob = await manager.query(
      `SELECT * FROM ${this.tableName} WHERE "userId"='${userId}'`,
    );

    const jobIds = favoritesJob.map(job => job.jobId);
    const jobByIds = await this.repository.findByIds(jobIds);
    console.log('job by ids', jobByIds);
  }

  async appliesJob(jobId: string, userId: string) {
    this.tableName = 'job_applied';
    const manager = getManager();
    const job = await this.repository.findOne({ where: { id: jobId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!job) {
      throw new NotFoundException(`Job not found`);
    }
    console.log('user', user);

    if (!user || user.roleId === 4) {
      throw new NotFoundException('Current User is not available');
    }
    try {
      const jobApplied = await manager.query(
        `SELECT * FROM ${this.tableName} WHERE "jobId"='${jobId}' and "userId"='${userId}'`,
      );

      if (jobApplied.length == 0) {
        await manager.query(
          `INSERT INTO ${this.tableName} values('${jobId}','${userId}')`,
        );
        return { status: true };
      } else {
        throw new ConflictException('Job has been already applied');
      }
    } catch (error) {
      if (error.response.statusCode === 409) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Internal Server Error Exception ${error}`,
      );
    }
  }

  async getJobAppliedByCompany(userId: string) {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const jobApplied = await this.repository.find({ where: { user } });
    console.log('jobApplied', jobApplied);
  }
}
