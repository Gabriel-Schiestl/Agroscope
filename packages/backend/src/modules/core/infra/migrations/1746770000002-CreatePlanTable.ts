import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlanTable1746770000002 implements MigrationInterface {
    name = 'CreatePlanTable1746770000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "plan" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "type" varchar NOT NULL,
        "image_limit" int NOT NULL,
        "chat_limit" int NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "plan"`);
    }
}
