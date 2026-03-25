import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLimitTable1746770000004 implements MigrationInterface {
    name = 'CreateLimitTable1746770000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "limit" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE,
        "image_count" int DEFAULT 0,
        "chat_count" int DEFAULT 0,
        "last_analysis" timestamp NULL,
        "last_message" timestamp NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_limit_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "limit"`);
    }
}
