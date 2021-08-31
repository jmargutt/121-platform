import { ImageCodeEntity } from './../notifications/imagecode/image-code.entity';
import { IntersolveRequestEntity } from './../fsp/intersolve-request.entity';
import { IntersolveInstructionsEntity } from './../fsp/intersolve-instructions.entity';
import { TwilioMessageEntity } from './../notifications/twilio.entity';
import { ActionEntity } from './../actions/action.entity';
import { ProgramQuestionEntity } from './../programs/program-question.entity';
import { ProgramEntity } from './../programs/program.entity';
import { InstanceEntity } from './../instance/instance.entity';
import { FinancialServiceProviderEntity } from './../fsp/financial-service-provider.entity';
import { Injectable } from '@nestjs/common';
import {
  Connection,
  createConnection,
  createConnections,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { ProgramAidworkerAssignmentEntity } from '../programs/program-aidworker.entity';
import { UserRole } from '../user-role.enum';
import { UserRoleEntity } from '../user/user-role.entity';
import { UserType } from '../user/user-type-enum';
import { UserEntity } from '../user/user.entity';
import { InterfaceScript } from './scripts.module';
import { FspAttributeEntity } from '../fsp/fsp-attribute.entity';
import { FspCallLogEntity } from '../fsp/fsp-call-log.entity';

// docker exec -it 121-service npx ts-node src/scripts migrate-registrations-refactor

@Injectable()
export class MigrateRefactor implements InterfaceScript {
  public constructor(private connection: Connection) {}
  private oldConnection;
  private programId = 1;

  public async run(): Promise<void> {
    // await this.connection.query(`
    //   SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity
    //   WHERE pg_stat_activity.datname = 'global121' AND pid <> pg_backend_pid();
    //   `);
    // await this.connection.query(`
    //   CREATE DATABASE "global121-backup" WITH TEMPLATE global121 OWNER ${process.env.ORMCONFIG_121_SERVICE_USERNAME};
    // `);

    await this.connection.dropDatabase();
    await this.connection.synchronize(true);
    this.oldConnection = await createConnection({
      name: 'oldConnection',
      type: 'postgres',
      host: '121db',
      port: 5432,
      username: process.env.ORMCONFIG_121_SERVICE_USERNAME,
      password: process.env.ORMCONFIG_121_SERVICE_PASSWORD,
      database: 'global121-old',
      schema: '121-service',
    });
    await this.migrateUsers();
    await this.migrateFsp();
    await this.migrateInstance();
    await this.migrateProgram();
    await this.migrateActions();
    await this.migrateTwilioMessages();
    await this.migrateIntersolveInstruction();
    await this.migrateIntersolveRequests();
    await this.migrateImageCode();
    await this.migrateFspCallLog();
  }

  public async migrateUsers(): Promise<void> {
    const userRoleRepository = this.connection.getRepository(UserRoleEntity);
    await userRoleRepository.save([
      {
        role: UserRole.Admin,
        label: 'Admin',
      },
      {
        role: UserRole.View,
        label: 'Only view data, including Personally Identifiable Information',
      },
      {
        role: UserRole.PersonalData,
        label: 'Handle Personally Identifiable Information',
      },
      {
        role: UserRole.RunProgram,
        label: 'Run Program',
      },
      {
        role: UserRole.FieldValidation,
        label: 'Do Field Validation',
      },
    ]);

    const oldUsers = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."user" u
      LEFT JOIN "121-service".user_roles_user_role ur_ur ON
        u.id = ur_ur."userId"
      LEFT JOIN "121-service".user_role ur ON
        ur_ur."userRoleId" = ur.id
    `);

    const userRepository = this.connection.getRepository(UserEntity);
    await this.disableAutoIncrementId(userRepository);
    for (const oldUser of oldUsers) {
      let newUser = await userRepository.findOne(oldUser.id);
      if (!newUser) {
        console.log('oldUser: ', oldUser);
        newUser = new UserEntity();
        newUser.id = oldUser.userId;
        newUser.username = oldUser.email;
        newUser.password = 'temporary password';
        newUser.userType = UserType.aidWorker;
        await userRepository.save(newUser);
      }
      // This is needed to ensure that the old password is not double hashed
      await this.connection
        .createQueryBuilder()
        .update(UserEntity)
        .set({ password: oldUser.password })
        .where('id = :id', { id: oldUser.userId })
        .execute();

      const assignmentRepository = this.connection.getRepository(
        ProgramAidworkerAssignmentEntity,
      );
      const userRoleRepository = this.connection.getRepository(UserRoleEntity);
      newUser.id;
      console.log('newUser.id: ', newUser.id);
      const roles = await userRoleRepository.find({
        where: {
          role: oldUser.role,
        },
      });
      console.log('roles: ', roles);
      await assignmentRepository.save({
        user: { id: newUser.id },
        program: { id: this.programId },
        roles: roles,
      });
    }
    await this.enableAutoIncrementId(userRepository);
  }

  private async migrateFsp(): Promise<void> {
    console.log('migrateFsp: ');
    const fspRepository = this.connection.getRepository(
      FinancialServiceProviderEntity,
    );
    const fspAttrRepository = this.connection.getRepository(FspAttributeEntity);
    await this.disableAutoIncrementId(fspRepository);
    await this.disableAutoIncrementId(fspAttrRepository);

    const oldFsps = await this.oldConnection
      .query(`SELECT *, fa.id as attrid , f.id as fspid FROM "121-service".fsp f
    LEFT JOIN "121-service".fsp_attribute fa
    ON	f.id = fa."fspId"`);
    for (const oldFsp of oldFsps) {
      console.log('oldFsp: ', oldFsp);
      const newFsp = await fspRepository.save({
        id: oldFsp.fspid,
        fsp: oldFsp.fsp,
        fspDisplayName: oldFsp.fspDisplayName,
        program: [{ id: this.programId }],
      });
      if (oldFsp.attrid) {
        fspAttrRepository.save({
          id: oldFsp.attrid,
          name: oldFsp.name,
          label: oldFsp.label,
          placeholder: oldFsp.placeholder,
          options: oldFsp.options,
          export: oldFsp.export,
          answerType: oldFsp.answerType,
          fsp: newFsp,
        });
      }
    }
  }

  public async migrateInstance(): Promise<void> {
    console.log('migrateInstance');
    const repo = this.connection.getRepository(InstanceEntity);
    const oldInstances = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."instance" i;
      `);
    for (const i of oldInstances) {
      await repo.save(i);
    }
  }

  public async migrateProgram(): Promise<void> {
    console.log('migratePrograms: ');
    const oldProgram = (
      await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."program" i;
      `)
    )[0];
    const pRepo = this.connection.getRepository(ProgramEntity);
    const newProgram = await pRepo.save(oldProgram);
    const pQRepo = this.connection.getRepository(ProgramQuestionEntity);
    const crits = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."custom_criterium" c;
      `);
    for (let c of crits) {
      c.name = c.criterium;
      c.questionType = c.criteriumType;
      console.log('c: ', c);
      c.program = newProgram;
      pQRepo.save(c);
    }
  }

  private async migrateActions(): Promise<void> {
    const repo = this.connection.getRepository(ActionEntity);
    const oldActions = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."action" a;
      `);
    for (let a of oldActions) {
      a.created = a.timestamp;
      a.user = { id: a.userId };
      a.program = { id: this.programId };
      repo.save(a);
    }
  }

  private async migrateTwilioMessages(): Promise<void> {
    console.log('migrateTwilioMessages: ');
    const repo = this.connection.getRepository(TwilioMessageEntity);
    const ms = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."twilio-message" a;
      `);
    for (let m of ms) {
      m.created = m.dateCreated;
      await repo.save(m);
    }
  }

  private async migrateIntersolveInstruction(): Promise<void> {
    console.log('migrateIntersolveInstruction: ');
    const repo = this.connection.getRepository(IntersolveInstructionsEntity);
    const i = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."intersolve_instruction" a;
      `);
    await repo.save(i);
  }

  private async migrateIntersolveRequests(): Promise<void> {
    console.log('migrateIntersolveRequests: ');
    const repo = this.connection.getRepository(IntersolveRequestEntity);
    const i = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."intersolve_request" a;
      `);
    await repo.save(i);
  }

  private async migrateImageCode(): Promise<void> {
    console.log('migrateImageCode: ');
    const repo = this.connection.getRepository(ImageCodeEntity);
    const i = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."imagecode" a;
      `);
    await repo.save(i);
  }

  private async migrateFspCallLog(): Promise<void> {
    const repo = this.connection.getRepository(FspCallLogEntity);
    const logs = await this.oldConnection.query(`SELECT
        *
      FROM
        "121-service"."fsp_call_log" a;
      `);
    for (const log of logs) {
      log.fsp = { id: log.fspId };
      log.created = log.timestamp;
      repo.save(log);
    }
  }

  private async disableAutoIncrementId(repo: Repository<any>): Promise<void> {
    repo.metadata.columns = repo.metadata.columns.map<ColumnMetadata>(c => {
      if (c.propertyName === 'id') {
        c.isGenerated = false;
        c.generationStrategy = undefined;
      }
      return c;
    });
    await repo.query(
      `ALTER TABLE "121-service"."${repo.metadata.tableName}" ALTER COLUMN id DROP DEFAULT;`,
    );
  }

  private async enableAutoIncrementId(repo: Repository<any>): Promise<void> {
    repo.metadata.columns = repo.metadata.columns.map<ColumnMetadata>(c => {
      if (c.propertyName === 'id') {
        c.isGenerated = false;
        c.generationStrategy = undefined;
      }
      return c;
    });
    console.log('enableAutoIncrementId: ', repo.metadata.tableName);
    try {
      await repo.query(
        `CREATE SEQUENCE "121-service".${repo.metadata.tableName}_id_seq;`,
      );
    } catch {
      console.log(`SEQUENCE ${repo.metadata.tableName} already exists`);
    }

    await repo.query(`
      ALTER TABLE "121-service"."${repo.metadata.tableName}" ALTER COLUMN id SET DEFAULT nextval('${repo.metadata.tableName}_id_seq');`);
    await repo.query(
      `UPDATE "121-service"."${repo.metadata.tableName}" SET id = nextval('${repo.metadata.tableName}_id_seq')`,
    );
  }
}

export default MigrateRefactor;
