/*
  Warnings:

  - The values [Basse,Moyenne,Haute,Urgente] on the enum `TaskPriority` will be removed. If these variants are still used in the database, this will fail.
  - The values [À faire,En cours,Terminé] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskPriority_new" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE');
ALTER TABLE "Task" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "priority" TYPE "TaskPriority_new" USING ("priority"::text::"TaskPriority_new");
ALTER TYPE "TaskPriority" RENAME TO "TaskPriority_old";
ALTER TYPE "TaskPriority_new" RENAME TO "TaskPriority";
DROP TYPE "TaskPriority_old";
ALTER TABLE "Task" ALTER COLUMN "priority" SET DEFAULT 'MOYENNE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('A_FAIRE', 'EN_COURS', 'TERMINE');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'A_FAIRE';
COMMIT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'A_FAIRE',
ALTER COLUMN "priority" SET DEFAULT 'MOYENNE';
