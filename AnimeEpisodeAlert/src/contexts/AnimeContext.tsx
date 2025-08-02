import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAnime, Anime } from '../types';

interface AnimeContextType {
  userAnimeList: UserAnime[];
  addAnimeToList: (anime: Anime) => Promise<void>;
  removeAnimeFromList: (animeId: number) => Promise<void>;
  toggleNotifications: (animeId: number) => Promise<void>;
  isAnimeInList: (animeId: number) => boolean;
  loading: boolean;
  updateLastCheckedEpisode: (animeId: number, episodeNumber: number) => Promise<void>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

const STORAGE_KEY = '@anime_list';

interface AnimeProviderProps {
  children: ReactNode;
}

export const AnimeProvider: React.FC<AnimeProviderProps> = ({ children }) => {
  const [userAnimeList, setUserAnimeList] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnimeList();
  }, []);

  const loadAnimeList = async () => {
    try {
      const storedList = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedList) {
        setUserAnimeList(JSON.parse(storedList));
      }
    } catch (error) {
      console.error('Error loading anime list:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnimeList = async (list: UserAnime[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setUserAnimeList(list);
    } catch (error) {
      console.error('Error saving anime list:', error);
    }
  };

  const addAnimeToList = async (anime: Anime) => {
    const newUserAnime: UserAnime = {
      anime,
      notifications: true,
      lastCheckedEpisode: 0,
      dateAdded: new Date().toISOString(),
    };
    
    const updatedList = [...userAnimeList, newUserAnime];
    await saveAnimeList(updatedList);
  };

  const removeAnimeFromList = async (animeId: number) => {
    const updatedList = userAnimeList.filter(
      (userAnime) => userAnime.anime.mal_id !== animeId
    );
    await saveAnimeList(updatedList);
  };

  const toggleNotifications = async (animeId: number) => {
    const updatedList = userAnimeList.map((userAnime) => {
      if (userAnime.anime.mal_id === animeId) {
        return { ...userAnime, notifications: !userAnime.notifications };
      }
      return userAnime;
    });
    await saveAnimeList(updatedList);
  };

  const updateLastCheckedEpisode = async (animeId: number, episodeNumber: number) => {
    const updatedList = userAnimeList.map((userAnime) => {
      if (userAnime.anime.mal_id === animeId) {
        return { ...userAnime, lastCheckedEpisode: episodeNumber };
      }
      return userAnime;
    });
    await saveAnimeList(updatedList);
  };

  const isAnimeInList = (animeId: number): boolean => {
    return userAnimeList.some((userAnime) => userAnime.anime.mal_id === animeId);
  };

  const value: AnimeContextType = {
    userAnimeList,
    addAnimeToList,
    removeAnimeFromList,
    toggleNotifications,
    isAnimeInList,
    loading,
    updateLastCheckedEpisode,
  };

  return (
    <AnimeContext.Provider value={value}>
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = (): AnimeContextType => {
  const context = useContext(AnimeContext);
  if (context === undefined) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
};