/*
  Warnings:

  - Added the required column `parentType` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentType` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParentType" AS ENUM ('MOVIE', 'COMMENT');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentType" "ParentType" NOT NULL;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "parentType" "ParentType" NOT NULL;
