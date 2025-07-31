import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, HealthRecord, Reminder, User, AIAnalysis } from '../types';

interface AppState {
  user: User | null;
  pets: Pet[];
  healthRecords: HealthRecord[];
  reminders: Reminder[];
  aiAnalyses: AIAnalysis[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_PET'; payload: Pet }
  | { type: 'UPDATE_PET'; payload: Pet }
  | { type: 'DELETE_PET'; payload: string }
  | { type: 'SET_PETS'; payload: Pet[] }
  | { type: 'ADD_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'UPDATE_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'DELETE_HEALTH_RECORD'; payload: string }
  | { type: 'SET_HEALTH_RECORDS'; payload: HealthRecord[] }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'ADD_AI_ANALYSIS'; payload: AIAnalysis }
  | { type: 'SET_AI_ANALYSES'; payload: AIAnalysis[] };

const initialState: AppState = {
  user: null,
  pets: [],
  healthRecords: [],
  reminders: [],
  aiAnalyses: [],
  isLoading: true,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_PET':
      return { ...state, pets: [...state.pets, action.payload] };
    case 'UPDATE_PET':
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === action.payload.id ? action.payload : pet
        ),
      };
    case 'DELETE_PET':
      return {
        ...state,
        pets: state.pets.filter(pet => pet.id !== action.payload),
        healthRecords: state.healthRecords.filter(record => record.petId !== action.payload),
        reminders: state.reminders.filter(reminder => reminder.petId !== action.payload),
      };
    case 'SET_PETS':
      return { ...state, pets: action.payload };
    case 'ADD_HEALTH_RECORD':
      return { ...state, healthRecords: [...state.healthRecords, action.payload] };
    case 'UPDATE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'DELETE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.filter(record => record.id !== action.payload),
      };
    case 'SET_HEALTH_RECORDS':
      return { ...state, healthRecords: action.payload };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(reminder =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(reminder => reminder.id !== action.payload),
      };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.payload };
    case 'ADD_AI_ANALYSIS':
      return { ...state, aiAnalyses: [...state.aiAnalyses, action.payload] };
    case 'SET_AI_ANALYSES':
      return { ...state, aiAnalyses: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  savePet: (pet: Pet) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  saveHealthRecord: (record: HealthRecord) => Promise<void>;
  deleteHealthRecord: (recordId: string) => Promise<void>;
  saveReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  saveAIAnalysis: (analysis: AIAnalysis) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [petsData, healthRecordsData, remindersData, aiAnalysesData, userData] = await Promise.all([
        AsyncStorage.getItem('pets'),
        AsyncStorage.getItem('healthRecords'),
        AsyncStorage.getItem('reminders'),
        AsyncStorage.getItem('aiAnalyses'),
        AsyncStorage.getItem('user'),
      ]);

      if (petsData) {
        const pets = JSON.parse(petsData).map((pet: any) => ({
          ...pet,
          dateOfBirth: new Date(pet.dateOfBirth),
          createdAt: new Date(pet.createdAt),
          updatedAt: new Date(pet.updatedAt),
        }));
        dispatch({ type: 'SET_PETS', payload: pets });
      }

      if (healthRecordsData) {
        const healthRecords = JSON.parse(healthRecordsData).map((record: any) => ({
          ...record,
          date: new Date(record.date),
          nextDueDate: record.nextDueDate ? new Date(record.nextDueDate) : undefined,
          createdAt: new Date(record.createdAt),
        }));
        dispatch({ type: 'SET_HEALTH_RECORDS', payload: healthRecords });
      }

      if (remindersData) {
        const reminders = JSON.parse(remindersData).map((reminder: any) => ({
          ...reminder,
          scheduledDate: new Date(reminder.scheduledDate),
        }));
        dispatch({ type: 'SET_REMINDERS', payload: reminders });
      }

      if (aiAnalysesData) {
        const aiAnalyses = JSON.parse(aiAnalysesData).map((analysis: any) => ({
          ...analysis,
          analysisDate: new Date(analysis.analysisDate),
        }));
        dispatch({ type: 'SET_AI_ANALYSES', payload: aiAnalyses });
      }

      if (userData) {
        const user = JSON.parse(userData);
        user.createdAt = new Date(user.createdAt);
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const savePet = async (pet: Pet) => {
    try {
      const existingPetIndex = state.pets.findIndex(p => p.id === pet.id);
      let updatedPets;
      
      if (existingPetIndex >= 0) {
        updatedPets = [...state.pets];
        updatedPets[existingPetIndex] = pet;
        dispatch({ type: 'UPDATE_PET', payload: pet });
      } else {
        updatedPets = [...state.pets, pet];
        dispatch({ type: 'ADD_PET', payload: pet });
      }

      await AsyncStorage.setItem('pets', JSON.stringify(updatedPets));
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const deletePet = async (petId: string) => {
    try {
      const updatedPets = state.pets.filter(pet => pet.id !== petId);
      const updatedHealthRecords = state.healthRecords.filter(record => record.petId !== petId);
      const updatedReminders = state.reminders.filter(reminder => reminder.petId !== petId);

      dispatch({ type: 'DELETE_PET', payload: petId });

      await Promise.all([
        AsyncStorage.setItem('pets', JSON.stringify(updatedPets)),
        AsyncStorage.setItem('healthRecords', JSON.stringify(updatedHealthRecords)),
        AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders)),
      ]);
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const saveHealthRecord = async (record: HealthRecord) => {
    try {
      const existingRecordIndex = state.healthRecords.findIndex(r => r.id === record.id);
      let updatedRecords;

      if (existingRecordIndex >= 0) {
        updatedRecords = [...state.healthRecords];
        updatedRecords[existingRecordIndex] = record;
        dispatch({ type: 'UPDATE_HEALTH_RECORD', payload: record });
      } else {
        updatedRecords = [...state.healthRecords, record];
        dispatch({ type: 'ADD_HEALTH_RECORD', payload: record });
      }

      await AsyncStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error saving health record:', error);
    }
  };

  const deleteHealthRecord = async (recordId: string) => {
    try {
      const updatedRecords = state.healthRecords.filter(record => record.id !== recordId);
      dispatch({ type: 'DELETE_HEALTH_RECORD', payload: recordId });
      await AsyncStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error deleting health record:', error);
    }
  };

  const saveReminder = async (reminder: Reminder) => {
    try {
      const existingReminderIndex = state.reminders.findIndex(r => r.id === reminder.id);
      let updatedReminders;

      if (existingReminderIndex >= 0) {
        updatedReminders = [...state.reminders];
        updatedReminders[existingReminderIndex] = reminder;
        dispatch({ type: 'UPDATE_REMINDER', payload: reminder });
      } else {
        updatedReminders = [...state.reminders, reminder];
        dispatch({ type: 'ADD_REMINDER', payload: reminder });
      }

      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const updatedReminders = state.reminders.filter(reminder => reminder.id !== reminderId);
      dispatch({ type: 'DELETE_REMINDER', payload: reminderId });
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const saveAIAnalysis = async (analysis: AIAnalysis) => {
    try {
      const updatedAnalyses = [...state.aiAnalyses, analysis];
      dispatch({ type: 'ADD_AI_ANALYSIS', payload: analysis });
      await AsyncStorage.setItem('aiAnalyses', JSON.stringify(updatedAnalyses));
    } catch (error) {
      console.error('Error saving AI analysis:', error);
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    savePet,
    deletePet,
    saveHealthRecord,
    deleteHealthRecord,
    saveReminder,
    deleteReminder,
    saveAIAnalysis,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};