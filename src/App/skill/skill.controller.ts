import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Skill } from 'src/entity/skill.entity';
import { SkillRepository } from './skill.repository';
import { SkillService } from './skill.service';

@ApiTags('api/v1/skill')
@Controller('/api/v1/skill')
@Modules(ModuleEnum.SKILL)
export class SkillController {
    constructor(
        public service: SkillService,
        private readonly repository: SkillRepository,
    ) {}
    @Get('/test')
    async test() {
        console.log('teststs');
        return 'test';
    }
    
    @Post()
    async createOne(@Body() dto: Skill) {
        try {
            const findSkill = await this.repository.findOne({ where: {name: dto.name}});
            if (findSkill) {
                return new BadRequestException('Skill already exists');
            }
            const skill = this.repository.create({ ...dto });
            return await this.repository.save(skill);
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

    @Delete(':id')
    @Methods(methodEnum.DELETE)
    async deleteOne(@Param('id') id: string) {
        try {
            const findSkill = await this.repository.findOne({ where: { id: id }});
            console.log('i',findSkill);
            if (!findSkill) {
                return new BadRequestException('Skill doesn not exists');
            }

            return await this.repository.delete({id: findSkill.id});
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

    @Put(':id')
    @Methods(methodEnum.UPDATE)
    async updateOne(@Param('id') id: string, @Body() dto: Skill) {
        try {
            const findSkill = await this.repository.findOne({ where: { id: id }});
            if (!findSkill) {
                return new BadRequestException('Skill doesn not exists');
            }

            return await this.repository.update({ id: findSkill.id }, dto);
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
