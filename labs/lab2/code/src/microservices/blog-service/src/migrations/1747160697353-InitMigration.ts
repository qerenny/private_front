import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1747160697353 implements MigrationInterface {
    name = 'InitMigration1747160697353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blog_comments" ("id" SERIAL NOT NULL, "post_id" integer NOT NULL, "user_id" integer NOT NULL, "comment_text" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b478aaeecf38441a25739aa9610" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blog_posts" ("id" SERIAL NOT NULL, "author_id" integer NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dd2add25eac93daefc93da9d387" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "blog_comments" ADD CONSTRAINT "FK_4e0b8959256b08ceb3d001f616b" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO "blog_posts" ("author_id", "title", "content") VALUES
            (1, 'Morning Routine', 'Tips for a productive morning workout routine.'),
            (2, 'Healthy Eating', 'How to balance macros for steady progress.'),
            (3, 'Rest and Recovery', 'Why sleep matters for fitness gains.'),
            (4, 'Hydration Basics', 'Staying hydrated during intense sessions.'),
            (5, 'Motivation Monday', 'Keeping your motivation high every week.')`);
        await queryRunner.query(`INSERT INTO "blog_comments" ("post_id", "user_id", "comment_text") VALUES
            (1, 2, 'Great advice, will try this tomorrow!'),
            (1, 3, 'Adding stretches really helped me too.'),
            (2, 4, 'Thanks for the meal plan ideas.'),
            (3, 5, 'Sleep tracking changed my routine completely.'),
            (4, 1, 'Hydration reminders are a lifesaver!')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_comments" DROP CONSTRAINT "FK_4e0b8959256b08ceb3d001f616b"`);
        await queryRunner.query(`DROP TABLE "blog_posts"`);
        await queryRunner.query(`DROP TABLE "blog_comments"`);
    }

}
