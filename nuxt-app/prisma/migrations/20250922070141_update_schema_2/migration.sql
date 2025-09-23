/*
  Warnings:

  - A unique constraint covering the columns `[unp]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Company_unp_key` ON `Company`(`unp`);
