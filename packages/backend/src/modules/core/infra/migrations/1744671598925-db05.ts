import { MigrationInterface, QueryRunner } from "typeorm";

export class Db051744671598925 implements MigrationInterface {
    name = 'Db051744671598925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "visits" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "active" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "active"
        `);
        await queryRunner.query(`
            ALTER TABLE "visits"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

}
