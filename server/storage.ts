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
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private caretakerProfiles: Map<number, CaretakerProfile>;
  private assignments: Map<number, Assignment>;
  private medications: Map<number, Medication>;
  private medicationLogs: Map<number, MedicationLog>;
  private tasks: Map<number, Task>;
  private notifications: Map<number, Notification>;
  sessionStore: session.SessionStore;
  
  private currentIds: {
    users: number;
    caretakerProfiles: number;
    assignments: number;
    medications: number;
    medicationLogs: number;
    tasks: number;
    notifications: number;
  };

  constructor() {
    this.users = new Map();
    this.caretakerProfiles = new Map();
    this.assignments = new Map();
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.tasks = new Map();
    this.notifications = new Map();
    
    this.currentIds = {
      users: 1,
      caretakerProfiles: 1,
      assignments: 1,
      medications: 1,
      medicationLogs: 1,
      tasks: 1,
      notifications: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Caretaker profile methods
  async getCaretakerProfile(userId: number): Promise<CaretakerProfile | undefined> {
    return Array.from(this.caretakerProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createCaretakerProfile(profile: InsertCaretakerProfile): Promise<CaretakerProfile> {
    const id = this.currentIds.caretakerProfiles++;
    const caretakerProfile: CaretakerProfile = { 
      ...profile, 
      id, 
      rating: 0, 
      reviewCount: 0 
    };
    this.caretakerProfiles.set(id, caretakerProfile);
    return caretakerProfile;
  }

  async updateCaretakerProfile(userId: number, profileData: Partial<InsertCaretakerProfile>): Promise<CaretakerProfile | undefined> {
    const profile = await this.getCaretakerProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.caretakerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async searchCaretakers(filters: CaretakerSearchFilters): Promise<(CaretakerProfile & { user: User })[]> {
    const allProfiles = Array.from(this.caretakerProfiles.values());
    
    const filteredProfiles = allProfiles.filter(profile => {
      let match = true;
      
      if (filters.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) {
        match = false;
      }
      
      if (filters.minPrice !== undefined && profile.pricePerDay < filters.minPrice) {
        match = false;
      }
      
      if (filters.maxPrice !== undefined && profile.pricePerDay > filters.maxPrice) {
        match = false;
      }
      
      if (filters.specialization && !profile.specializations.some(s => 
        s.toLowerCase().includes(filters.specialization!.toLowerCase())
      )) {
        match = false;
      }
      
      if (filters.isCertified !== undefined && profile.isCertified !== filters.isCertified) {
        match = false;
      }
      
      if (filters.isBackgroundChecked !== undefined && profile.isBackgroundChecked !== filters.isBackgroundChecked) {
        match = false;
      }
      
      if (filters.isAvailable !== undefined && profile.isAvailable !== filters.isAvailable) {
        match = false;
      }
      
      return match;
    });
    
    return filteredProfiles.map(profile => {
      const user = this.users.get(profile.userId)!;
      return { ...profile, user };
    });
  }

  // Assignment methods
  async getAssignmentsByPatient(patientId: number): Promise<(Assignment & { caretaker: User & { profile?: CaretakerProfile } })[]> {
    const assignments = Array.from(this.assignments.values()).filter(
      assignment => assignment.patientId === patientId
    );
    
    return assignments.map(assignment => {
      const caretaker = this.users.get(assignment.caretakerId)!;
      const profile = this.getCaretakerProfile(caretaker.id);
      return { 
        ...assignment, 
        caretaker: { ...caretaker, profile: profile || undefined }
      };
    });
  }

  async getAssignmentsByCaretaker(caretakerId: number): Promise<(Assignment & { patient: User })[]> {
    const assignments = Array.from(this.assignments.values()).filter(
      assignment => assignment.caretakerId === caretakerId
    );
    
    return assignments.map(assignment => {
      const patient = this.users.get(assignment.patientId)!;
      return { ...assignment, patient };
    });
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const id = this.currentIds.assignments++;
    const assignment: Assignment = { ...assignmentData, id };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment = { ...assignment, ...data };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  // Medication methods
  async getMedicationsByUser(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      medication => medication.userId === userId
    );
  }

  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(medicationData: InsertMedication): Promise<Medication> {
    const id = this.currentIds.medications++;
    const now = new Date();
    const medication: Medication = { 
      ...medicationData, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { 
      ...medication, 
      ...data, 
      updatedAt: new Date() 
    };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }

  // Medication log methods
  async getMedicationLogsByMedication(medicationId: number): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values()).filter(
      log => log.medicationId === medicationId
    );
  }

  async createMedicationLog(logData: InsertMedicationLog): Promise<MedicationLog> {
    const id = this.currentIds.medicationLogs++;
    const log: MedicationLog = { ...logData, id };
    this.medicationLogs.set(id, log);
    return log;
  }

  // Task methods
  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.userId === userId
    );
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const id = this.currentIds.tasks++;
    const now = new Date();
    const task: Task = { 
      ...taskData, 
      id, 
      isCompleted: false, 
      completedAt: null,
      completedBy: null,
      createdAt: now 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async completeTask(id: number, completedBy: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { 
      ...task, 
      isCompleted: true, 
      completedAt: new Date(),
      completedBy 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Notification methods
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId
    );
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.currentIds.notifications++;
    const now = new Date();
    const notification: Notification = { 
      ...notificationData, 
      id, 
      isRead: false, 
      createdAt: now 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
}

export const storage = new MemStorage();
