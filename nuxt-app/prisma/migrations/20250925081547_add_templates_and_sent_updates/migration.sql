-- AlterTable
ALTER TABLE `emailtemplate` ADD COLUMN `format` VARCHAR(191) NOT NULL DEFAULT 'plaintext';

-- AlterTable
ALTER TABLE `sentemail` ADD COLUMN `channel` VARCHAR(191) NULL,
    ADD COLUMN `externalId` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sentsms` ADD COLUMN `channel` VARCHAR(191) NULL,
    ADD COLUMN `externalId` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MessageChain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `chains` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EmailTemplateToMessageChain` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EmailTemplateToMessageChain_AB_unique`(`A`, `B`),
    INDEX `_EmailTemplateToMessageChain_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MessageChainToSmsTemplate` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MessageChainToSmsTemplate_AB_unique`(`A`, `B`),
    INDEX `_MessageChainToSmsTemplate_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_EmailTemplateToMessageChain` ADD CONSTRAINT `_EmailTemplateToMessageChain_A_fkey` FOREIGN KEY (`A`) REFERENCES `EmailTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmailTemplateToMessageChain` ADD CONSTRAINT `_EmailTemplateToMessageChain_B_fkey` FOREIGN KEY (`B`) REFERENCES `MessageChain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MessageChainToSmsTemplate` ADD CONSTRAINT `_MessageChainToSmsTemplate_A_fkey` FOREIGN KEY (`A`) REFERENCES `MessageChain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MessageChainToSmsTemplate` ADD CONSTRAINT `_MessageChainToSmsTemplate_B_fkey` FOREIGN KEY (`B`) REFERENCES `SmsTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
