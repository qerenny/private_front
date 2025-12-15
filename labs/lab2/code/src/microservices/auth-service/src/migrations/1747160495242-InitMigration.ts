import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1747160495242 implements MigrationInterface {
    name = 'InitMigration1747160495242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "role_name" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "role_id" integer NOT NULL DEFAULT 2, "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password_hash" character varying(255) NOT NULL, "date_of_birth" date, "gender" character varying(10), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "roles" ("role_name") VALUES
            ('admin'),
            ('user'),
            ('coach'),
            ('nutritionist'),
            ('support')`);
        await queryRunner.query(`INSERT INTO "users" ("role_id", "name", "email", "password_hash", "date_of_birth", "gender") VALUES
            (1, 'Alice Admin', 'alice.admin@example.com', 'hash_admin', '1985-01-15', 'female'),
            (2, 'Bob User', 'bob.user@example.com', 'hash_user', '1990-05-20', 'male'),
            (3, 'Charlie Coach', 'charlie.coach@example.com', 'hash_coach', '1988-03-10', 'male'),
            (4, 'Diana Diet', 'diana.diet@example.com', 'hash_diet', '1992-07-22', 'female'),
            (5, 'Evan Support', 'evan.support@example.com', 'hash_support', '1987-11-30', 'male')`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
