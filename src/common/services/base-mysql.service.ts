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

  async getOne(parsed: Partial<ParsedRequestParams>): Promise<T> {
    const where = this.convertFilter(parsed.filter) || {};
    const findOptions = this.createFindOneOptions(parsed);
    const entity = await this.repository.findOne({ where, ...findOptions });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
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

  async createOne(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
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

  //   async updateMany(
  //     parsed: Partial<ParsedRequestParams>,
  //     dto: DeepPartial<T>,
  //   ): Promise<{ affected: number }> {
  //     const where = this.convertFilter(parsed.filter) || {};
  //     const result = await this.repository.update(where, dto);
  //     return { affected: result.affected || 0 };
  //   }

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

  protected convertFilter(filter: QueryFilter[] = []): Record<string, any> {
    return filter.reduce(
      (acc, { field, operator, value }) => {
        acc[field] = this.convertOperator(operator, value);
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  protected createPopulate(join: QueryJoin[] = []): string[] {
    return join.map((j) => j.field);
  }

  private convertOperator(operator: string, value: any): any {
    switch (operator) {
      case 'eq':
      case '$eq':
        return value;
      case 'ne':
      case '$ne':
        return { $ne: value };
      case 'gt':
      case '$gt':
        return { $gt: value };
      case 'lt':
      case '$lt':
        return { $lt: value };
      case 'gte':
      case '$gte':
        return { $gte: value };
      case 'lte':
      case '$lte':
        return { $lte: value };
      case 'in':
      case '$in':
        return { $in: value };
      case 'nin':
      case '$nin':
        return { $nin: value };
      case 'like':
      case '$like':
        return { $like: `%${value}%` };
      case 'ilike':
      case '$ilike':
        return { $ilike: `%${value}%` };
      case 'isnull':
      case '$isnull':
        return null;
      case 'isnotnull':
      case '$isnotnull':
        return { $ne: null };
      default:
        throw new BadRequestException('Invalid operator');
    }
  }
}
