import { User } from "@shared/schema";

// Since we can't use actual email services in this environment, we'll
// simulate the email functionality for demonstration purposes
export class EmailService {
  async sendMedicationReminder(recipient: User, medicationName: string, dosage: string, time: string): Promise<boolean> {
    // Log the email instead of actually sending it
    console.log(`[EMAIL] To: ${recipient.email}`);
    console.log(`[EMAIL] Subject: Medication Reminder: ${medicationName}`);
    console.log(`[EMAIL] Body: Hello ${recipient.fullName}, this is a reminder to take ${medicationName} (${dosage}) at ${time}.`);
    
    return true;
  }

  async sendTaskReminder(recipient: User, taskTitle: string, description: string, dueTime: string): Promise<boolean> {
    console.log(`[EMAIL] To: ${recipient.email}`);
    console.log(`[EMAIL] Subject: Task Reminder: ${taskTitle}`);
    console.log(`[EMAIL] Body: Hello ${recipient.fullName}, this is a reminder for your task: ${taskTitle} - ${description}. Due at ${dueTime}.`);
    
    return true;
  }

  async sendPatientUpdateToCaretaker(caretaker: User, patient: User, updateType: string, details: string): Promise<boolean> {
    console.log(`[EMAIL] To: ${caretaker.email}`);
    console.log(`[EMAIL] Subject: Update for your patient ${patient.fullName}`);
    console.log(`[EMAIL] Body: Hello ${caretaker.fullName}, there's an update for ${patient.fullName}: ${updateType} - ${details}`);
    
    return true;
  }

  async sendAssignmentNotification(patient: User, caretaker: User): Promise<boolean> {
    // Notify patient about caretaker assignment
    console.log(`[EMAIL] To: ${patient.email}`);
    console.log(`[EMAIL] Subject: New Caretaker Assignment`);
    console.log(`[EMAIL] Body: Hello ${patient.fullName}, ${caretaker.fullName} has been assigned as your caretaker.`);

    // Notify caretaker about patient assignment
    console.log(`[EMAIL] To: ${caretaker.email}`);
    console.log(`[EMAIL] Subject: New Patient Assignment`);
    console.log(`[EMAIL] Body: Hello ${caretaker.fullName}, you have been assigned to care for ${patient.fullName}.`);
    
    return true;
  }
}

export const emailService = new EmailService();
