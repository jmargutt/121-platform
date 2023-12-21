import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFinancialPermission1703168993356
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`insert
      into
        "121-service".permission (name)
      values ('registration:attribute:financial.update');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
