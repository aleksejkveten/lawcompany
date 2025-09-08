-- AlterTable
ALTER TABLE `sentemail` ADD COLUMN `companyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `sentsms` ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SentSms` ADD CONSTRAINT `SentSms_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SentEmail` ADD CONSTRAINT `SentEmail_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
