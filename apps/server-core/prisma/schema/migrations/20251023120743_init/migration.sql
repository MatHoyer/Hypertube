/*
  Warnings:

  - You are about to drop the column `parentType` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parentType` on the `Like` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "parentType";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "parentType";

-- DropEnum
DROP TYPE "ParentType";
