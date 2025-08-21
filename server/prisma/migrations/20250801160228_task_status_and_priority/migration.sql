/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('À faire', 'En cours', 'Terminé');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('Basse', 'Moyenne', 'Haute', 'Urgente');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'À faire',
DROP COLUMN "priority",
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'Moyenne';

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");
