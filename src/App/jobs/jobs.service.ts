import {
  BadRequestException,
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
import { CategoryRepository } from '../categories/categories.repository';
import axios from 'axios';
import { AddressRepository } from '../address/address.repository';
import * as nodemailer from 'nodemailer';

@Injectable()
export class JobService extends TypeOrmCrudService<Job> {
  private tableName = 'job_favorite ';
  constructor(
    @InjectRepository(Job) repo,
    private readonly repository: JobRepository,
    private readonly userRepository: UserRepository,
    private readonly cateRepository: CategoryRepository,
    private readonly addressRepository: AddressRepository,
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
    return jobByIds;
  }

  async appliesJob(jobId: string, userId: string) {
    this.tableName = 'job_applied';
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
        `SELECT * FROM ${this.tableName} WHERE "jobId"='${jobId}' and "userId"='${userId}'`,
      );

      if (jobApplied.length == 0) {
        await manager.query(
          `INSERT INTO ${this.tableName} values('${jobId}','${userId}')`,
        );
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'tdnghia1011@gmail.com', // generated ethereal user
            pass: 'shidoo1011', // generated ethereal password
          },
        });

        // send mail with defined transport object
        const mailOptions = {
          from: '"Fred Foo 👻" <tdnghia1011@gmail.com>', // sender address
          to: user.email, // list of receivers
          subject: 'Thank you for joining the App CareerNetwork!', // Subject line
          text: 'I am so glad you registered for the CareerNetwork', // plain text body
          html: `<b>Here's your password for login as employee</b><p>Make sure you don't share this email public</p><b>password: </b><p>Our best</p><b>Twist Team</b>`, // html body
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
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
      console.log('add', createAddr);
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
      where: {id : userId},
      relations: ['applied']
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.applied;
  }

  async getListUserAppliedJob(contributorId: string) {
    const contributor = await this.userRepository.findOne({
      where: {id : contributorId},
    });
    if (!contributor) {
      throw new NotFoundException('User not found');
    }
    const allCompanyJob = await this.repo.find({
      join: { alias: 'job', innerJoin: { user: 'job.user' } },
      where: qb => {
        qb.where('user.id = :id', { id: contributorId });
      },
      relations: ['appliedBy']
    });
    
    return allCompanyJob;
  }

  async getAllFavoriteJob() {
    const manager = getManager();
    return await manager.query(
      `SELECT distinct("jobId") FROM ${this.tableName}`,
    );
  }
}
