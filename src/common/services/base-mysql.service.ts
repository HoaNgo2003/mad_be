import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Between,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Equal,
  Not,
  In,
  IsNull,
  Like,
  ILike,
} from 'typeorm';
import {
  ParsedRequestParams,
  QueryFilter,
  QueryJoin,
  QuerySort,
} from '@dataui/crud-request';
import { GetManyDefaultResponse } from '@dataui/crud';

import { BaseMySqlEntity } from '../entities/base-mysql.entity';
import { pageQuery } from '../paging/paging.helper';

@Injectable()
export class BaseMySqlService<T extends BaseMySqlEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async getOne(parsed: Partial<ParsedRequestParams>): Promise<T | null> {
    const where = this.convertFilter(parsed.filter) || {};
    const findOptions = this.createFindOneOptions(parsed);
    const entity = await this.repository.findOne({ where, ...findOptions });

    if (!entity) {
      return null;
    }

    return entity;
  }

  async getMany(
    parsed: Partial<ParsedRequestParams>,
  ): Promise<T[] | GetManyDefaultResponse<T>> {
    const where = this.convertFilter(parsed.filter) || {};
    const { take, skip } = pageQuery({
      page: parsed.page,
      limit: parsed.limit,
    });

    const options: FindManyOptions<T> = {
      where,
      take,
      skip,
      order: this.convertSort(parsed.sort),
      relations: this.createPopulate(parsed.join),
    };

    const [entities, total] = await this.repository.findAndCount(options);

    if (parsed.limit) {
      return {
        data: entities,
        count: entities.length,
        total,
        page: parsed.page || 1,
        pageCount: Math.ceil(total / parsed.limit),
      };
    }
    return entities;
  }
  async createOne<DTO extends DeepPartial<T>>(dto: DTO): Promise<T> {
    try {
      const entity = this.repository.create(dto);
      const result: T = await this.repository.save(entity);
      if (!result) {
        throw new BadRequestException('Tạo bản ghi không thành công');
      }
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async createMany(dto: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(dto);
    return this.repository.save(entities);
  }

  async updateOne(
    parsed: Partial<ParsedRequestParams>,
    dto: DeepPartial<T>,
  ): Promise<T> {
    const where = this.convertFilter(parsed.filter) || {};
    const entity = await this.repository.findOne({ where });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async softDeleteOne(parsed: Partial<ParsedRequestParams>): Promise<boolean> {
    const where = this.convertFilter(parsed.filter) || {};
    const entity = await this.repository.findOne({ where });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    entity.deletedAt = new Date();
    await this.repository.save(entity);
    return true;
  }

  async hardDeleteOne(parsed: Partial<ParsedRequestParams>): Promise<boolean> {
    const where = this.convertFilter(parsed.filter) || {};
    const entity = await this.repository.findOne({ where });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    await this.repository.remove(entity);
    return true;
  }

  async deleteMany(
    parsed: Partial<ParsedRequestParams>,
  ): Promise<{ affected: number }> {
    const where = this.convertFilter(parsed.filter) || {};
    const result = await this.repository.delete(where);
    return { affected: result.affected || 0 };
  }

  async recoverOne(parsed: Partial<ParsedRequestParams>): Promise<T> {
    const where = this.convertFilter(parsed.filter) || {};
    const entity = await this.repository.findOne({ where });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    entity.deletedAt = null;
    return this.repository.save(entity);
  }

  protected createFindOptions(
    parsed: Partial<ParsedRequestParams>,
  ): FindManyOptions<T> {
    return {
      relations: this.createPopulate(parsed.join),
      order: this.convertSort(parsed.sort),
      take: parsed.limit,
      skip: parsed.page ? (parsed.page - 1) * parsed.limit : 0,
    };
  }

  protected createFindOneOptions(
    parsed: Partial<ParsedRequestParams>,
  ): FindOneOptions<T> {
    return {
      relations: this.createPopulate(parsed.join),
      order: this.convertSort(parsed.sort),
    };
  }

  protected convertSort(sort: QuerySort[] = []): FindOptionsOrder<T> {
    return sort.reduce((acc, { field, order }) => {
      acc[field] = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      return acc;
    }, {} as FindOptionsOrder<T>);
  }

  protected convertFilter(filter: QueryFilter[] = []): FindOptionsWhere<T> {
    const where = {} as FindOptionsWhere<T>;

    filter.forEach(({ field, operator, value }) => {
      where[field] = this.convertOperator(operator, value);
    });

    return where;
  }

  protected createPopulate(join: QueryJoin[] = []): string[] {
    return join.map((j) => j.field);
  }

  private convertOperator(operator: string, value: any): any {
    switch (operator) {
      case 'eq':
      case '$eq':
        return Equal(value);
      case 'ne':
      case '$ne':
        return Not(Equal(value));
      case 'gt':
      case '$gt':
        return MoreThan(value);
      case 'lt':
      case '$lt':
        return LessThan(value);
      case 'gte':
      case '$gte':
        return MoreThanOrEqual(value);
      case 'lte':
      case '$lte':
        return LessThanOrEqual(value);
      case 'in':
      case '$in':
        return In(value);
      case 'nin':
      case '$nin':
        return Not(In(value));
      case 'like':
      case '$like':
      case 'cont':
      case '$cont':
        return Like(`%${value}%`);
      case 'ilike':
      case '$ilike':
        return ILike(`%${value}%`);
      case 'isnull':
      case '$isnull':
        return IsNull();
      case 'isnotnull':
      case '$isnotnull':
        return Not(IsNull());
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return Between(value[0], value[1]);
        }
        throw new BadRequestException(
          'Between operator requires an array with two values',
        );
      default:
        return value; // Default to exact match
    }
  }
}
