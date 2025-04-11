import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { reminderScheduler } from "./scheduler";
import { emailService } from "./mailer";
import { z } from "zod";
import { 
  insertMedicationSchema,
  insertTaskSchema,
  insertCaretakerProfileSchema,
  insertAssignmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Caretaker routes
  app.get("/api/caretakers", async (req, res) => {
    try {
      const location = req.query.location as string | undefined;
      const specialization = req.query.specialization as string | undefined;
      
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      
      const isCertified = req.query.isCertified ? Boolean(req.query.isCertified === 'true') : undefined;
      const isBackgroundChecked = req.query.isBackgroundChecked ? Boolean(req.query.isBackgroundChecked === 'true') : undefined;
      const isAvailable = req.query.isAvailable ? Boolean(req.query.isAvailable === 'true') : undefined;
      
      const caretakers = await storage.searchCaretakers({
        location,
        minPrice,
        maxPrice,
        specialization,
        isCertified,
        isBackgroundChecked,
        isAvailable
      });
      
      // Remove password from user objects
      const sanitizedCaretakers = caretakers.map(({ user, ...profile }) => {
        const { password, ...userWithoutPassword } = user;
        return { ...profile, user: userWithoutPassword };
      });
      
      res.json(sanitizedCaretakers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch caretakers", error: (error as Error).message });
    }
  });

  app.get("/api/caretakers/:id/location", async (req, res) => {
    try {
      // Mock location data for development
      res.json({
        latitude: 42.3601,
        longitude: -71.0589,
        address: "Boston Medical Center, Boston, MA"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.post("/api/caretakers/:id/contact", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // For development, just acknowledge the message
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/caretakers/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // For development/testing, return mock data
      const mockCaretaker = {
        id: userId,
        userId: userId,
        user: {
          fullName: "Emma Wilson",
          email: "emma.wilson@example.com"
        },
        bio: "Certified nurse with specialized training in dementia care.",
        pricePerDay: 180,
        location: "Boston, MA",
        serviceAreas: ["Boston", "Cambridge"],
        gender: "female",
        age: 32,
        yearsExperience: 8,
        specializations: ["Alzheimer's care", "Medication management"],
        isCertified: true,
        isBackgroundChecked: true,
        isAvailable: true,
        providesLiveLocation: true,
        rating: 4.8,
        reviewCount: 32,
        imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
        phoneNumber: "+1 (555) 123-4567"
      };

      res.json(mockCaretaker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch caretaker profile", error: (error as Error).message });
    }
  });

  // Caretaker profile routes
  app.post("/api/caretaker/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "caretaker") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const existingProfile = await storage.getCaretakerProfile(req.user.id);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      
      const profileData = insertCaretakerProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const profile = await storage.createCaretakerProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile", error: (error as Error).message });
    }
  });

  app.put("/api/caretaker/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "caretaker") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const existingProfile = await storage.getCaretakerProfile(req.user.id);
      
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updatedProfile = await storage.updateCaretakerProfile(req.user.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile", error: (error as Error).message });
    }
  });

  // Assignment routes
  app.post("/api/assignments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate assignment data
      const assignmentData = insertAssignmentSchema.parse(req.body);
      
      // Check if user is patient or caretaker
      if (req.user.role === "patient" && assignmentData.patientId !== req.user.id) {
        return res.status(403).json({ message: "Patients can only create assignments for themselves" });
      }
      
      // Check if caretaker exists
      const caretaker = await storage.getUser(assignmentData.caretakerId);
      if (!caretaker || caretaker.role !== "caretaker") {
        return res.status(404).json({ message: "Caretaker not found" });
      }
      
      // Check if patient exists
      const patient = await storage.getUser(assignmentData.patientId);
      if (!patient || patient.role !== "patient") {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Create the assignment
      const assignment = await storage.createAssignment(assignmentData);
      
      // Send email notifications
      await emailService.sendAssignmentNotification(patient, caretaker);
      
      // Create notifications for both patient and caretaker
      await storage.createNotification({
        userId: patient.id,
        type: "assignment",
        title: "New Caretaker Assigned",
        message: `${caretaker.fullName} has been assigned as your caretaker.`,
        referenceId: assignment.id
      });
      
      await storage.createNotification({
        userId: caretaker.id,
        type: "assignment",
        title: "New Patient Assigned",
        message: `You have been assigned to care for ${patient.fullName}.`,
        referenceId: assignment.id
      });
      
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assignment", error: (error as Error).message });
    }
  });

  app.get("/api/patient/assignments", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "patient") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignments = await storage.getAssignmentsByPatient(req.user.id);
      
      // Remove passwords from caretaker objects
      const sanitizedAssignments = assignments.map(({ caretaker, ...assignment }) => {
        const { password, ...caretakerWithoutPassword } = caretaker;
        return { ...assignment, caretaker: caretakerWithoutPassword };
      });
      
      res.json(sanitizedAssignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments", error: (error as Error).message });
    }
  });

  app.get("/api/caretaker/assignments", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "caretaker") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
      
      // Remove passwords from patient objects
      const sanitizedAssignments = assignments.map(({ patient, ...assignment }) => {
        const { password, ...patientWithoutPassword } = patient;
        return { ...assignment, patient: patientWithoutPassword };
      });
      
      res.json(sanitizedAssignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments", error: (error as Error).message });
    }
  });

  // Medication routes
  app.get("/api/medications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      let userId = req.user.id;
      
      // If caretaker, allow fetching medications for assigned patients
      if (req.user.role === "caretaker" && req.query.patientId) {
        userId = Number(req.query.patientId);
        
        // Check if caretaker is assigned to this patient
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "You are not assigned to this patient" });
        }
      }
      
      const medications = await storage.getMedicationsByUser(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications", error: (error as Error).message });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      let userId = req.user.id;
      
      // If caretaker, allow creating medications for assigned patients
      if (req.user.role === "caretaker" && req.body.userId) {
        userId = Number(req.body.userId);
        
        // Check if caretaker is assigned to this patient
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "You are not assigned to this patient" });
        }
      }
      
      const medicationData = insertMedicationSchema.parse({
        ...req.body,
        userId
      });
      
      const medication = await storage.createMedication(medicationData);
      
      // Schedule reminder for this medication
      await reminderScheduler.scheduleMedicationReminders(userId);
      
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create medication", error: (error as Error).message });
    }
  });

  app.put("/api/medications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      // Check if user owns this medication or is assigned caretaker
      if (medication.userId !== req.user.id && req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this medication
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === medication.userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedMedication = await storage.updateMedication(medicationId, req.body);
      
      // Update reminders
      await reminderScheduler.scheduleMedicationReminders(medication.userId);
      
      res.json(updatedMedication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medication", error: (error as Error).message });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      // Check if user owns this medication or is assigned caretaker
      if (medication.userId !== req.user.id && req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this medication
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === medication.userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteMedication(medicationId);
      
      // Update reminders
      await reminderScheduler.scheduleMedicationReminders(medication.userId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication", error: (error as Error).message });
    }
  });

  app.post("/api/medications/:id/logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      // Check if user owns this medication or is assigned caretaker
      let canLog = false;
      let caretakerId = null;
      
      if (medication.userId === req.user.id) {
        canLog = true;
      } else if (req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this medication
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        canLog = assignments.some(a => a.patientId === medication.userId && a.isActive);
        caretakerId = req.user.id;
      }
      
      if (!canLog) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const log = await storage.createMedicationLog({
        medicationId,
        takenAt: new Date(),
        takenBy: caretakerId,
        notes: req.body.notes || ""
      });
      
      // Notify caretaker if patient took medication themselves
      if (medication.userId === req.user.id) {
        const patientAssignments = await storage.getAssignmentsByPatient(req.user.id);
        const activeAssignments = patientAssignments.filter(a => a.isActive);
        
        // Get patient user
        const patient = await storage.getUser(req.user.id);
        
        for (const assignment of activeAssignments) {
          const caretaker = await storage.getUser(assignment.caretakerId);
          
          if (caretaker && patient) {
            // Send email notification
            await emailService.sendPatientUpdateToCaretaker(
              caretaker,
              patient,
              "Medication Taken",
              `${patient.fullName} has taken ${medication.name} (${medication.dosage})`
            );
            
            // Create notification
            await storage.createNotification({
              userId: caretaker.id,
              type: "medication",
              title: "Medication Taken",
              message: `${patient.fullName} has taken ${medication.name} (${medication.dosage})`,
              referenceId: medication.id
            });
          }
        }
      }
      
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to log medication", error: (error as Error).message });
    }
  });

  app.get("/api/medications/:id/logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      // Check if user owns this medication or is assigned caretaker
      if (medication.userId !== req.user.id && req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this medication
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === medication.userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const logs = await storage.getMedicationLogsByMedication(medicationId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication logs", error: (error as Error).message });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      let userId = req.user.id;
      
      // If caretaker, allow fetching tasks for assigned patients
      if (req.user.role === "caretaker" && req.query.patientId) {
        userId = Number(req.query.patientId);
        
        // Check if caretaker is assigned to this patient
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "You are not assigned to this patient" });
        }
      }
      
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks", error: (error as Error).message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      let userId = req.user.id;
      
      // If caretaker, allow creating tasks for assigned patients
      if (req.user.role === "caretaker" && req.body.userId) {
        userId = Number(req.body.userId);
        
        // Check if caretaker is assigned to this patient
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "You are not assigned to this patient" });
        }
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId
      });
      
      const task = await storage.createTask(taskData);
      
      // Schedule reminder for this task
      await reminderScheduler.scheduleTaskReminders(userId);
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task", error: (error as Error).message });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const taskId = parseInt(req.params.id);
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task or is assigned caretaker
      if (task.userId !== req.user.id && req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this task
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === task.userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      
      // Update reminders
      await reminderScheduler.scheduleTaskReminders(task.userId);
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task", error: (error as Error).message });
    }
  });

  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const taskId = parseInt(req.params.id);
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task or is assigned caretaker
      let canComplete = false;
      
      if (task.userId === req.user.id) {
        canComplete = true;
      } else if (req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this task
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        canComplete = assignments.some(a => a.patientId === task.userId && a.isActive);
      }
      
      if (!canComplete) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const completedTask = await storage.completeTask(taskId, req.user.id);
      
      // Notify caretaker if patient completed task themselves
      if (task.userId === req.user.id) {
        const patientAssignments = await storage.getAssignmentsByPatient(req.user.id);
        const activeAssignments = patientAssignments.filter(a => a.isActive);
        
        // Get patient user
        const patient = await storage.getUser(req.user.id);
        
        for (const assignment of activeAssignments) {
          const caretaker = await storage.getUser(assignment.caretakerId);
          
          if (caretaker && patient) {
            // Send email notification
            await emailService.sendPatientUpdateToCaretaker(
              caretaker,
              patient,
              "Task Completed",
              `${patient.fullName} has completed the task: ${task.title}`
            );
            
            // Create notification
            await storage.createNotification({
              userId: caretaker.id,
              type: "task",
              title: "Task Completed",
              message: `${patient.fullName} has completed the task: ${task.title}`,
              referenceId: task.id
            });
          }
        }
      }
      
      // Update reminders
      await reminderScheduler.scheduleTaskReminders(task.userId);
      
      res.json(completedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task", error: (error as Error).message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const taskId = parseInt(req.params.id);
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task or is assigned caretaker
      if (task.userId !== req.user.id && req.user.role === "caretaker") {
        // Check if caretaker is assigned to the patient who owns this task
        const assignments = await storage.getAssignmentsByCaretaker(req.user.id);
        const isAssigned = assignments.some(a => a.patientId === task.userId && a.isActive);
        
        if (!isAssigned) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteTask(taskId);
      
      // Update reminders
      await reminderScheduler.scheduleTaskReminders(task.userId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task", error: (error as Error).message });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications", error: (error as Error).message });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationRead(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read", error: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
