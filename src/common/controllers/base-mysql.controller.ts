import { DeleteResult, Repository } from 'typeorm';
import { BaseMySqlEntity } from '../entities/base-mysql.entity';
import { CrudRequest } from '@nestjsx/crud';

export abstract class BaseMySqlController<E extends BaseMySqlEntity, DTO = E> {
  constructor(protected readonly repo: Repository<E>) {}
  abstract getOne(req: CrudRequest, id: string, ...rest: any[]): Promise<E>;
  abstract getMany(req: CrudRequest, ...rest: any[]): Promise<E[]>;
  abstract createOne(dto: DTO, ...rest: any[]): Promise<E>;

  abstract createMany(dto: DTO[], ...rest: any[]): Promise<E[]>;

  abstract updateOne(id: string, dto: DTO, ...rest: any[]): Promise<E>;

  abstract softDeleteOne(id: string, ...rest: any[]): Promise<DeleteResult>;

  abstract hardDeleteOne(id: string, ...rest: any[]): Promise<DeleteResult>;
}
