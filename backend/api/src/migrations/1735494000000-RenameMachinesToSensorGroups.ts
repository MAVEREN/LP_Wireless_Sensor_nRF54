import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMachinesToSensorGroups1735494000000 implements MigrationInterface {
  name = 'RenameMachinesToSensorGroups1735494000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename machines table to sensor_groups
    await queryRunner.query(`ALTER TABLE "machines" RENAME TO "sensor_groups"`);
    
    // Rename machineId column to sensorGroupId in nodes table
    await queryRunner.query(`ALTER TABLE "nodes" RENAME COLUMN "machineId" TO "sensorGroupId"`);
    
    // Rename the index on sensorGroupId
    await queryRunner.query(`ALTER INDEX "IDX_nodes_machineId" RENAME TO "IDX_nodes_sensorGroupId"`);
    
    // Rename the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "nodes" 
      DROP CONSTRAINT IF EXISTS "FK_nodes_machineId";
    `);
    
    await queryRunner.query(`
      ALTER TABLE "nodes"
      ADD CONSTRAINT "FK_nodes_sensorGroupId" 
      FOREIGN KEY ("sensorGroupId") 
      REFERENCES "sensor_groups"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "nodes" 
      DROP CONSTRAINT IF EXISTS "FK_nodes_sensorGroupId";
    `);
    
    await queryRunner.query(`
      ALTER TABLE "nodes"
      ADD CONSTRAINT "FK_nodes_machineId" 
      FOREIGN KEY ("machineId") 
      REFERENCES "machines"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION;
    `);
    
    // Rename the index back
    await queryRunner.query(`ALTER INDEX "IDX_nodes_sensorGroupId" RENAME TO "IDX_nodes_machineId"`);
    
    // Rename column back
    await queryRunner.query(`ALTER TABLE "nodes" RENAME COLUMN "sensorGroupId" TO "machineId"`);
    
    // Rename table back
    await queryRunner.query(`ALTER TABLE "sensor_groups" RENAME TO "machines"`);
  }
}
