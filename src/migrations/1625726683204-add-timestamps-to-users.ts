import { MigrationInterface, QueryRunner } from "typeorm";

export class addTimestampsToUsers1625726683204 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const date = new Date(1625726683204);
    for (const column of ["createdAt", "updatedAt"]) {
      await queryRunner.query(`ALTER TABLE "users" ADD "${column}" TIMESTAMP`);
      await queryRunner.query(`UPDATE "users" SET "${column}" = $1`, [date]);
      await queryRunner.query(
        `ALTER TABLE "users" ALTER "${column}" SET NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
  }
}
