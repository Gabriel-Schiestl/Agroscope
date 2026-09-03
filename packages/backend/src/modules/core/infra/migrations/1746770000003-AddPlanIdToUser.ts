import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanIdToUser1746770000003 implements MigrationInterface {
    name = 'AddPlanIdToUser1746770000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user"
      ADD "plan_id" uuid NULL
    `);

        await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_plan" 
      FOREIGN KEY ("plan_id") REFERENCES "plan"("id") 
      ON DELETE SET NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user" 
      DROP CONSTRAINT "FK_user_plan"
    `);

        await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "plan_id"
    `);
    }
}
