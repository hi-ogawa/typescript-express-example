import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createUsers1625718790150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "username",
            type: "character varying",
            isNullable: false,
          },
          {
            name: "passwordHash",
            type: "character varying",
            isNullable: false,
          },
        ],
        uniques: [
          {
            name: "UQ_5e4ea5038507fdbdd3f7",
            columnNames: ["username"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
