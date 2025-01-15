import { MigrationInterface, QueryRunner } from "typeorm";

export class Db041736900089731 implements MigrationInterface {
    name = 'Db041736900089731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "prediction" character varying NOT NULL,
                "handling" character varying,
                "image" text NOT NULL,
                CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "history"
        `);
    }

}
