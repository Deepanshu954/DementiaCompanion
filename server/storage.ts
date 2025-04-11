import { users, caretakerProfiles, assignments, medications, medicationLogs, tasks, notifications } from "@shared/schema";
import type { 
  User, InsertUser, 
  CaretakerProfile, InsertCaretakerProfile,
  Assignment, InsertAssignment,
  Medication, InsertMedication,
  MedicationLog, InsertMedicationLog,
  Task, InsertTask,
  Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, gte, lte, like, desc, isNull, SQL } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Caretaker profile methods
  getCaretakerProfile(userId: number): Promise<CaretakerProfile | undefined>;
  createCaretakerProfile(profile: InsertCaretakerProfile): Promise<CaretakerProfile>;
  updateCaretakerProfile(userId: number, profile: Partial<InsertCaretakerProfile>): Promise<CaretakerProfile | undefined>;
  searchCaretakers(filters: CaretakerSearchFilters): Promise<(CaretakerProfile & { user: User })[]>;
  
  // Assignment methods
  getAssignmentsByPatient(patientId: number): Promise<(Assignment & { caretaker: User & { profile?: CaretakerProfile } })[]>;
  getAssignmentsByCaretaker(caretakerId: number): Promise<(Assignment & { patient: User })[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment | undefined>;
  
  // Medication methods
  getMedicationsByUser(userId: number): Promise<Medication[]>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Medication log methods
  getMedicationLogsByMedication(medicationId: number): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  
  // Task methods
  getTasksByUser(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;
  completeTask(id: number, completedBy: number): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Notification methods
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
}

// Filter interface for caretaker search
export interface CaretakerSearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  specialization?: string;
  isCertified?: boolean;
  isBackgroundChecked?: boolean;
  isAvailable?: boolean;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Caretaker profile methods
  async getCaretakerProfile(userId: number): Promise<CaretakerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(caretakerProfiles)
      .where(eq(caretakerProfiles.userId, userId));
    return profile;
  }

  async createCaretakerProfile(profile: InsertCaretakerProfile): Promise<CaretakerProfile> {
    const [caretakerProfile] = await db
      .insert(caretakerProfiles)
      .values({
        ...profile,
        rating: 0,
        reviewCount: 0
      })
      .returning();
    return caretakerProfile;
  }

  async updateCaretakerProfile(userId: number, profileData: Partial<InsertCaretakerProfile>): Promise<CaretakerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(caretakerProfiles)
      .where(eq(caretakerProfiles.userId, userId));
    
    if (!profile) return undefined;
    
    const [updatedProfile] = await db
      .update(caretakerProfiles)
      .set(profileData)
      .where(eq(caretakerProfiles.userId, userId))
      .returning();
    
    return updatedProfile;
  }

  async searchCaretakers(filters: CaretakerSearchFilters): Promise<(CaretakerProfile & { user: User })[]> {
    const conditions: SQL[] = [];
    
    if (filters.location) {
      conditions.push(like(caretakerProfiles.location, `%${filters.location}%`));
    }
    
    if (filters.minPrice !== undefined) {
      conditions.push(gte(caretakerProfiles.pricePerDay, filters.minPrice));
    }
    
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(caretakerProfiles.pricePerDay, filters.maxPrice));
    }
    
    // For specialization we need a more complex query with array contains
    
    if (filters.isCertified !== undefined) {
      conditions.push(eq(caretakerProfiles.isCertified, filters.isCertified));
    }
    
    if (filters.isBackgroundChecked !== undefined) {
      conditions.push(eq(caretakerProfiles.isBackgroundChecked, filters.isBackgroundChecked));
    }
    
    if (filters.isAvailable !== undefined) {
      conditions.push(eq(caretakerProfiles.isAvailable, filters.isAvailable));
    }
    
    // Join the caretakerProfiles table with the users table
    let query = db
      .select({
        profile: caretakerProfiles,
        user: users
      })
      .from(caretakerProfiles)
      .innerJoin(users, eq(caretakerProfiles.userId, users.id));
    
    // Add the conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // For specialization, we need to filter the results in memory
    const results = await query;
    let filteredResults = results;
    
    if (filters.specialization) {
      filteredResults = results.filter(({ profile }) => 
        profile.specializations.some(s => 
          s.toLowerCase().includes(filters.specialization!.toLowerCase())
        )
      );
    }
    
    // Transform the results to match the expected return type
    return filteredResults.map(({ profile, user }) => {
      return { ...profile, user };
    });
  }

  // Assignment methods
  async getAssignmentsByPatient(patientId: number): Promise<(Assignment & { caretaker: User & { profile?: CaretakerProfile } })[]> {
    const patientAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.patientId, patientId));
    
    // Get all the caretaker IDs
    const caretakerIds = patientAssignments.map(a => a.caretakerId);
    
    // Get all caretakers in one query
    const caretakers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "caretaker"),
          'id' in users ? eq(users.id as any, caretakerIds) : undefined as any
        )
      );
    
    // Get all caretaker profiles in one query
    const profiles = await db
      .select()
      .from(caretakerProfiles)
      .where('userId' in caretakerProfiles ? eq(caretakerProfiles.userId as any, caretakerIds) : undefined as any);
    
    // Map caretakers and profiles to assignments
    return patientAssignments.map(assignment => {
      const caretaker = caretakers.find(c => c.id === assignment.caretakerId)!;
      const profile = profiles.find(p => p.userId === caretaker.id);
      
      return {
        ...assignment,
        caretaker: {
          ...caretaker,
          profile
        }
      };
    });
  }

  async getAssignmentsByCaretaker(caretakerId: number): Promise<(Assignment & { patient: User })[]> {
    const caretakerAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.caretakerId, caretakerId));
    
    // Get all the patient IDs
    const patientIds = caretakerAssignments.map(a => a.patientId);
    
    // Get all patients in one query
    const patients = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "patient"),
          'id' in users ? eq(users.id as any, patientIds) : undefined as any
        )
      );
    
    // Map patients to assignments
    return caretakerAssignments.map(assignment => {
      const patient = patients.find(p => p.id === assignment.patientId)!;
      
      return {
        ...assignment,
        patient
      };
    });
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db
      .insert(assignments)
      .values(assignmentData)
      .returning();
    return assignment;
  }

  async updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment | undefined> {
    const [assignment] = await db
      .update(assignments)
      .set(data)
      .where(eq(assignments.id, id))
      .returning();
    return assignment;
  }

  // Medication methods
  async getMedicationsByUser(userId: number): Promise<Medication[]> {
    return db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId));
  }

  async getMedicationById(id: number): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));
    return medication;
  }

  async createMedication(medicationData: InsertMedication): Promise<Medication> {
    const now = new Date();
    const [medication] = await db
      .insert(medications)
      .values({
        ...medicationData,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return medication;
  }

  async updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined> {
    const [medication] = await db
      .update(medications)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(medications.id, id))
      .returning();
    return medication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const result = await db
      .delete(medications)
      .where(eq(medications.id, id));
    return true; // Assuming the delete was successful
  }

  // Medication log methods
  async getMedicationLogsByMedication(medicationId: number): Promise<MedicationLog[]> {
    return db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.medicationId, medicationId));
  }

  async createMedicationLog(logData: InsertMedicationLog): Promise<MedicationLog> {
    const [log] = await db
      .insert(medicationLogs)
      .values(logData)
      .returning();
    return log;
  }

  // Task methods
  async getTasksByUser(userId: number): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task;
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const now = new Date();
    const [task] = await db
      .insert(tasks)
      .values({
        ...taskData,
        isCompleted: false,
        completedAt: null,
        completedBy: null,
        createdAt: now
      })
      .returning();
    return task;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async completeTask(id: number, completedBy: number): Promise<Task | undefined> {
    const now = new Date();
    const [task] = await db
      .update(tasks)
      .set({
        isCompleted: true,
        completedAt: now,
        completedBy
      })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    return true; // Assuming the delete was successful
  }

  // Notification methods
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const now = new Date();
    const [notification] = await db
      .insert(notifications)
      .values({
        ...notificationData,
        isRead: false,
        createdAt: now
      })
      .returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));
    return true; // Assuming the delete was successful
  }
}

export const storage = new DatabaseStorage();
