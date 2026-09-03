import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTermsAcceptanceToUser1748000000008
    implements MigrationInterface
{
    name = 'AddTermsAcceptanceToUser1748000000008';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user"
      ADD "terms_accepted_at" TIMESTAMP NULL
    `);

        await queryRunner.query(`
      ALTER TABLE "user"
      ADD "terms_version" character varying NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "terms_version"
    `);

        await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "terms_accepted_at"
    `);
    }
}
