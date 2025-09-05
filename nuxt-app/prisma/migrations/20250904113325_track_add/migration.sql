-- AlterTable
ALTER TABLE `company` ADD COLUMN `aliases` VARCHAR(191) NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `track` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `courtcase` ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `track` BOOLEAN NULL DEFAULT false,
    MODIFY `caseNumber` VARCHAR(191) NULL,
    MODIFY `receiptDate` DATETIME(3) NULL,
    MODIFY `debtAmount` DOUBLE NULL,
    MODIFY `decision` VARCHAR(191) NULL;
