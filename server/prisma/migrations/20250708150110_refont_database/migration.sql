/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `key` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - The `id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `joinedAt` on the `ProjectMember` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `ProjectMember` table. All the data in the column will be lost.
  - The `id` column on the `ProjectMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `ProjectMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `ProjectMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropIndex
DROP INDEX "Project_key_key";

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "key",
DROP COLUMN "name",
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'Basse',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'En attente',
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_pkey",
DROP COLUMN "joinedAt",
DROP COLUMN "role",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "role",
ADD COLUMN     "name" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'À faire',
    "priority" TEXT NOT NULL DEFAULT 'Moyenne',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,
    "assignedToId" INTEGER,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "ProjectMember"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
