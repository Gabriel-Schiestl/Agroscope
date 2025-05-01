import { MigrationInterface, QueryRunner } from "typeorm";

export class Db091745938296072 implements MigrationInterface {
    name = 'Db091745938296072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "reports"
                RENAME COLUMN "visit_id" TO "event_id"
        `);
        await queryRunner.query(`
            CREATE TABLE "calendar_event" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "type" character varying NOT NULL,
                "status" character varying NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "time" character varying NOT NULL,
                "client_id" character varying,
                "location" character varying,
                "description" character varying,
                "report_id" character varying,
                "calendar_id" uuid,
                CONSTRAINT "PK_176fe24e6eb48c3fef696c7641f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "calendar" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_2492fb846a48ea16d53864e3267" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "calendar_event"
            ADD CONSTRAINT "FK_b8a97d25d9efe9b656b960f8b3a" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "calendar_event" DROP CONSTRAINT "FK_b8a97d25d9efe9b656b960f8b3a"
        `);
        await queryRunner.query(`
            DROP TABLE "calendar"
        `);
        await queryRunner.query(`
            DROP TABLE "calendar_event"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
                RENAME COLUMN "event_id" TO "visit_id"
        `);
    }

}
