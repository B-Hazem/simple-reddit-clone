import { sql } from "drizzle-orm";
import {integer, text, sqliteTable} from "drizzle-orm/sqlite-core";

export const postTable = sqliteTable("posts", {
    id: integer("id").primaryKey({autoIncrement: true}).unique(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    subReddit: text("subReddit").references(() => subRedditTable.name),
    upVotes: integer("upVotes").default(0),
    downVotes: integer("downVotes").default(0),
    createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`)
})

export const subRedditTable = sqliteTable("subreddits", {
    name: text("name").primaryKey().unique().notNull(),
    description: text("description").notNull(),
    createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`)
})

export const userTable = sqliteTable("user", {
    id: text("id").primaryKey(),
    githubId: integer("github_id").unique(),
    username: text("username").notNull()
})

export const sessionTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at").notNull()
});
