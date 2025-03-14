import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1741824473224 implements MigrationInterface {
    name = 'User1741824473224';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "role" character varying NOT NULL,
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "authentication" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "lastLogin" TIMESTAMP,
                "recoveryCode" character varying,
                "recoveryCodeExpiration" TIMESTAMP,
                "incorrectPasswordAttempts" integer,
                CONSTRAINT "PK_684fcb9924c8502d64b129cc8b1" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "authentication"
        `);
        await queryRunner.query(`
            DROP TABLE "image"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
    }
}
