import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db041744479799754 implements MigrationInterface {
    name = 'Db041744479799754';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_f43bd77d176186abf7cf1edce6a"
        `);
        await queryRunner.query(`
            CREATE TABLE "reports" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "content" text NOT NULL,
                "status" character varying NOT NULL,
                "attachments" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "visit_id" uuid,
                CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "visits" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "scheduledDate" TIMESTAMP,
                "status" character varying NOT NULL,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "client_id" uuid,
                CONSTRAINT "PK_0b0b322289a41015c6ea4e8bf30" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "agriculturalEngineerId"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "agricultural_engineer_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_5e8274e8b31dba2121e4d850e2b" FOREIGN KEY ("agricultural_engineer_id") REFERENCES "agricultural_engineer"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD CONSTRAINT "FK_4808e0755ca85fde2abb5b835d8" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visits"
            ADD CONSTRAINT "FK_cc48c7133c4a7d8e59042bf873c" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "visits" DROP CONSTRAINT "FK_cc48c7133c4a7d8e59042bf873c"
        `);
        await queryRunner.query(`
            ALTER TABLE "reports" DROP CONSTRAINT "FK_4808e0755ca85fde2abb5b835d8"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_5e8274e8b31dba2121e4d850e2b"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "agricultural_engineer_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "agriculturalEngineerId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            DROP TABLE "visits"
        `);
        await queryRunner.query(`
            DROP TABLE "reports"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_f43bd77d176186abf7cf1edce6a" FOREIGN KEY ("agriculturalEngineerId") REFERENCES "agricultural_engineer"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
}
