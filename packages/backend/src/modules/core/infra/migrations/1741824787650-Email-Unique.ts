import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailUnique1741824787650 implements MigrationInterface {
    name = 'EmailUnique1741824787650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
        `);
        await queryRunner.query(`
            ALTER TABLE "authentication"
            ADD CONSTRAINT "UQ_abc878c952c2769f239103b2d59" UNIQUE ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "authentication" DROP CONSTRAINT "UQ_abc878c952c2769f239103b2d59"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"
        `);
    }

}
