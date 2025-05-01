import { MigrationInterface, QueryRunner } from "typeorm";

export class Db101745938801472 implements MigrationInterface {
    name = 'Db101745938801472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "email" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "calendar"
            ALTER COLUMN "name" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "calendar"
            ALTER COLUMN "name"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "email"
        `);
    }

}
