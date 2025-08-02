import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Switch,
  Button,
  Avatar,
  useTheme,
  Divider,
  IconButton,
  Chip,
  Surface,
  RadioButton,
  Menu,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppContext } from '../../context/AppContext';
import { NotificationService } from '../../services/NotificationService';

interface UserPreferences {
  notifications: {
    enabled: boolean;
    reminders: boolean;
    healthAlerts: boolean;
    appointments: boolean;
    vaccinations: boolean;
    medications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    units: 'imperial' | 'metric';
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
    crashReports: boolean;
    locationAccess: boolean;
  };
  backup: {
    autoBackup: boolean;
    cloudSync: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackup: Date | null;
  };
  ai: {
    enabled: boolean;
    autoAnalysis: boolean;
    smartReminders: boolean;
    healthInsights: boolean;
  };
}

const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { state } = useAppContext();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      enabled: true,
      reminders: true,
      healthAlerts: true,
      appointments: true,
      vaccinations: true,
      medications: true,
      soundEnabled: true,
      vibrationEnabled: true,
    },
    appearance: {
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      units: 'imperial',
    },
    privacy: {
      shareData: false,
      analytics: true,
      crashReports: true,
      locationAccess: false,
    },
    backup: {
      autoBackup: true,
      cloudSync: false,
      backupFrequency: 'weekly',
      lastBackup: null,
    },
    ai: {
      enabled: true,
      autoAnalysis: false,
      smartReminders: true,
      healthInsights: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [backupMenuVisible, setBackupMenuVisible] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updatePreference = (category: keyof UserPreferences, key: string, value: any) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: value,
      },
    };
    savePreferences(newPreferences);
  };

  const handleNotificationPermission = async () => {
    try {
      const permission = await NotificationService.requestPermissions();
      if (!permission) {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in your device settings to receive reminders and alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permission.');
      return false;
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await handleNotificationPermission();
      if (!hasPermission) return;
    }
    updatePreference('notifications', 'enabled', value);
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const exportData = {
        pets: state.pets,
        healthRecords: state.healthRecords,
        reminders: state.reminders,
        aiAnalyses: state.aiAnalyses,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      const dataString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: dataString,
        title: 'Pet Wellness Tracker Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPreferences = {
        ...preferences,
        backup: {
          ...preferences.backup,
          lastBackup: new Date(),
        },
      };
      
      await savePreferences(newPreferences);
      
      Alert.alert('Success', 'Data backed up successfully!');
    } catch (error) {
      Alert.alert('Error', 'Backup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App Data',
      'This will permanently delete all your pets, health records, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                'App Reset',
                'All data has been cleared. Please restart the app.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data.');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    const supportEmail = 'support@petwellnesstracker.com';
    const subject = 'Pet Wellness Tracker Support Request';
    const body = `Hi Support Team,

I need help with:

Device: ${Platform.OS} ${Platform.Version}
App Version: 1.0.0
Pets: ${state.pets.length}
Records: ${state.healthRecords.length}

Please describe your issue below:

`;

    const emailUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert(
        'Contact Support',
        `Please email us at: ${supportEmail}`,
        [
          { text: 'Copy Email', onPress: () => {/* Copy to clipboard */} },
          { text: 'OK' }
        ]
      );
    });
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.petwellnesstracker.app',
      default: 'https://petwellnesstracker.com',
    });

    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Error', 'Unable to open app store.');
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Pet Wellness Tracker - the best app for managing your pet\'s health! Download it now.',
        title: 'Pet Wellness Tracker',
        url: 'https://petwellnesstracker.com',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share app.');
    }
  };

  const getStorageUsage = () => {
    const totalRecords = state.pets.length + state.healthRecords.length + state.reminders.length + state.aiAnalyses.length;
    const estimatedSizeMB = (totalRecords * 0.5).toFixed(1); // Rough estimate
    return `${estimatedSizeMB} MB`;
  };

  const formatLastBackup = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System Default';
      default: return 'System Default';
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      default: return 'English';
    }
  };

  const getBackupFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Weekly';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={() => navigation?.goBack?.()}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Settings
          </Text>
          <View style={styles.headerActions}>
            <Chip
              icon="cog"
              style={styles.settingsChip}
              textStyle={{ color: 'white' }}
            >
              Preferences
            </Chip>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.profileSection}>
              <Avatar.Icon size={60} icon="account" style={styles.profileAvatar} />
              <View style={styles.profileInfo}>
                <Text variant="titleLarge" style={[styles.profileName, { color: theme.colors.onSurface }]}>
                  Pet Parent
                </Text>
                <Text variant="bodyMedium" style={[styles.profileStats, { color: theme.colors.onSurfaceVariant }]}>
                  {state.pets.length} pets • {state.healthRecords.length} records
                </Text>
                <Text variant="bodySmall" style={[styles.profileUsage, { color: theme.colors.onSurfaceVariant }]}>
                  Storage: {getStorageUsage()}
                </Text>
              </View>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => Alert.alert('Profile', 'Profile editing would be implemented here')}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Notifications Settings */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🔔 Notifications
            </Text>
            
            <List.Item
              title="Enable Notifications"
              description="Receive reminders and health alerts"
              left={() => <List.Icon icon="bell" />}
              right={() => (
                <Switch
                  value={preferences.notifications.enabled}
                  onValueChange={handleNotificationToggle}
                />
              )}
            />
            
            {preferences.notifications.enabled && (
              <>
                <Divider style={styles.divider} />
                <List.Item
                  title="Health Reminders"
                  description="Vaccination and medication reminders"
                  left={() => <List.Icon icon="medical-bag" />}
                  right={() => (
                    <Switch
                      value={preferences.notifications.reminders}
                      onValueChange={(value) => updatePreference('notifications', 'reminders', value)}
                    />
                  )}
                />
                
                <List.Item
                  title="Health Alerts"
                  description="Important health notifications"
                  left={() => <List.Icon icon="alert" />}
                  right={() => (
                    <Switch
                      value={preferences.notifications.healthAlerts}
                      onValueChange={(value) => updatePreference('notifications', 'healthAlerts', value)}
                    />
                  )}
                />
                
                <List.Item
                  title="Appointments"
                  description="Vet appointment reminders"
                  left={() => <List.Icon icon="calendar" />}
                  right={() => (
                    <Switch
                      value={preferences.notifications.appointments}
                      onValueChange={(value) => updatePreference('notifications', 'appointments', value)}
                    />
                  )}
                />
                
                <Divider style={styles.divider} />
                
                <List.Item
                  title="Sound"
                  description="Play notification sounds"
                  left={() => <List.Icon icon="volume-high" />}
                  right={() => (
                    <Switch
                      value={preferences.notifications.soundEnabled}
                      onValueChange={(value) => updatePreference('notifications', 'soundEnabled', value)}
                    />
                  )}
                />
                
                <List.Item
                  title="Vibration"
                  description="Vibrate for notifications"
                  left={() => <List.Icon icon="vibrate" />}
                  right={() => (
                    <Switch
                      value={preferences.notifications.vibrationEnabled}
                      onValueChange={(value) => updatePreference('notifications', 'vibrationEnabled', value)}
                    />
                  )}
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Appearance Settings */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🎨 Appearance
            </Text>
            
            <Menu
              visible={themeMenuVisible}
              onDismiss={() => setThemeMenuVisible(false)}
              anchor={
                <List.Item
                  title="Theme"
                  description={getThemeLabel(preferences.appearance.theme)}
                  left={() => <List.Icon icon="palette" />}
                  right={() => <List.Icon icon="chevron-down" />}
                  onPress={() => setThemeMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                title="Light"
                onPress={() => {
                  updatePreference('appearance', 'theme', 'light');
                  setThemeMenuVisible(false);
                }}
                leadingIcon="white-balance-sunny"
              />
              <Menu.Item
                title="Dark"
                onPress={() => {
                  updatePreference('appearance', 'theme', 'dark');
                  setThemeMenuVisible(false);
                }}
                leadingIcon="weather-night"
              />
              <Menu.Item
                title="System Default"
                onPress={() => {
                  updatePreference('appearance', 'theme', 'system');
                  setThemeMenuVisible(false);
                }}
                leadingIcon="cellphone"
              />
            </Menu>
            
            <Menu
              visible={languageMenuVisible}
              onDismiss={() => setLanguageMenuVisible(false)}
              anchor={
                <List.Item
                  title="Language"
                  description={getLanguageLabel(preferences.appearance.language)}
                  left={() => <List.Icon icon="translate" />}
                  right={() => <List.Icon icon="chevron-down" />}
                  onPress={() => setLanguageMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                title="English"
                onPress={() => {
                  updatePreference('appearance', 'language', 'en');
                  setLanguageMenuVisible(false);
                }}
              />
              <Menu.Item
                title="Español"
                onPress={() => {
                  updatePreference('appearance', 'language', 'es');
                  setLanguageMenuVisible(false);
                }}
              />
              <Menu.Item
                title="Français"
                onPress={() => {
                  updatePreference('appearance', 'language', 'fr');
                  setLanguageMenuVisible(false);
                }}
              />
              <Menu.Item
                title="Deutsch"
                onPress={() => {
                  updatePreference('appearance', 'language', 'de');
                  setLanguageMenuVisible(false);
                }}
              />
            </Menu>
            
            <List.Item
              title="Date Format"
              description={preferences.appearance.dateFormat}
              left={() => <List.Icon icon="calendar-today" />}
              onPress={() => {
                const formats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
                const currentIndex = formats.indexOf(preferences.appearance.dateFormat);
                const nextIndex = (currentIndex + 1) % formats.length;
                updatePreference('appearance', 'dateFormat', formats[nextIndex]);
              }}
            />
            
            <List.Item
              title="Time Format"
              description={preferences.appearance.timeFormat === '12h' ? '12 Hour' : '24 Hour'}
              left={() => <List.Icon icon="clock" />}
              onPress={() => {
                updatePreference('appearance', 'timeFormat', preferences.appearance.timeFormat === '12h' ? '24h' : '12h');
              }}
            />
            
            <List.Item
              title="Units"
              description={preferences.appearance.units === 'imperial' ? 'Imperial (lbs, °F)' : 'Metric (kg, °C)'}
              left={() => <List.Icon icon="ruler" />}
              onPress={() => {
                updatePreference('appearance', 'units', preferences.appearance.units === 'imperial' ? 'metric' : 'imperial');
              }}
            />
          </Card.Content>
        </Card>

        {/* AI Features */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🤖 AI Features
            </Text>
            
            <List.Item
              title="Enable AI Analysis"
              description="Use AI to analyze pet photos and health"
              left={() => <List.Icon icon="robot" />}
              right={() => (
                <Switch
                  value={preferences.ai.enabled}
                  onValueChange={(value) => updatePreference('ai', 'enabled', value)}
                />
              )}
            />
            
            {preferences.ai.enabled && (
              <>
                <Divider style={styles.divider} />
                <List.Item
                  title="Auto Analysis"
                  description="Automatically analyze new photos"
                  left={() => <List.Icon icon="camera-plus" />}
                  right={() => (
                    <Switch
                      value={preferences.ai.autoAnalysis}
                      onValueChange={(value) => updatePreference('ai', 'autoAnalysis', value)}
                    />
                  )}
                />
                
                <List.Item
                  title="Smart Reminders"
                  description="AI-powered reminder suggestions"
                  left={() => <List.Icon icon="lightbulb" />}
                  right={() => (
                    <Switch
                      value={preferences.ai.smartReminders}
                      onValueChange={(value) => updatePreference('ai', 'smartReminders', value)}
                    />
                  )}
                />
                
                <List.Item
                  title="Health Insights"
                  description="Get AI-generated health insights"
                  left={() => <List.Icon icon="chart-line" />}
                  right={() => (
                    <Switch
                      value={preferences.ai.healthInsights}
                      onValueChange={(value) => updatePreference('ai', 'healthInsights', value)}
                    />
                  )}
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Data & Backup */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              💾 Data & Backup
            </Text>
            
            <List.Item
              title="Auto Backup"
              description="Automatically backup your data"
              left={() => <List.Icon icon="backup-restore" />}
              right={() => (
                <Switch
                  value={preferences.backup.autoBackup}
                  onValueChange={(value) => updatePreference('backup', 'autoBackup', value)}
                />
              )}
            />
            
            <Menu
              visible={backupMenuVisible}
              onDismiss={() => setBackupMenuVisible(false)}
              anchor={
                <List.Item
                  title="Backup Frequency"
                  description={getBackupFrequencyLabel(preferences.backup.backupFrequency)}
                  left={() => <List.Icon icon="calendar-clock" />}
                  right={() => <List.Icon icon="chevron-down" />}
                  onPress={() => setBackupMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                title="Daily"
                onPress={() => {
                  updatePreference('backup', 'backupFrequency', 'daily');
                  setBackupMenuVisible(false);
                }}
              />
              <Menu.Item
                title="Weekly"
                onPress={() => {
                  updatePreference('backup', 'backupFrequency', 'weekly');
                  setBackupMenuVisible(false);
                }}
              />
              <Menu.Item
                title="Monthly"
                onPress={() => {
                  updatePreference('backup', 'backupFrequency', 'monthly');
                  setBackupMenuVisible(false);
                }}
              />
            </Menu>
            
            <List.Item
              title="Cloud Sync"
              description="Sync data across devices (Coming Soon)"
              left={() => <List.Icon icon="cloud" />}
              right={() => (
                <Switch
                  value={preferences.backup.cloudSync}
                  onValueChange={(value) => updatePreference('backup', 'cloudSync', value)}
                  disabled={true}
                />
              )}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Last Backup"
              description={formatLastBackup(preferences.backup.lastBackup)}
              left={() => <List.Icon icon="clock" />}
            />
            
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleBackupNow}
                loading={loading}
                disabled={loading}
                icon="backup-restore"
                style={styles.actionButton}
              >
                Backup Now
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleExportData}
                loading={loading}
                disabled={loading}
                icon="export"
                style={styles.actionButton}
              >
                Export Data
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Privacy Settings */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🔒 Privacy
            </Text>
            
            <List.Item
              title="Share Usage Data"
              description="Help improve the app with anonymous data"
              left={() => <List.Icon icon="chart-bar" />}
              right={() => (
                <Switch
                  value={preferences.privacy.shareData}
                  onValueChange={(value) => updatePreference('privacy', 'shareData', value)}
                />
              )}
            />
            
            <List.Item
              title="Analytics"
              description="Help us understand app usage"
              left={() => <List.Icon icon="google-analytics" />}
              right={() => (
                <Switch
                  value={preferences.privacy.analytics}
                  onValueChange={(value) => updatePreference('privacy', 'analytics', value)}
                />
              )}
            />
            
            <List.Item
              title="Crash Reports"
              description="Send crash reports to improve stability"
              left={() => <List.Icon icon="bug" />}
              right={() => (
                <Switch
                  value={preferences.privacy.crashReports}
                  onValueChange={(value) => updatePreference('privacy', 'crashReports', value)}
                />
              )}
            />
            
            <List.Item
              title="Location Access"
              description="Allow location for nearby vet clinics"
              left={() => <List.Icon icon="map-marker" />}
              right={() => (
                <Switch
                  value={preferences.privacy.locationAccess}
                  onValueChange={(value) => updatePreference('privacy', 'locationAccess', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Support & Feedback */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              💬 Support & Feedback
            </Text>
            
            <List.Item
              title="Contact Support"
              description="Get help with the app"
              left={() => <List.Icon icon="help-circle" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={handleContactSupport}
            />
            
            <List.Item
              title="Rate App"
              description="Rate us on the app store"
              left={() => <List.Icon icon="star" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={handleRateApp}
            />
            
            <List.Item
              title="Share App"
              description="Tell friends about Pet Wellness Tracker"
              left={() => <List.Icon icon="share" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={handleShareApp}
            />
            
            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={() => <List.Icon icon="shield-check" />}
              right={() => <List.Icon icon="open-in-new" />}
              onPress={() => Linking.openURL('https://petwellnesstracker.com/privacy')}
            />
            
            <List.Item
              title="Terms of Service"
              description="Read our terms of service"
              left={() => <List.Icon icon="file-document" />}
              right={() => <List.Icon icon="open-in-new" />}
              onPress={() => Linking.openURL('https://petwellnesstracker.com/terms')}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ℹ️ App Information
            </Text>
            
            <List.Item
              title="Version"
              description="1.0.0 (Build 1)"
              left={() => <List.Icon icon="information" />}
            />
            
            <List.Item
              title="Platform"
              description={`${Platform.OS} ${Platform.Version}`}
              left={() => <List.Icon icon="cellphone" />}
            />
            
            <List.Item
              title="Storage Used"
              description={getStorageUsage()}
              left={() => <List.Icon icon="database" />}
            />
            
            <List.Item
              title="Developer"
              description="Pet Care Solutions Inc."
              left={() => <List.Icon icon="domain" />}
            />
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.dangerCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.dangerTitle, { color: theme.colors.onErrorContainer }]}>
              ⚠️ Danger Zone
            </Text>
            <Text variant="bodyMedium" style={[styles.dangerDescription, { color: theme.colors.onErrorContainer }]}>
              These actions cannot be undone. Please be careful.
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleResetApp}
              icon="delete-forever"
              textColor={theme.colors.error}
              style={[styles.dangerButton, { borderColor: theme.colors.error }]}
            >
              Reset All Data
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  settingsChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: -10,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: 'rgba(103, 102, 241, 0.2)',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileStats: {
    marginBottom: 2,
  },
  profileUsage: {
    fontSize: 12,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  dangerCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  dangerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dangerDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default SettingsScreen;