import { MigrationInterface, QueryRunner } from "typeorm";

export class Db031731974130140 implements MigrationInterface {
    name = 'Db031731974130140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ALTER COLUMN "id" DROP DEFAULT
        `);
    }

}
