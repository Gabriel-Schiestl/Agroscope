import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSicknessIdToHistory1746770000000 implements MigrationInterface {
    name = 'AddSicknessIdToHistory1746770000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "sickness_id" uuid NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "history"
            ADD CONSTRAINT "FK_history_sickness" 
            FOREIGN KEY ("sickness_id") REFERENCES "sickness"("id") 
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" 
            DROP CONSTRAINT "FK_history_sickness"
        `);

        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "sickness_id"
        `);
    }
}
