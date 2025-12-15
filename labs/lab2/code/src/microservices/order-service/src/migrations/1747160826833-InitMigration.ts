import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1747160826833 implements MigrationInterface {
    name = 'InitMigration1747160826833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "order_id" integer NOT NULL, "payment_method" character varying(50) NOT NULL, "payment_status" character varying(50) NOT NULL, "transaction_id" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "total_amount" numeric(10,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO "orders" ("user_id", "total_amount", "currency") VALUES
            (1, 49.99, 'USD'),
            (2, 19.99, 'USD'),
            (3, 29.99, 'USD'),
            (4, 9.99, 'USD'),
            (5, 59.99, 'USD')`);
        await queryRunner.query(`INSERT INTO "payments" ("order_id", "payment_method", "payment_status", "transaction_id") VALUES
            (1, 'card', 'completed', 'TXN-1001'),
            (2, 'paypal', 'completed', 'TXN-1002'),
            (3, 'card', 'pending', 'TXN-1003'),
            (4, 'cash', 'refunded', 'TXN-1004'),
            (5, 'card', 'completed', 'TXN-1005')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
