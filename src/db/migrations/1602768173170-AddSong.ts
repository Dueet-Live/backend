import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSong1602768173170 implements MigrationInterface {
    name = 'AddSong1602768173170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "song_content" ("id" SERIAL NOT NULL, "content" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "songId" integer, CONSTRAINT "REL_1a04b29a26daee03294db9fcb8" UNIQUE ("songId"), CONSTRAINT "PK_955a88f232fb3e7b8ebf317b920" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "song" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_baaa977f861cce6ff954ccee285" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "song_content" ADD CONSTRAINT "FK_1a04b29a26daee03294db9fcb87" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "song_content" DROP CONSTRAINT "FK_1a04b29a26daee03294db9fcb87"`);
        await queryRunner.query(`DROP TABLE "song"`);
        await queryRunner.query(`DROP TABLE "song_content"`);
    }

}
