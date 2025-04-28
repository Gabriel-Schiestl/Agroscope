import { MigrationInterface, QueryRunner } from "typeorm";

export class Db081745881837475 implements MigrationInterface {
    name = 'Db081745881837475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "reports" DROP CONSTRAINT "FK_4808e0755ca85fde2abb5b835d8"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD "client_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD "engineer_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "reports" DROP COLUMN "visit_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD "visit_id" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "reports" DROP COLUMN "visit_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD "visit_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "reports" DROP COLUMN "engineer_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports" DROP COLUMN "client_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD CONSTRAINT "FK_4808e0755ca85fde2abb5b835d8" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
