import { MigrationInterface, QueryRunner } from "typeorm";

export class Db061744672114602 implements MigrationInterface {
    name = 'Db061744672114602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "actualCrop" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "actualCrop"
        `);
    }

}
