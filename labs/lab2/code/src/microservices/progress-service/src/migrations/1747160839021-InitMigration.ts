import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1747160839021 implements MigrationInterface {
    name = 'InitMigration1747160839021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_progress" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "current_weight" numeric(5,2), "target_weight" numeric(5,2), "steps_walked" integer, "water_intake" numeric(4,1), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7b5eb2436efb0051fdf05cbe839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_training_plan" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "training_plan_id" integer NOT NULL, "started_at" date, "ended_at" date, CONSTRAINT "PK_dff78ae81f1c8649f5c3174067c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "user_progress" ("user_id", "current_weight", "target_weight", "steps_walked", "water_intake") VALUES
            (1, 82.5, 78.0, 8500, 2.5),
            (2, 74.3, 70.0, 9200, 3.0),
            (3, 68.0, 65.0, 10000, 2.8),
            (4, 90.2, 85.0, 7500, 2.2),
            (5, 60.0, 58.0, 11000, 3.1)`);
        await queryRunner.query(`INSERT INTO "user_training_plan" ("user_id", "training_plan_id", "started_at", "ended_at") VALUES
            (1, 1, '2024-01-01', '2024-03-01'),
            (2, 2, '2024-02-15', '2024-04-15'),
            (3, 3, '2024-03-10', '2024-05-10'),
            (4, 4, '2024-04-01', '2024-06-01'),
            (5, 5, '2024-05-20', '2024-07-20')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_training_plan"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
    }

}
