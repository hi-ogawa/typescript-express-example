import { MigrationInterface, QueryRunner } from "typeorm";

export class renameTimestamps1625799192334 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("users", "createdAt", "timestampsCreatedat");
    await queryRunner.renameColumn("users", "updatedAt", "timestampsUpdatedat");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("users", "timestampsCreatedat", "createdAt");
    await queryRunner.renameColumn("users", "timestampsUpdatedat", "updatedAt");
  }
}
