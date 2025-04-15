import { MigrationInterface, QueryRunner } from "typeorm";

export class Db071744755445649 implements MigrationInterface {
    name = 'Db071744755445649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "visits" DROP CONSTRAINT "FK_cc48c7133c4a7d8e59042bf873c"
        `);
        await queryRunner.query(`
            ALTER TABLE "visits"
            ADD "engineer_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "visits" DROP COLUMN "client_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "visits"
            ADD "client_id" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "visits" DROP COLUMN "client_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "visits"
            ADD "client_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "visits" DROP COLUMN "engineer_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "visits"
            ADD CONSTRAINT "FK_cc48c7133c4a7d8e59042bf873c" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
