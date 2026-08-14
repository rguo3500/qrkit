CREATE TABLE `dynamic_link_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`dynamicLinkId` int NOT NULL,
	`grantedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dynamic_link_shares_id` PRIMARY KEY(`id`),
	CONSTRAINT `dynamic_link_shares_unique` UNIQUE(`teamId`,`dynamicLinkId`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL DEFAULT 'viewer',
	`status` enum('pending','active','revoked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_members_team_email_unique` UNIQUE(`teamId`,`email`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`ownerUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dynamic_link_shares` ADD CONSTRAINT `dynamic_link_shares_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dynamic_link_shares` ADD CONSTRAINT `dynamic_link_shares_dynamicLinkId_dynamic_links_id_fk` FOREIGN KEY (`dynamicLinkId`) REFERENCES `dynamic_links`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dynamic_link_shares` ADD CONSTRAINT `dynamic_link_shares_grantedByUserId_users_id_fk` FOREIGN KEY (`grantedByUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dynamic_link_shares_team_idx` ON `dynamic_link_shares` (`teamId`);--> statement-breakpoint
CREATE INDEX `dynamic_link_shares_link_idx` ON `dynamic_link_shares` (`dynamicLinkId`);--> statement-breakpoint
CREATE INDEX `team_members_team_idx` ON `team_members` (`teamId`);--> statement-breakpoint
CREATE INDEX `team_members_user_idx` ON `team_members` (`userId`);--> statement-breakpoint
CREATE INDEX `teams_owner_idx` ON `teams` (`ownerUserId`);