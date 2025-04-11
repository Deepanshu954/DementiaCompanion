import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with role differentiation
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["patient", "caretaker"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Caretaker profile
export const caretakerProfiles = pgTable("caretaker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  pricePerDay: doublePrecision("price_per_day").notNull(),
  yearsExperience: integer("years_experience"),
  location: text("location").notNull(),
  serviceAreas: text("service_areas").array().notNull().default(['Unknown']),
  gender: text("gender").notNull().default("not specified"),
  age: integer("age"),
  specializations: text("specializations").array().notNull(),
  isCertified: boolean("is_certified").notNull().default(false),
  isBackgroundChecked: boolean("is_background_checked").notNull().default(false),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count").default(0),
  isAvailable: boolean("is_available").notNull().default(true),
  imageUrl: text("image_url"),
});

export const insertCaretakerProfileSchema = createInsertSchema(caretakerProfiles).omit({
  id: true,
  rating: true,
  reviewCount: true,
});

// Patient-caretaker assignments
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  caretakerId: integer("caretaker_id").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
});

// Medications
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  schedule: text("schedule").notNull(), // JSON string of schedule
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Medication Logs
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  takenAt: timestamp("taken_at").notNull(),
  takenBy: integer("taken_by").references(() => users.id), // Can be null if self-administered
  notes: text("notes"),
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  recurrence: text("recurrence"), // daily, weekly, monthly, etc.
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  isCompleted: true,
  completedAt: true,
  completedBy: true,
  createdAt: true,
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["medication", "task", "assignment", "system"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  referenceId: integer("reference_id"), // ID of related entity (medication, task, etc.)
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CaretakerProfile = typeof caretakerProfiles.$inferSelect;
export type InsertCaretakerProfile = z.infer<typeof insertCaretakerProfileSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["patient", "caretaker"]),
});

export type LoginData = z.infer<typeof loginSchema>;
