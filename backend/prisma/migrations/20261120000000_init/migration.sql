-- CreateEnum
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(100) NOT NULL,
  `avatarUrl` VARCHAR(2048) NULL,
  `timezone` VARCHAR(64) NOT NULL DEFAULT 'UTC',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
  INDEX `refresh_tokens_userId_expiresAt_idx`(`userId`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `memories` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `memoryDate` DATETIME(3) NOT NULL,
  `locationName` VARCHAR(255) NULL,
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(10,7) NULL,
  `privacy` ENUM('PRIVATE', 'SHARED') NOT NULL DEFAULT 'PRIVATE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  INDEX `memories_userId_memoryDate_idx`(`userId`, `memoryDate`),
  INDEX `memories_userId_locationName_idx`(`userId`, `locationName`),
  INDEX `memories_latitude_longitude_idx`(`latitude`, `longitude`),
  PRIMARY KEY (`id`),
  CONSTRAINT `memories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `memory_media` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('IMAGE', 'VIDEO') NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `publicId` VARCHAR(255) NOT NULL,
  `thumbnailUrl` VARCHAR(2048) NULL,
  `width` INTEGER NULL,
  `height` INTEGER NULL,
  `durationSec` INTEGER NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `memoryId` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `memory_media_publicId_key`(`publicId`),
  INDEX `memory_media_memoryId_sortOrder_idx`(`memoryId`, `sortOrder`),
  PRIMARY KEY (`id`),
  CONSTRAINT `memory_media_memoryId_fkey` FOREIGN KEY (`memoryId`) REFERENCES `memories`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `favorites` (
  `id` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` VARCHAR(191) NOT NULL,
  `memoryId` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `favorites_userId_memoryId_key`(`userId`, `memoryId`),
  INDEX `favorites_memoryId_idx`(`memoryId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_memoryId_fkey` FOREIGN KEY (`memoryId`) REFERENCES `memories`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('ANNIVERSARY', 'SYSTEM') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `readAt` DATETIME(3) NULL,
  `userId` VARCHAR(191) NOT NULL,
  INDEX `notifications_userId_isRead_createdAt_idx`(`userId`, `isRead`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notification_preferences` (
  `id` VARCHAR(191) NOT NULL,
  `anniversaryEnabled` BOOLEAN NOT NULL DEFAULT true,
  `emailEnabled` BOOLEAN NOT NULL DEFAULT false,
  `pushEnabled` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `notification_preferences_userId_key`(`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `device_push_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `platform` VARCHAR(20) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `device_push_tokens_token_key`(`token`),
  INDEX `device_push_tokens_userId_idx`(`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `device_push_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_conversations` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(200) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  INDEX `chat_conversations_userId_updatedAt_idx`(`userId`, `updatedAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `chat_conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `id` VARCHAR(191) NOT NULL,
  `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `conversationId` VARCHAR(191) NOT NULL,
  INDEX `chat_messages_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `chat_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
