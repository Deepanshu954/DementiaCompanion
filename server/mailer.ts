
import { User } from "@shared/schema";
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL || 'ashneet2005@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'ashneet140305'
      }
    });
  }

  private async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SENDER_EMAIL || 'ashneet2005@gmail.com',
        to,
        subject,
        text
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendMedicationReminder(recipient: User, medicationName: string, dosage: string, time: string): Promise<boolean> {
    const subject = `Medication Reminder: ${medicationName}`;
    const text = `Hello ${recipient.fullName}, this is a reminder to take ${medicationName} (${dosage}) at ${time}.`;
    return this.sendMail(recipient.email, subject, text);
  }

  async sendTaskReminder(recipient: User, taskTitle: string, description: string, dueTime: string): Promise<boolean> {
    const subject = `Task Reminder: ${taskTitle}`;
    const text = `Hello ${recipient.fullName}, this is a reminder for your task: ${taskTitle} - ${description}. Due at ${dueTime}.`;
    return this.sendMail(recipient.email, subject, text);
  }

  async sendPatientUpdateToCaretaker(caretaker: User, patient: User, updateType: string, details: string): Promise<boolean> {
    const subject = `Update for your patient ${patient.fullName}`;
    const text = `Hello ${caretaker.fullName}, there's an update for ${patient.fullName}: ${updateType} - ${details}`;
    return this.sendMail(caretaker.email, subject, text);
  }

  async sendAssignmentNotification(patient: User, caretaker: User): Promise<boolean> {
    // Send to patient
    await this.sendMail(
      patient.email,
      'New Caretaker Assignment',
      `Hello ${patient.fullName}, ${caretaker.fullName} has been assigned as your caretaker.`
    );

    // Send to caretaker
    return this.sendMail(
      caretaker.email,
      'New Patient Assignment',
      `Hello ${caretaker.fullName}, you have been assigned to care for ${patient.fullName}.`
    );
  }
}

export const emailService = new EmailService();
