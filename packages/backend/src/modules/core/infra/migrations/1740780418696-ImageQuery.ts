import { MigrationInterface, QueryRunner } from "typeorm";

export class ImageQuery1740780418696 implements MigrationInterface {
    name = 'ImageQuery1740780418696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "image" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "image" text NOT NULL,
                "prediction" text NOT NULL,
                CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "image"
        `);
    }

}
