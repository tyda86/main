import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '@contexts/ThemeContext';
import { commonStyles } from '@utils/theme';
import { StorageService } from '@services/storageService';
import { NotificationService } from '@services/notificationService';
import { AppSettings, NotificationSettings } from '@types/index';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = getStyles(theme);
  const common = commonStyles(theme);

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    notifications: {
      enabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      notificationTime: 'immediate',
    },
    language: 'en',
  });

  const loadSettings = async () => {
    try {
      const appSettings = await StorageService.getAppSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateNotificationSettings = async (newNotificationSettings: NotificationSettings) => {
    try {
      await StorageService.updateNotificationSettings(newNotificationSettings);
      setSettings(prev => ({
        ...prev,
        notifications: newNotificationSettings,
      }));

      // Reschedule all notifications with new settings
      await NotificationService.rescheduleAllNotifications();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.testNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await StorageService.exportUserData();
      Alert.alert(
        'Export Data',
        'Your data has been prepared for export. In a full implementation, this would be saved to your device or shared.',
        [
          { text: 'OK' },
          {
            text: 'View Data',
            onPress: () => console.log('Export Data:', exportData),
          },
        ]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your anime lists and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              NotificationService.clearAllNotifications();
              Alert.alert('Success', 'All data has been cleared.');
              loadSettings(); // Reload default settings
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    icon?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, !onPress && { opacity: 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        {icon && (
          <Icon name={icon} size={24} color={theme.colors.textSecondary} style={styles.settingIcon} />
        )}
        <View style={styles.settingText}>
          <Text style={common.text}>{title}</Text>
          {subtitle && (
            <Text style={[common.textSecondary, styles.settingSubtitle]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent && <View style={styles.settingRight}>{rightComponent}</View>}
      {onPress && !rightComponent && (
        <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[common.subtitle, styles.sectionTitle]}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  return (
    <ScrollView style={common.container} contentContainerStyle={styles.content}>
      {renderSection(
        'Appearance',
        <>
          {renderSettingItem(
            'Theme',
            `Current: ${themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}`,
            'palette',
            () => {
              Alert.alert(
                'Select Theme',
                'Choose your preferred theme',
                [
                  {
                    text: 'Light',
                    onPress: () => setThemeMode('light'),
                  },
                  {
                    text: 'Dark',
                    onPress: () => setThemeMode('dark'),
                  },
                  {
                    text: 'System',
                    onPress: () => setThemeMode('system'),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }
          )}
        </>
      )}

      {renderSection(
        'Notifications',
        <>
          {renderSettingItem(
            'Enable Notifications',
            'Receive episode alerts',
            'notifications',
            undefined,
            <Switch
              value={settings.notifications.enabled}
              onValueChange={(value) =>
                updateNotificationSettings({
                  ...settings.notifications,
                  enabled: value,
                })
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={settings.notifications.enabled ? '#FFFFFF' : theme.colors.textSecondary}
            />
          )}

          {settings.notifications.enabled && (
            <>
              {renderSettingItem(
                'Sound',
                'Play sound with notifications',
                'volume-up',
                undefined,
                <Switch
                  value={settings.notifications.soundEnabled}
                  onValueChange={(value) =>
                    updateNotificationSettings({
                      ...settings.notifications,
                      soundEnabled: value,
                    })
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={settings.notifications.soundEnabled ? '#FFFFFF' : theme.colors.textSecondary}
                />
              )}

              {renderSettingItem(
                'Vibration',
                'Vibrate when receiving notifications',
                'vibration',
                undefined,
                <Switch
                  value={settings.notifications.vibrationEnabled}
                  onValueChange={(value) =>
                    updateNotificationSettings({
                      ...settings.notifications,
                      vibrationEnabled: value,
                    })
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={settings.notifications.vibrationEnabled ? '#FFFFFF' : theme.colors.textSecondary}
                />
              )}

              {renderSettingItem(
                'Notification Timing',
                `Current: ${settings.notifications.notificationTime === 'immediate' ? 'Immediately' : 
                  settings.notifications.notificationTime === '1hour' ? '1 hour after' : '24 hours after'}`,
                'schedule',
                () => {
                  Alert.alert(
                    'Notification Timing',
                    'When would you like to receive notifications?',
                    [
                      {
                        text: 'Immediately',
                        onPress: () =>
                          updateNotificationSettings({
                            ...settings.notifications,
                            notificationTime: 'immediate',
                          }),
                      },
                      {
                        text: '1 Hour After',
                        onPress: () =>
                          updateNotificationSettings({
                            ...settings.notifications,
                            notificationTime: '1hour',
                          }),
                      },
                      {
                        text: '24 Hours After',
                        onPress: () =>
                          updateNotificationSettings({
                            ...settings.notifications,
                            notificationTime: '24hours',
                          }),
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }
              )}

              {renderSettingItem(
                'Test Notification',
                'Send a test notification',
                'notification-important',
                handleTestNotification
              )}
            </>
          )}
        </>
      )}

      {renderSection(
        'Data Management',
        <>
          {renderSettingItem(
            'Export Data',
            'Export your anime list and settings',
            'file-download',
            handleExportData
          )}

          {renderSettingItem(
            'Clear All Data',
            'Remove all data and reset app',
            'delete-forever',
            handleClearAllData
          )}
        </>
      )}

      {renderSection(
        'About',
        <>
          {renderSettingItem(
            'Version',
            '1.0.0',
            'info'
          )}

          {renderSettingItem(
            'Data Source',
            'AniList GraphQL API',
            'api'
          )}

          {renderSettingItem(
            'Developer',
            'Anime Episode Alert Team',
            'code'
          )}
        </>
      )}

      <View style={styles.footer}>
        <Text style={[common.textSecondary, styles.footerText]}>
          Stay updated with your favorite anime!
        </Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    content: {
      paddingBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      color: theme.colors.primary,
    },
    sectionContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: theme.spacing.md,
    },
    settingText: {
      flex: 1,
    },
    settingSubtitle: {
      marginTop: theme.spacing.xs,
    },
    settingRight: {
      marginLeft: theme.spacing.md,
    },
    footer: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    footerText: {
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

export default SettingsScreen;