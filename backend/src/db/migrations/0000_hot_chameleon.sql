CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`subReddit` text,
	`upVotes` integer DEFAULT 0,
	`downVotes` integer DEFAULT 0,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`subReddit`) REFERENCES `subreddits`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subreddits` (
	`name` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_id_unique` ON `posts` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subreddits_name_unique` ON `subreddits` (`name`);