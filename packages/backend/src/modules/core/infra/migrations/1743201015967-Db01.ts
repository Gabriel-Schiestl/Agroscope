import { MigrationInterface, QueryRunner } from "typeorm";

export class Db011743201015967 implements MigrationInterface {
    name = 'Db011743201015967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "sickness" (
                "id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "symptoms" text array NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_872f69f9f3244b9a062bb5180c5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "handling" character varying,
                "image" text NOT NULL,
                "clientId" uuid,
                CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "telephone" character varying NOT NULL,
                "person" character varying NOT NULL,
                "document" character varying NOT NULL,
                "address" jsonb NOT NULL,
                "totalArea" double precision NOT NULL,
                "totalAreaPlanted" double precision NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "agriculturalEngineerId" uuid,
                CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "agricultural_engineer" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ac0cdb2ff07305008683c2d9419" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "image" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "image" text NOT NULL,
                "prediction" text NOT NULL,
                CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
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
                CONSTRAINT "UQ_abc878c952c2769f239103b2d59" UNIQUE ("email"),
                CONSTRAINT "PK_684fcb9924c8502d64b129cc8b1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "knowledge" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sicknessId" uuid NOT NULL,
                "handling" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_4b17eed0236cdebf2436784610" UNIQUE ("sicknessId"),
                CONSTRAINT "PK_4159ba98b65a20a8d1f257bc514" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD CONSTRAINT "FK_82a25a3a3cca8f81d3ee504950e" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_f43bd77d176186abf7cf1edce6a" FOREIGN KEY ("agriculturalEngineerId") REFERENCES "agricultural_engineer"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "FK_4b17eed0236cdebf24367846108" FOREIGN KEY ("sicknessId") REFERENCES "sickness"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "FK_4b17eed0236cdebf24367846108"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_f43bd77d176186abf7cf1edce6a"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP CONSTRAINT "FK_82a25a3a3cca8f81d3ee504950e"
        `);
        await queryRunner.query(`
            DROP TABLE "knowledge"
        `);
        await queryRunner.query(`
            DROP TABLE "authentication"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "image"
        `);
        await queryRunner.query(`
            DROP TABLE "agricultural_engineer"
        `);
        await queryRunner.query(`
            DROP TABLE "clients"
        `);
        await queryRunner.query(`
            DROP TABLE "history"
        `);
        await queryRunner.query(`
            DROP TABLE "sickness"
        `);
    }

}
