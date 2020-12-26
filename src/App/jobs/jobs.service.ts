import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
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
import { CategoryRepository } from '../categories/categories.repository';
import axios from 'axios';
import { AddressRepository } from '../address/address.repository';
import { AppliesJobRepo } from './jobApplies.repository';
import * as _ from 'lodash';

@Injectable()
export class JobService extends TypeOrmCrudService<Job> {
  private tableName = 'job_favorite ';
  private job_applied = 'applied_job';
  constructor(
    @InjectRepository(Job) repo,
    private readonly repository: JobRepository,
    private readonly userRepository: UserRepository,
    private readonly cateRepository: CategoryRepository,
    private readonly addressRepository: AddressRepository,
    private readonly appliesJobRepo: AppliesJobRepo,
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
    const jobByIds = await this.repository.findByIds(jobIds, {
      relations: ['user', 'user.profile', 'categories'],
    });
    return jobByIds.map(job => {
      delete job.user.password;
      delete job.user.ExpiredToken;
      delete job.user.ExpiredToken;
      return job;
    });
  }

  async appliesJob(jobId: string, userId: string) {
    const manager = getManager();
    const job = await this.repository.findOne({ where: { id: jobId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!job) {
      throw new NotFoundException(`Job not found`);
    }

    if (!user || user.roleId === 4) {
      throw new NotFoundException('Current User is not available');
    }
    try {
      const jobApplied = await manager.query(
        `SELECT * FROM ${this.job_applied} WHERE "jobId"='${jobId}' and "userId"='${userId}'`,
      );

      if (jobApplied.length == 0) {
        const createJob = this.appliesJobRepo.create({ user, jobId });
        await this.appliesJobRepo.save(createJob);
        return { status: true };
      } else {
        throw new ConflictException('Job has been already applied');
      }
    } catch (error) {
      throw error;
    }
  }

  async createJob(dto: Job) {
    try {
      const { latitude, longitude } = dto;
      const provinces = await await axios.get(
        'https://vapi.vnappmob.com/api/province',
      );
      let createAddr: any;
      for (let index = 0; index < provinces.data.results.length; index++) {
        console.log(provinces.data.results[index]);

        if (provinces.data.results[index].province_id == dto.city) {
          createAddr = this.addressRepository.create({
            latitude,
            longitude,
            city: dto.city,
            description: dto.street,
          });
          createAddr = await this.addressRepository.save(createAddr);
          break;
        }
      }
      if (!createAddr) {
        return new BadRequestException('Address is invalid type');
      }
      const findCateIds = await this.cateRepository.findByIds(dto.cateIds);
      const createJob = this.repository.create({
        ...dto,
        categories: findCateIds,
        address: createAddr,
      });
      return await this.repository.save(createJob);
    } catch (error) {
      throw new InternalServerErrorException(
        `Internal Server Error Exception ${error}`,
      );
    }
  }

  async getJobAppliedByCompany(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const manager = getManager();
    const jobApplied = await manager.query(
      `SELECT * FROM ${this.job_applied} WHERE "userId"='${userId}'`,
    );

    const jobIds = jobApplied.map(job => job.jobId);
    const jobByIds = await this.repository.findByIds(jobIds, {
      relations: ['user', 'user.profile', 'categories'],
    });
    return jobByIds.map(job => {
      delete job.user.password;
      delete job.user.ExpiredToken;
      delete job.user.ExpiredToken;
      return job;
    });
  }

  async getListUserAppliedJob(contributorId: string) {
    const contributor = await this.userRepository.findOne({
      where: { id: contributorId },
    });
    if (!contributor) {
      throw new NotFoundException('User not found');
    }

    const allCompanyJob = await this.repository.find({
      where: { user: contributor },
      relations: ['appliedBy', 'appliedBy.user', 'appliedBy.user.profile'],
    });
    return allCompanyJob.map(job => {
      if (job.appliedBy.length > 0) {
        const newJob = job.appliedBy.map(user => {
          delete user['jobId'];
          delete user['userId'];
          delete user['index_name'];
          // delete user['status'];
          delete user['user'].password;
          delete user['user'].role;
          delete user['user'].ExpiredToken;
          return user;
        });
        return { ...job };
      }
      return job;
    });
  }

  async acceptJob(userId: string, jobId: string, contriButeId: string) {
    const user = await this.userRepository.findOne({
      where: { id: contriButeId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const manager = getManager();

    try {
      const jobApplied = await manager.query(
        `SELECT * FROM ${this.job_applied} WHERE "userId"='${userId}' AND "jobId"='${jobId}'`,
      );
      if (jobApplied.length > 0) {
        await manager.query(
          `UPDATE ${this.job_applied} set "status"= true WHERE "userId"='${userId}' AND "jobId"='${jobId}'`,
        );
        return {
          status: true,
        };
      }
    } catch (err) {
      throw new NotFoundException(' not found');
    }
  }

  async getOneJobAppliedUser(id: string) {
    try {
      const findJob = await this.repository.findOne({ id: id });

      if (!findJob) {
        return new NotFoundException('Job not found');
      }

      const manager = getManager();
      const appliedJob = await manager.query(
        `SELECT * FROM applied_job WHERE "jobId"='${id}'`,
      );

      const userIds = appliedJob.map(user => user.userId);
      const users = await this.userRepository.findByIds(userIds, {
        relations: ['profile', 'applied'],
      });
      // console.log('user', users);
      return users.map(user => {
        delete user.password;
        delete user.ExpiredToken;
        delete user.ExpiredToken;

        return {
          ...user,
          applied: user.applied.filter(appliedJob => {
            delete appliedJob['userId'];
            delete appliedJob['createdat'];
            delete appliedJob['updatedat'];
            delete appliedJob['index_name'];
            delete appliedJob['deletedat'];

            return appliedJob['jobId'] == id;
          }),
        };
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          message: 'Internal Server Error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getAllFavoriteJob() {
    const manager = getManager();
    return await manager.query(
      `SELECT distinct("jobId") FROM ${this.tableName}`,
    );
  }

  async updateRecently(userId: string, jobId: string) {
    const manager = getManager();
    const findRecently = await manager.query(
      `SELECT * FROM job_recently where "userId" = '${userId}' and "jobId" = '${jobId}'`,
    );

    if (findRecently.length == 0) {
      await manager.query(
        `INSERT INTO job_recently VALUES ('${jobId}', '${userId}')`,
      );
    }
    // const recentlyJobByUser = await manager.query(
    //   `SELECT * FROM job_recently where "userId" = '${userId}'`,
    // );
    // if (recentlyJobByUser.length > 10) {
    //   await manager.query(
    //     `DELETE FROM job_recently where userId = '${recentlyJobByUser[0].userId}' and jobId = '${recentlyJobByUser[0].jobId}'`,
    //   );
    // }
  }

  async getAllAcceptedUser(id: string) {
    try {
      const contributor = this.userRepository.findOne({ id: id });
      const allCompanyJob = await this.repository.find({
        where: { user: contributor },
        relations: ['appliedBy', 'appliedBy.user', 'appliedBy.user.profile'],
      });
      // return allCompanyJob.map(job => {
      //   return job.appliedBy.filter(applied => {
      //     return applied.status == true;
      //   })
      //   return job;
      // });
    } catch (err) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getAcceptedUserByJobId(id: string) {
    try {
      const manager = getManager();
      const acceptedUser = await manager.query(
        `SELECT "userId" FROM applied_job WHERE "jobId" = '${id}' and "status" = true`,
      );
      const userIds = acceptedUser.map(user => {
        return user.userId;
      });
      return await this.userRepository.findByIds(userIds, {
        relations: [
          'profile',
          'profile.profileSkill',
          'profile.educationProfile',
        ],
      });
    } catch (err) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
