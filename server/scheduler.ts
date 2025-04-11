import { storage } from "./storage";
import { emailService } from "./mailer";

class ReminderScheduler {
  private medicationTimers: Map<number, NodeJS.Timeout>;
  private taskTimers: Map<number, NodeJS.Timeout>;
  
  constructor() {
    this.medicationTimers = new Map();
    this.taskTimers = new Map();
  }
  
  // Initialize all reminders for a user
  async initializeUserReminders(userId: number): Promise<void> {
    await this.scheduleMedicationReminders(userId);
    await this.scheduleTaskReminders(userId);
  }
  
  // Schedule medication reminders for a user
  async scheduleMedicationReminders(userId: number): Promise<void> {
    try {
      const medications = await storage.getMedicationsByUser(userId);
      const user = await storage.getUser(userId);
      
      if (!user) return;
      
      // Clear any existing timers for this user's medications
      medications.forEach(med => {
        if (this.medicationTimers.has(med.id)) {
          clearTimeout(this.medicationTimers.get(med.id)!);
          this.medicationTimers.delete(med.id);
        }
      });
      
      // Schedule new reminders
      medications.forEach(medication => {
        try {
          const schedule = JSON.parse(medication.schedule);
          
          if (Array.isArray(schedule)) {
            schedule.forEach(time => {
              const reminderTime = this.calculateNextReminderTime(time);
              if (reminderTime) {
                const timeoutId = setTimeout(async () => {
                  // Send medication reminder
                  await emailService.sendMedicationReminder(
                    user,
                    medication.name,
                    medication.dosage,
                    time
                  );
                  
                  // Create notification
                  await storage.createNotification({
                    userId: user.id,
                    type: "medication",
                    title: "Medication Reminder",
                    message: `Time to take ${medication.name} (${medication.dosage})`,
                    referenceId: medication.id
                  });
                  
                  // Reschedule for next occurrence
                  this.scheduleMedicationReminders(userId);
                }, reminderTime.getTime() - Date.now());
                
                this.medicationTimers.set(medication.id, timeoutId);
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing schedule for medication ${medication.id}:`, error);
        }
      });
    } catch (error) {
      console.error("Error scheduling medication reminders:", error);
    }
  }
  
  // Schedule task reminders for a user
  async scheduleTaskReminders(userId: number): Promise<void> {
    try {
      const tasks = await storage.getTasksByUser(userId);
      const user = await storage.getUser(userId);
      
      if (!user) return;
      
      // Clear any existing timers for this user's tasks
      tasks.forEach(task => {
        if (this.taskTimers.has(task.id)) {
          clearTimeout(this.taskTimers.get(task.id)!);
          this.taskTimers.delete(task.id);
        }
      });
      
      // Schedule new reminders for incomplete tasks
      tasks
        .filter(task => !task.isCompleted)
        .forEach(task => {
          const dueDate = new Date(task.dueDate);
          
          // Only schedule if due date is in the future
          if (dueDate.getTime() > Date.now()) {
            // Reminder 30 minutes before due time
            const reminderTime = new Date(dueDate.getTime() - 30 * 60 * 1000);
            
            if (reminderTime.getTime() > Date.now()) {
              const timeoutId = setTimeout(async () => {
                // Send task reminder
                await emailService.sendTaskReminder(
                  user,
                  task.title,
                  task.description || "",
                  dueDate.toLocaleTimeString()
                );
                
                // Create notification
                await storage.createNotification({
                  userId: user.id,
                  type: "task",
                  title: "Task Reminder",
                  message: `Upcoming task: ${task.title}`,
                  referenceId: task.id
                });
              }, reminderTime.getTime() - Date.now());
              
              this.taskTimers.set(task.id, timeoutId);
            }
          }
        });
    } catch (error) {
      console.error("Error scheduling task reminders:", error);
    }
  }
  
  // Helper to calculate next reminder time from a time string (HH:MM)
  private calculateNextReminderTime(timeString: string): Date | null {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return null;
      }
      
      const now = new Date();
      const reminderTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
      );
      
      // If the time has already passed today, schedule for tomorrow
      if (reminderTime.getTime() <= now.getTime()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      return reminderTime;
    } catch (error) {
      console.error("Error calculating reminder time:", error);
      return null;
    }
  }
  
  // Clear all reminder schedules
  clearAllReminders(): void {
    this.medicationTimers.forEach(timer => clearTimeout(timer));
    this.taskTimers.forEach(timer => clearTimeout(timer));
    
    this.medicationTimers.clear();
    this.taskTimers.clear();
  }
}

export const reminderScheduler = new ReminderScheduler();
