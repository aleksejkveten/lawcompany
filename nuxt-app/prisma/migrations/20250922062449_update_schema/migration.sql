/*
  Warnings:

  - Added the required column `channelCategoryId` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channelCategoryId` to the `SmsTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `company` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `site` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `contactperson` ADD COLUMN `source` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `courtcase` ADD COLUMN `triedToParse` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `emailtemplate` ADD COLUMN `channelCategoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `smstemplate` ADD COLUMN `channelCategoryId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `CompanyBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NULL,
    `shortName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `unp` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phones` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `CompanyBase_unp_key`(`unp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SmsTemplate` ADD CONSTRAINT `SmsTemplate_channelCategoryId_fkey` FOREIGN KEY (`channelCategoryId`) REFERENCES `ChannelCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailTemplate` ADD CONSTRAINT `EmailTemplate_channelCategoryId_fkey` FOREIGN KEY (`channelCategoryId`) REFERENCES `ChannelCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
