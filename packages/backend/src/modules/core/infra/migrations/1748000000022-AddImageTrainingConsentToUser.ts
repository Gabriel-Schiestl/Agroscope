import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageTrainingConsentToUser1748000000022
    implements MigrationInterface
{
    name = 'AddImageTrainingConsentToUser1748000000022';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user"
      ADD "image_training_consent_at" TIMESTAMP NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "image_training_consent_at"
    `);
    }
}
