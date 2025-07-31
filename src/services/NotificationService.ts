import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // For Android, set up notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('pet-reminders', {
          name: 'Pet Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleReminder(reminder: Reminder): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🐾 ${reminder.title}`,
          body: reminder.description || 'Time for your pet care activity!',
          data: {
            reminderId: reminder.id,
            petId: reminder.petId,
            type: reminder.type,
          },
          sound: true,
        },
        trigger: {
          date: reminder.scheduledDate,
        },
      });

      // Schedule recurring notifications if needed
      if (reminder.isRecurring && reminder.recurringPattern) {
        await this.scheduleRecurringReminders(reminder, notificationId);
      }

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  private async scheduleRecurringReminders(reminder: Reminder, baseNotificationId: string): Promise<void> {
    if (!reminder.recurringPattern) return;

    const recurringIds: string[] = [];
    const baseDate = new Date(reminder.scheduledDate);

    // Schedule up to 10 recurring notifications
    for (let i = 1; i <= 10; i++) {
      const nextDate = this.calculateNextDate(baseDate, reminder.recurringPattern, i);
      
      try {
        const recurringId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🐾 ${reminder.title} (Recurring)`,
            body: reminder.description || 'Time for your recurring pet care activity!',
            data: {
              reminderId: reminder.id,
              petId: reminder.petId,
              type: reminder.type,
              isRecurring: true,
              occurrence: i,
            },
            sound: true,
          },
          trigger: {
            date: nextDate,
          },
        });
        
        recurringIds.push(recurringId);
      } catch (error) {
        console.error(`Error scheduling recurring notification ${i}:`, error);
      }
    }
  }

  private calculateNextDate(baseDate: Date, pattern: string, occurrence: number): Date {
    const nextDate = new Date(baseDate);
    
    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + occurrence);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (occurrence * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + occurrence);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + occurrence);
        break;
    }
    
    return nextDate;
  }

  async cancelReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Send immediate notification for urgent health alerts
  async sendUrgentHealthAlert(petName: string, issue: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ Health Alert: ${petName}`,
          body: `Urgent: ${issue}. Please consult a veterinarian immediately.`,
          data: {
            type: 'health_alert',
            urgent: true,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending urgent health alert:', error);
    }
  }

  // Send vaccination reminder
  async sendVaccinationReminder(petName: string, vaccineName: string, dueDate: Date): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💉 Vaccination Reminder: ${petName}`,
          body: `${vaccineName} vaccination is due in ${daysUntilDue} days`,
          data: {
            type: 'vaccination_reminder',
            petName,
            vaccineName,
            dueDate: dueDate.toISOString(),
          },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending vaccination reminder:', error);
    }
  }

  // Send medication reminder
  async sendMedicationReminder(petName: string, medicationName: string, dosage: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Medication Time: ${petName}`,
          body: `Time to give ${medicationName} (${dosage})`,
          data: {
            type: 'medication_reminder',
            petName,
            medicationName,
            dosage,
          },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending medication reminder:', error);
    }
  }

  // Schedule vet appointment reminder
  async scheduleVetReminder(petName: string, appointmentDate: Date, veterinarian: string): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Schedule reminder 1 day before appointment
      const reminderDate = new Date(appointmentDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🏥 Vet Appointment Tomorrow: ${petName}`,
          body: `Appointment with ${veterinarian} at ${appointmentDate.toLocaleTimeString()}`,
          data: {
            type: 'vet_reminder',
            petName,
            veterinarian,
            appointmentDate: appointmentDate.toISOString(),
          },
          sound: true,
        },
        trigger: {
          date: reminderDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling vet reminder:', error);
      return null;
    }
  }

  // Handle notification responses
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export default new NotificationService();