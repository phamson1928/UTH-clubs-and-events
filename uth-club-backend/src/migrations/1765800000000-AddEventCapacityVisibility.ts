import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventCapacityVisibility1765800000000
  implements MigrationInterface
{
  name = 'AddEventCapacityVisibility1765800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" ADD "max_capacity" integer`);
    await queryRunner.query(
      `ALTER TABLE "event" ADD "registration_deadline" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_visibility_enum" AS ENUM('public', 'members_only')`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD "visibility" "public"."event_visibility_enum" NOT NULL DEFAULT 'public'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "visibility"`);
    await queryRunner.query(`DROP TYPE "public"."event_visibility_enum"`);
    await queryRunner.query(
      `ALTER TABLE "event" DROP COLUMN "registration_deadline"`,
    );
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "max_capacity"`);
  }
}
