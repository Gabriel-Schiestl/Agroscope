import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatMessageTable1748000000001 implements MigrationInterface {
    name = 'CreateChatMessageTable1748000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "chat_message" (
                "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "content"    text NOT NULL,
                "sender"     varchar(10) NOT NULL CHECK (sender IN ('human', 'ai')),
                "user_id"    uuid NOT NULL,
                "session_id" varchar(100) NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FK_chat_message_user"
                    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_chat_message_session_user"
                ON "chat_message" ("session_id", "user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_chat_message_user_created"
                ON "chat_message" ("user_id", "created_at" DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_chat_message_user_created"`,
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_chat_message_session_user"`,
        );
        await queryRunner.query(`DROP TABLE "chat_message"`);
    }
}
