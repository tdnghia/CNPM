import {
  CrudController,
  CrudService,
  CrudRequest,
  CreateManyDto,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import { BaseRepository } from './base.repository';
import {
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
export class BaseController<T> implements CrudController<T> {
  service: import('@nestjsx/crud').CrudService<T>;
  constructor(private readonly baseRepository: BaseRepository<T>) {}
  get base(): CrudController<T> {
    return this;
  }
}
