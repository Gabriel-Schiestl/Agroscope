import { MigrationInterface, QueryRunner } from "typeorm";

export class Db111745966681201 implements MigrationInterface {
    name = 'Db111745966681201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "FK_4b17eed0236cdebf24367846108"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP CONSTRAINT "FK_32f766bdcc8dc98646ee98f09c7"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
                RENAME COLUMN "createdAt" TO "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "REL_4b17eed0236cdebf2436784610"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "sicknessId"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "userId"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "clientId"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "sicknessId"
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer" DROP COLUMN "userId"
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "totalArea"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "totalAreaPlanted"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "actualCrop"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "sickness_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "UQ_386698b16bc2ab04f3082a1616b" UNIQUE ("sickness_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "sickness_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "client_id" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "user_id" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer"
            ADD "user_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "total_area" double precision NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "total_area_planted" double precision NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "actual_crop" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "FK_386698b16bc2ab04f3082a1616b" FOREIGN KEY ("sickness_id") REFERENCES "sickness"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD CONSTRAINT "FK_7804ea8e41a03f1fa19ab316598" FOREIGN KEY ("sickness_id") REFERENCES "sickness"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP CONSTRAINT "FK_7804ea8e41a03f1fa19ab316598"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "FK_386698b16bc2ab04f3082a1616b"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "actual_crop"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "total_area_planted"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "total_area"
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "client_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "sickness_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "UQ_386698b16bc2ab04f3082a1616b"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "sickness_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "actualCrop" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "totalAreaPlanted" double precision NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "totalArea" double precision NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "agricultural_engineer"
            ADD "userId" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "sicknessId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "clientId" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "userId" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "sicknessId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "REL_4b17eed0236cdebf2436784610" UNIQUE ("sicknessId")
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
                RENAME COLUMN "created_at" TO "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD CONSTRAINT "FK_32f766bdcc8dc98646ee98f09c7" FOREIGN KEY ("sicknessId") REFERENCES "sickness"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "FK_4b17eed0236cdebf24367846108" FOREIGN KEY ("sicknessId") REFERENCES "sickness"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
