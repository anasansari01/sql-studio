import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  jsonb,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const resultStatusEnum = pgEnum("result_status", ["correct", "wrong", "error", "empty"]);

export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("easy"),
  question: text("question").notNull(),
  sandboxSchema: text("sandbox_schema").notNull(),
  tables: jsonb("tables").notNull().$type<string[]>().default([]),
  expectedColumns: text("expected_columns"),
  solutionQuery: text("solution_query").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jti: text("jti").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  sqlQuery: text("sql_query").notNull(),
  status: resultStatusEnum("status").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  errorMessage: text("error_message"),
  executionTimeMs: integer("execution_time_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const solvedAssignments = pgTable(
  "solved_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    bestQuery: text("best_query").notNull(),
    solvedAt: timestamp("solved_at").notNull().defaultNow(),
  },
  (t) => ({
    userAssignmentUnique: unique("solved_user_assignment").on(
      t.userId,
      t.assignmentId
    ),
  })
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("BookOpen"),
  color: text("color").notNull().default("indigo"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assignmentCategories = pgTable(
  "assignment_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    position: integer("position").notNull().default(0),
  },
  (t) => ({
    unique: unique("assignment_category_unique").on(
      t.assignmentId,
      t.categoryId
    ),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  attempts: many(attempts),
  sessions: many(sessions),
  solvedAssignments: many(solvedAssignments),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  assignment: one(assignments, {
    fields: [attempts.assignmentId],
    references: [assignments.id],
  }),
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id],
  }),
}));

export const solvedAssignmentsRelations = relations(
  solvedAssignments,
  ({ one }) => ({
    user: one(users, {
      fields: [solvedAssignments.userId],
      references: [users.id],
    }),
    assignment: one(assignments, {
      fields: [solvedAssignments.assignmentId],
      references: [assignments.id],
    }),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  assignmentCategories: many(assignmentCategories),
}));

export const assignmentCategoriesRelations = relations(
  assignmentCategories,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentCategories.assignmentId],
      references: [assignments.id],
    }),
    category: one(categories, {
      fields: [assignmentCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export const assignmentsRelations = relations(assignments, ({ many }) => ({
  attempts: many(attempts),
  solvedBy: many(solvedAssignments),
  assignmentCategories: many(assignmentCategories),
}));

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type SolvedAssignment = typeof solvedAssignments.$inferSelect;
export type NewSolvedAssignment = typeof solvedAssignments.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type AssignmentCategory = typeof assignmentCategories.$inferSelect;

export type SafeUser = Omit<User, "passwordHash">;