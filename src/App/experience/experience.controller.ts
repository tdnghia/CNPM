import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Experience } from 'src/entity/experience.entity';
import { Profile } from 'src/entity/profile.entity';
import { Repository } from 'typeorm';
import { ExperienceService } from './experience.service';

@ApiTags('api/v1/experience')
@Controller('/api/v1/experience')
@Modules(ModuleEnum.EXPERIENCE)
export class ExperienceController {
    constructor(
        public service: ExperienceService,
        @InjectRepository(Experience)
        private readonly repository: Repository<Experience>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>
    ) {}

    @Get()
    @Methods(methodEnum.READ)
    async getAll() {
        return await this.repository.find();
    }

    @Post()
    @Methods(methodEnum.CREATE)
    async createMany(@Body() dto: Experience[], @UserSession() userSession)
    {
        try {
            const findProfile = await this.profileRepository.findOne({
                join: { alias: 'profile', innerJoin: { user: 'profile.user' } },
                where: qb => {
                  qb.where('user.id = :id', { id: userSession.users.id });
                }
            });
            
            if (!findProfile) {
            return new NotFoundException('Profile was not Found');
            }
            
            // delete old record
            const findByProfileId = await this.repository.delete({ profileId: findProfile.id });
            
            // Create Experience
            for (let i = 0; i < dto.length; i++) {
                const createExperience = await this.repository.create({
                  company: dto[i].company,
                  position: dto[i].position,
                  description: dto[i].description,
                  start: dto[i].start,
                  end: dto[i].end,
                  profileId: findProfile.id,
                });
                await this.repository.save(createExperience);
            }
        } catch (error) {
            console.log(error);
            throw new HttpException(
                {
                message: 'Internal Server error',
                status: HttpStatus.BAD_REQUEST,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
