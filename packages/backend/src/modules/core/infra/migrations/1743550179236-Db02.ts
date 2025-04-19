import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db021743550179236 implements MigrationInterface {
    name = 'Db021743550179236';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP CONSTRAINT "FK_82a25a3a3cca8f81d3ee504950e"
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "userId" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "clientId"
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "clientId" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "clientId"
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "clientId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "userId"
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD CONSTRAINT "FK_82a25a3a3cca8f81d3ee504950e" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
