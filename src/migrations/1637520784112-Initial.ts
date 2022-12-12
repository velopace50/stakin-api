import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1637520784112 implements MigrationInterface {
    name = 'Initial1637520784112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fullName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "ownerPrivateKey" character varying NOT NULL DEFAULT '', "stakePrivateKey" character varying NOT NULL DEFAULT '', "authorizedPrivateKey" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
