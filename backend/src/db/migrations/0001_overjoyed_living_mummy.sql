CREATE TABLE `downVotes_Users` (
	`user` text,
	`downVotedPost` text,
	PRIMARY KEY(`downVotedPost`, `user`),
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`downVotedPost`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `upVotes_Users` (
	`user` text,
	`upVotedPost` text,
	PRIMARY KEY(`upVotedPost`, `user`),
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upVotedPost`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
