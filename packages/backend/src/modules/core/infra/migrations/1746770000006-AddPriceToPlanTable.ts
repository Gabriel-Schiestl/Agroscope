import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceToPlanTable1746770000006 implements MigrationInterface {
    name = 'AddPriceToPlanTable1746770000006';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "plan" ADD COLUMN "price" decimal(10,2) NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "plan" DROP COLUMN "price"
        `);
    }
}
