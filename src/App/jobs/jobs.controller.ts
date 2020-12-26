import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { BaseController } from 'src/common/Base/base.controller';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Job } from 'src/entity/job.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { getManager, IsNull, Not, Repository } from 'typeorm';
import { JobRepository } from './jobs.repository';
import { JobService } from './jobs.service';
import * as _ from 'lodash';
import { JobDTO } from './job.dto';
import * as nodemailer from 'nodemailer';
import { User } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoDTO } from './geo.dto';
import { getDistance } from 'geolib';

@Crud({
  model: {
    type: Job,
  },
  params: {
    id: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
  query: {
    filter: [],
    join: {
      user: {
        eager: true,
        exclude: [
          'password',
          'active',
          'roleId',
          'createdat',
          'updatedat',
          'deletedat',
        ],
      },
      'user.profile': {
        eager: true,
        exclude: [
          'cvURL',
          'quantity',
          'experience',
          'createdat',
          'updatedat',
          'deletedat',
        ],
      },
      categories: {
        eager: true,
        exclude: ['createdat', 'updatedat', 'deletedat', 'parentId'],
      },
      address: {
        eager: true,
        exclude: ['createdat', 'updatedat', 'deletedat'],
      },
    },
  },
})
@ApiTags('v1/jobs')
@Controller('/api/v1/jobs')
@Modules(ModuleEnum.JOB)
@SetMetadata('entity', ['jobs'])
export class JobsController extends BaseController<Job> {
  constructor(
    public service: JobService,
    private readonly repository: JobRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(repository);
  }

  @Override('createOneBase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Methods(methodEnum.CREATE)
  @UsePipes(new ValidationPipe())
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job, @UserSession() user) {
    const currentUser = await this.userRepository.findOne({ id: user.users.id });
    dto.user = currentUser;
    return this.service.createJob(dto);
  }

  @Override('getManyBase')
  async getMany(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    try {
      const favorite = await this.service.getAllFavoriteJob();
      // const allJob = await this.base.getManyBase(req);
      // for (let i = 0; i < count(allJob); i++)
      const response: any = await this.base.getManyBase(req);

      let isFavorite: Array<any>;

      if (response.count) {
        isFavorite = response.data.map(job => {
          console.log('job', job);

          if (_.find(favorite, { jobId: job.id })) {
            job.isFavorite = true;
          } else {
            job.isFavorite = false;
          }
          return job;
        });
        return { ...response, data: isFavorite };
      } else {
        isFavorite = response.map(job => {
          console.log(_.find(favorite, { jobId: job.id }));
          if (_.find(favorite, { jobId: job.id })) {
            job.isFavorite = true;
          } else {
            job.isFavorite = false;
          }
          return job;
        });
      }
      return isFavorite;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Get('all')
  async getAll() {
    const allJob: any = await this.repository.find();
    const currentDate = new Date().toLocaleDateString();
    const checkJobDeadline = allJob.filter(job => {
      const parts = job.deadline.split('-');
      const jobDeadline = new Date(
        `${parts[1]}/${parts[2]}/${parts[0]}`,
      ).toLocaleDateString();
      return jobDeadline >= currentDate;
    });
    const favorite = await this.service.getAllFavoriteJob();
    const isFavorite = checkJobDeadline.map(job => {
      console.log(_.find(favorite, { jobId: job.id }));
      if (_.find(favorite, { jobId: job.id })) {
        job.isFavorite = true;
      } else {
        job.isFavorite = false;
      }

      return job;
    });
    return isFavorite;
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFavoritesByUser(@UserSession() user: any) {
    const userId = user.users.id;
    return this.service.getFavoritesByUser(userId);
  }

  @Put('active/:id')
  @Methods(methodEnum.UPDATE)
  async activeJob(@Param('id') id: string) {
    try {
      const findJob = await this.repository.findOne({ id: id });
      if (!findJob) {
        return new HttpException(
          {
            message: 'Job not found',
            error: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.repository.update({ id: id }, { status: true });
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server Error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('inactive/all')
  async getInactiveJob(@Request() req) {
    const limit = req.query.hasOwnProperty('limit') ? req.query.limit : 10;
    const page = req.query.hasOwnProperty('page') ? req.query.page : 1;
    const sort = req.query.hasOwnProperty('sort') ? req.query.sort : null;

    try {
      return this.repository.paginate(
        {
          limit,
          page,
          sort,
        },
        { relations: ['user'] },
        { condition: { status: false, deletedat: IsNull() } },
      );
    } catch (err) {
      console.log('err', err);
    }
  }

  @Put('accept/:id')
  @Methods(methodEnum.UPDATE)
  @UsePipes(new ValidationPipe())
  async acceptJob(
    @Body() jobDTO: JobDTO,
    @Param('id') id: string,
    @UserSession() user: any,
  ) {
    try {
      // console.log('jere');
      // return;
      const job = await this.repository.findOne({ id: id });
      const acceptedUser = await this.userRepository.findOne({
        id: jobDTO.userId,
      });
      // return acceptedUser;
      await this.service.acceptJob(jobDTO.userId, id, user.users.id);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tdnghia1011@gmail.com', // generated ethereal user
          pass: 'btaaxlnkyzgdroma', // generated ethereal password
        },
      });

      // send mail with defined transport object
      const mailOptions = {
        from: '"Career Network" <tdnghia1011@gmail.com>', // sender address
        to: acceptedUser.email, // list of receivers
        subject: 'Your CV has been reviewed and accepted by the recruitment', // Subject line
        text: `Congratulation, your CV has been accepted by the recruitment for ${job.name}. Contact them to get more details!`, // plain text body
        // html: `<a>Here's your password for login as employee</b><p>Make sure you don't share this email public</p><b>password: ${generatePassword}</b><p>Our best</p><b>Twist Team</b>`, // html body
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (err) {
      return {
        status: false,
      };
    }
  }

  @Get('softdelete/all')
  @Methods(methodEnum.READ)
  async getSoftDeleteList(@Request() req) {
    const limit = req.query.hasOwnProperty('limit') ? req.query.limit : 10;
    const page = req.query.hasOwnProperty('page') ? req.query.page : 1;
    const sort = req.query.hasOwnProperty('sort') ? req.query.sort : null;
    console.log('limit', limit);
    return await this.repository.paginate(
      {
        limit,
        page,
        sort,
      },
      { relations: ['user'] },
      { condition: { deletedat: Not(IsNull()) } },
    );
  }

  @Get('applied')
  @Methods(methodEnum.READ)
  async getAppliedJobByCompany(@UserSession() user: any) {
    try {
      const userId = user.users.id;
      if (user.users.role === 'CONTRIBUTOR') {
        return this.service.getListUserAppliedJob(userId);
      } else if (user.users.role === 'USER') {
        return this.service.getJobAppliedByCompany(userId);
      } else {
        throw new HttpException(
          {
            message: 'Internal Server Error',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server Error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('applied/:id')
  @Methods(methodEnum.READ)
  async getOneJobAppliedUser(@Param('id') id: string) {
    return this.service.getOneJobAppliedUser(id);
  }

  @Get('nearest/all')
  async getJobNearest(@Body() geoDTO: GeoDTO) {
    // console.log('geo', geoDTO);
    const jobs = await this.repository.find({
      relations: ['address'],
    });
    return jobs.filter(job => {
      const distance = getDistance(
        { latitude: job.address.latitude, longitude: job.address.longitude },
        { latitude: geoDTO.lat, longitude: geoDTO.long },
      );
      if (distance < geoDTO.distance * 1000) return job;
    });
  }

  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest) {
    try {
      const data = await this.base.getOneBase(req);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Job not found',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('getOne/recently/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOneRecently(@Param('id') id: string, @UserSession() user) {
    try {
      const manager = getManager();
      if (user.users) {
        await this.service.updateRecently(user.users.id, id);
      }
      const job = await this.repository.findOne({
        where: { id },
        relations: ['user', 'user.profile', 'categories', 'address'],
      });

      delete job.user.password;
      const jobApplied = await manager.query(
        `SELECT * FROM applied_job WHERE "userId"='${user.users.id}' and "jobId" = '${id}'`,
      );

      if (jobApplied.length > 0) {
        return { ...job, applied: true };
      }
      return { ...job, applied: false };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Job not found',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('updateOne/:id')
  async updateUser(@Body() dto: Partial<Job>, @Param('id') id: string) {
    try {
      const result = await this.repository.findOne({ id: id });
      if (!result) {
        throw new HttpException(
          {
            message: 'Not Found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.repository.update({ id }, dto);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server Error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Override('deleteOneBase')
  async softDelete(@ParsedRequest() req: CrudRequest): Promise<void> {
    const id = req.parsed.paramsFilter.find(
      f => f.field === 'id' && f.operator === '$eq',
    ).value;
    const data = this.repository.findOne({ where: { id } });
    if (!data) {
      throw new HttpException(
        {
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      await this.repository.softDelete({ id });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
  }

  @Delete('/delete/:id')
  async forceDelete(
    @ParsedRequest() req: CrudRequest,
    @Param('id') id: string,
  ): Promise<void> {
    console.log(id);
    const data = this.repository.findOne({
      where: { id, deletedat: IsNull() },
    });
    if (!data) {
      throw new HttpException(
        {
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      await this.repository.delete({ id, deletedat: IsNull() });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
  }
  @Override('updateOneBase')
  async restore(@ParsedRequest() req: CrudRequest): Promise<void> {
    const id = req.parsed.paramsFilter.find(
      f => f.field === 'id' && f.operator === '$eq',
    ).value;

    const data = await this.repository.findOne({
      withDeleted: true,
      where: { id, deletedat: Not(IsNull()) },
    });
    if (!data) {
      throw new HttpException(
        {
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.repository.restore({ id });
  }

  @Post('/:id/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async favoritesJob(@Param('id') id: string, @UserSession() user) {
    const userId = user.users.id;
    return this.service.addFavoritesJob(id, userId);
  }

  @Post('/:id/applies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async appliesJOb(@Param('id') id: string, @UserSession() user) {
    const userId = user.users.id;
    return this.service.appliesJob(id, userId);
  }
  
  @Get('accept/all/user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllAcceptedUser(@UserSession() user) {
    return this.service.getAllAcceptedUser(user.users.id);
  }

  @Get('accept/:id/user')
  async getAllgetAcceptedUserByJobIdAcceptJob(@Param('id') id: string) {
    return this.service.getAcceptedUserByJobId(id);
  }
}
