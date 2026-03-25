import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSicknessFromHistory1746770000001
    implements MigrationInterface
{
    name = 'RemoveSicknessFromHistory1746770000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "sickness"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "sickness" varchar
        `);
    }
}
