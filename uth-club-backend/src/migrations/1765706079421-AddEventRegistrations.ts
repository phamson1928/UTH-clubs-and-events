import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventRegistrations1765706079421 implements MigrationInterface {
  name = 'AddEventRegistrations1765706079421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event_registrations" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "eventId" integer, "userId" integer, CONSTRAINT "UQ_b308df020159fd5c476ace931d6" UNIQUE ("eventId", "userId"), CONSTRAINT "PK_953d3b862c2487289a92b2356e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_registrations" ADD CONSTRAINT "FK_e4e6dce237a527e4515f3d430f1" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_registrations" ADD CONSTRAINT "FK_7a072346484fe1d7ee0fb9dfaa8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_registrations" DROP CONSTRAINT "FK_7a072346484fe1d7ee0fb9dfaa8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_registrations" DROP CONSTRAINT "FK_e4e6dce237a527e4515f3d430f1"`,
    );
    await queryRunner.query(`DROP TABLE "event_registrations"`);
  }
}
