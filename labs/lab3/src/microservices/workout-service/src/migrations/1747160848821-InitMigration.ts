import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1747160848821 implements MigrationInterface {
    name = 'InitMigration1747160848821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "training_plans" ("id" SERIAL NOT NULL, "plan_name" character varying(255) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_246975cb895b51662b90515a390" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "training_plan_workouts" ("id" SERIAL NOT NULL, "training_plan_id" integer NOT NULL, "workout_id" integer NOT NULL, CONSTRAINT "PK_7c223aa96622bbdb4497deb36b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workouts" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "video_url" text, "level" character varying(50) NOT NULL, "workout_type" character varying(50) NOT NULL, "duration_min" integer NOT NULL, "instructions" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5b2319bf64a674d40237dbb1697" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "training_plan_workouts" ADD CONSTRAINT "FK_12c6f1854b94fdb0330a8bbc81c" FOREIGN KEY ("training_plan_id") REFERENCES "training_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "training_plan_workouts" ADD CONSTRAINT "FK_de88e8c3def6c75a9102939dcef" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO "training_plans" ("plan_name", "description") VALUES
            ('Beginner Strength', 'Introductory strength plan for newcomers.'),
            ('Cardio Boost', 'Improve endurance with progressive cardio sessions.'),
            ('Flexibility Focus', 'Stretching routines to enhance mobility.'),
            ('HIIT Blast', 'High-intensity interval plan for fat loss.'),
            ('Balanced Fitness', 'Mix of strength, cardio, and mobility work.')`);
        await queryRunner.query(`INSERT INTO "workouts" ("title", "description", "video_url", "level", "workout_type", "duration_min", "instructions") VALUES
            ('Full Body Basics', 'A gentle introduction to compound movements.', 'https://example.com/workouts/full-body', 'beginner', 'strength', 30, 'Complete 3 sets of 10 reps for each exercise.'),
            ('Treadmill Intervals', 'Intervals to raise heart rate steadily.', 'https://example.com/workouts/intervals', 'intermediate', 'cardio', 25, 'Alternate 1 min fast with 2 min recovery.'),
            ('Morning Mobility', 'Stretch sequence to start the day.', 'https://example.com/workouts/mobility', 'beginner', 'flexibility', 20, 'Hold each stretch for 30 seconds.'),
            ('HIIT Circuit', 'Fast-paced circuit with minimal rest.', 'https://example.com/workouts/hiit', 'advanced', 'hiit', 18, 'Perform each move for 40 seconds with 20 seconds rest.'),
            ('Core Stability', 'Exercises to build a stable core.', 'https://example.com/workouts/core', 'intermediate', 'strength', 22, 'Maintain controlled form for every rep.')`);
        await queryRunner.query(`INSERT INTO "training_plan_workouts" ("training_plan_id", "workout_id") VALUES
            (1, 1),
            (2, 2),
            (3, 3),
            (4, 4),
            (5, 5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plan_workouts" DROP CONSTRAINT "FK_de88e8c3def6c75a9102939dcef"`);
        await queryRunner.query(`ALTER TABLE "training_plan_workouts" DROP CONSTRAINT "FK_12c6f1854b94fdb0330a8bbc81c"`);
        await queryRunner.query(`DROP TABLE "workouts"`);
        await queryRunner.query(`DROP TABLE "training_plan_workouts"`);
        await queryRunner.query(`DROP TABLE "training_plans"`);
    }

}
