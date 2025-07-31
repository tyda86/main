export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  weight: number;
  color: string;
  microchipNumber?: string;
  profileImage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'medication' | 'vet_visit' | 'symptom' | 'behavior';
  title: string;
  description?: string;
  date: Date;
  nextDueDate?: Date;
  veterinarian?: string;
  cost?: number;
  images?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'scheduled' | 'overdue';
  createdAt: Date;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  dateGiven: Date;
  nextDueDate: Date;
  veterinarian: string;
  batchNumber?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  petId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  instructions: string;
  remainingDoses?: number;
}

export interface Reminder {
  id: string;
  petId: string;
  type: 'vaccination' | 'medication' | 'vet_visit' | 'grooming' | 'exercise' | 'feeding';
  title: string;
  description?: string;
  scheduledDate: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isCompleted: boolean;
  notificationEnabled: boolean;
}

export interface AIAnalysis {
  id: string;
  petId: string;
  imageUri: string;
  analysisDate: Date;
  detectedIssues: {
    type: string;
    confidence: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }[];
  overallHealthScore: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  location?: {
    city: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  pets: string[]; // Pet IDs
  createdAt: Date;
}

export interface PlaydateRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  petIds: string[];
  proposedDate: Date;
  location: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  petId?: string;
  content: string;
  images?: string[];
  tags: string[];
  likes: string[]; // User IDs
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export type RootStackParamList = {
  MainTabs: undefined;
  PetProfile: { petId: string };
  AddPet: undefined;
  EditPet: { petId: string };
  HealthRecord: { recordId: string };
  AddHealthRecord: { petId: string };
  VetVisit: { visitId: string };
  AIAnalysis: { petId: string };
  Playdate: { playdateId: string };
  CreatePlaydate: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Health: undefined;
  Community: undefined;
  Profile: undefined;
};