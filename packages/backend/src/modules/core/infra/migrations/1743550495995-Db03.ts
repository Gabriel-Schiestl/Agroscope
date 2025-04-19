import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db031743550495995 implements MigrationInterface {
    name = 'Db031743550495995';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "sicknessId" uuid NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD CONSTRAINT "FK_32f766bdcc8dc98646ee98f09c7" FOREIGN KEY ("sicknessId") REFERENCES "sickness"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP CONSTRAINT "FK_32f766bdcc8dc98646ee98f09c7"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "sicknessId"
        `);
    }
}
