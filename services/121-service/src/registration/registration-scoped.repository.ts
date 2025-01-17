import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  DataSource,
  DeleteResult,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  InsertResult,
  ObjectId,
  RemoveOptions,
  Repository,
  SaveOptions,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ScopedQueryBuilder } from '../scoped.repository';
import { RequestWithScope } from '../shared/middleware/scope.middleware';
import { convertToScopedOptions } from '../utils/scope/createFindWhereOptions.helper';
import { RegistrationViewEntity } from './registration-view.entity';
import { RegistrationEntity } from './registration.entity';

export class RegistrationScopedBaseRepository<T> {
  public readonly repository: Repository<T>;
  public request: RequestWithScope;

  constructor(target: EntityTarget<T>, dataSource: DataSource) {
    this.repository = dataSource.createEntityManager().getRepository(target);
  }

  public async find(options: FindManyOptions<T>): Promise<T[]> {
    if (!this.request?.scope || this.request.scope === '') {
      return this.repository.find(options);
    }
    const scopedOptions = convertToScopedOptions<T>(
      options,
      [],
      this.request.scope,
    );
    return this.repository.find(scopedOptions);
  }

  public async findOne(options: FindOneOptions<T>): Promise<T> {
    if (!this.request?.scope || this.request.scope === '') {
      return this.repository.findOne(options);
    }
    const scopedOptions = convertToScopedOptions<T>(
      options,
      [],
      this.request.scope,
    );
    return this.repository.findOne(scopedOptions);
  }

  public createQueryBuilder(alias: string): ScopedQueryBuilder<T> {
    if (!this.request?.scope || this.request.scope === '') {
      return new ScopedQueryBuilder(this.repository.createQueryBuilder(alias));
    }
    const qb = this.repository
      .createQueryBuilder(alias)
      .leftJoin(`${alias}.program`, 'program')
      .andWhere(
        `(program."enableScope" = false OR ${alias}.scope LIKE :scope)`,
        {
          scope: `${this.request.scope}%`,
        },
      );
    return new ScopedQueryBuilder(qb);
  }
}

@Injectable({ scope: Scope.REQUEST, durable: true })
export class RegistrationScopedRepository extends RegistrationScopedBaseRepository<RegistrationEntity> {
  constructor(
    dataSource: DataSource,
    // TODO check if this can be set on ScopedRepository so it can be reused
    @Inject(REQUEST) public request: Request,
  ) {
    super(RegistrationEntity, dataSource);
  }

  ///////////////////////////////////////////////////////////////
  // COPIED IMPLEMENTATION OF REPOSITORY METHODS ////////////////
  //////////////////////////////////////////////////////////////
  public async save(
    entity: RegistrationEntity,
    options: SaveOptions & { reload: false },
  ): Promise<RegistrationEntity>;
  public async save(
    entity: RegistrationEntity,
    options?: SaveOptions,
  ): Promise<RegistrationEntity>;
  public async save(
    entities: RegistrationEntity[],
    options: SaveOptions & { reload: false },
  ): Promise<RegistrationEntity[]>;
  public async save(
    entities: RegistrationEntity[],
    options?: SaveOptions,
  ): Promise<RegistrationEntity[]>;
  public async save(
    entityOrEntities: RegistrationEntity | RegistrationEntity[],
    options?: SaveOptions,
  ): Promise<RegistrationEntity | RegistrationEntity[]> {
    return this.repository.save(entityOrEntities as any, options);
  }

  public async insert(
    entityOrEntities:
      | QueryDeepPartialEntity<RegistrationEntity>
      | QueryDeepPartialEntity<RegistrationEntity>[],
  ): Promise<InsertResult> {
    return this.repository.insert(entityOrEntities as any);
  }

  public async remove(
    entity: RegistrationEntity,
    options?: RemoveOptions,
  ): Promise<RegistrationEntity>;
  public async remove(
    entities: RegistrationEntity[],
    options?: RemoveOptions,
  ): Promise<RegistrationEntity[]>;
  public async remove(
    entityOrEntities: RegistrationEntity | RegistrationEntity[],
    options?: RemoveOptions,
  ): Promise<RegistrationEntity | RegistrationEntity[]> {
    return this.repository.remove(entityOrEntities as any, options);
  }

  public async deleteUnscoped(
    criteria:
      | FindOptionsWhere<RegistrationEntity>
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[],
  ): Promise<DeleteResult> {
    // TODO: This is not scoped yet, for now is doesn't matter as
    // we don't use update anywhere yet in a way where it should be scoped
    // This is as risk though that someone uses this expecting it to be scoped
    return this.repository.delete(criteria);
  }

  public async updateUnscoped(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<RegistrationEntity>,
    partialEntity: QueryDeepPartialEntity<RegistrationEntity>,
  ): Promise<UpdateResult> {
    // TODO: This is not scoped yet, for now is doesn't matter as
    // we don't use update anywhere yet in a way where it should be scoped
    // This is as risk though that someone uses this expecting it to be scoped
    return this.repository.update(criteria, partialEntity);
  }
}

@Injectable({ scope: Scope.REQUEST, durable: true })
export class RegistrationViewScopedRepository extends RegistrationScopedBaseRepository<RegistrationViewEntity> {
  constructor(
    dataSource: DataSource,
    // TODO check if this can be set on ScopedRepository so it can be reused
    @Inject(REQUEST) public request: Request,
  ) {
    super(RegistrationViewEntity, dataSource);
  }
}
