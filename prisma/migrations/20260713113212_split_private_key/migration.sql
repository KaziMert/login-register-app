/*
  Warnings:

  - You are about to drop the column `encryptedPrivateKey` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `encryptedPrivateKey`;

-- CreateTable
CREATE TABLE `PrivateKey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iv` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `salt` VARCHAR(191) NOT NULL,
    `authTag` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `PrivateKey_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrivateKey` ADD CONSTRAINT `PrivateKey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
