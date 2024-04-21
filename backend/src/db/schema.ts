import { sql } from "npm:drizzle-orm";
import {integer, text, sqliteTable, primaryKey} from "npm:drizzle-orm/sqlite-core";

export const postTable = sqliteTable("posts", {
    id: integer("id").primaryKey({autoIncrement: true}).unique(),
    title: text("title").notNull(),
    authorName: text("authorName"),
    content: text("content").notNull(),
    subReddit: text("subReddit").references(() => subRedditTable.name),
    upVotes: integer("upVotes").default(0),
    downVotes: integer("downVotes").default(0),
    createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
    reportCount: integer("reportCount").default(0)
})

export const subRedditTable = sqliteTable("subreddits", {
    name: text("name").primaryKey().unique().notNull(),
    description: text("description").notNull(),
    creatorId: text("creatorId").references(() => userTable.id),
    createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
    nbPost: integer("nbPost").default(0)
})

export const userTable = sqliteTable("user", {
    id: text("id").primaryKey(),
    githubId: integer("github_id").unique(),
    username: text("username").notNull(),
    role: text("role", {enum: ["super-admin", "user"]}).default("user")
})

export const upVotesUserTables = sqliteTable("upVotes_Users", {
    user: text("user").references(() => userTable.id, {onDelete: "cascade"}),
    upVotedPost: text("upVotedPost").references(() => postTable.id, {onDelete: "cascade"})
}, (table) => {
    return {
        pk : primaryKey({columns: [table.user, table.upVotedPost]})
    }
})


export const downVotesUserTables = sqliteTable("downVotes_Users", {
    user: text("user").references(() => userTable.id, {onDelete: "cascade"}),
    downVotedPost: text("downVotedPost").references(() => postTable.id, {onDelete: "cascade"})
}, (table) => {
    return {
        pk : primaryKey({columns: [table.user, table.downVotedPost]})
    }
})

export const moderatorsTable = sqliteTable("moderators", {
    user: text("user").references(() => userTable.id, {onDelete: "cascade"}),
    subreddit: text("subreddit").references(() => subRedditTable.name, {onDelete: "cascade"})
}, (table) => {
    return {
        pk: primaryKey({columns: [table.user, table.subreddit]})
    }
})

export const bannedUserTable = sqliteTable("bannedUsers", {
    userId: text("userId").references(() => userTable.id, {onDelete: "cascade"}),
    subreddit: text("subreddit").references(() => subRedditTable.name, {onDelete: "cascade"})
}, (table) => {
    return {
        pk: primaryKey({columns: [table.userId, table.subreddit]})
    }
})

export const reportedPostTable = sqliteTable("reportedPost", {
    userId: text("userId").references(() => userTable.id, {onDelete: "cascade"}),
    postId: integer("postId").references(() => postTable.id, {onDelete: "cascade"})
}, (table) => {
    return {
        pk: primaryKey({columns: [table.userId, table.postId]})
    }
})

export const commentTable = sqliteTable("comments", {
    id: integer("id").primaryKey({autoIncrement: true}),
    userId: text("userId").references(() => userTable.id, {onDelete: "cascade"}),
    postId: integer("postId").references(() => postTable.id, {onDelete: "cascade"}),
    comment: text("comment"),
    createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`)
})

export const followedSubredditTable = sqliteTable("followedSubreddit", {
    userId: text("userId").references(() => userTable.id, {onDelete: "cascade"}),
    subreddit: text("subreddit").references(() => subRedditTable.name, {onDelete: "cascade"})
}, (table) => {
    return {
        pk: primaryKey({columns: [table.userId, table.subreddit]})
    }
})

export const sessionTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at").notNull()
});
