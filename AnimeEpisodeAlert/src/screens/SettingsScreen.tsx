import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../contexts/NotificationContext';

const SettingsScreen: React.FC = () => {
  const { expoPushToken, requestPermissions, scheduleAnimeNotification } = useNotifications();
  const [globalNotifications, setGlobalNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in your device settings to receive episode alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleTestNotification = async () => {
    try {
      await scheduleAnimeNotification('Attack on Titan', 25);
      Alert.alert('Test Sent', 'You should receive a test notification shortly!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color="#FF6B6B" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2C2C2E', true: '#FF6B6B' }}
        thumbColor={value ? '#FFFFFF' : '#8E8E93'}
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon: keyof typeof Ionicons.glyphMap,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color="#FF6B6B" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      )}
    </TouchableOpacity>
  );

  const renderInfoItem = (
    title: string,
    value: string,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={styles.infoItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color="#FF6B6B" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your anime experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        {renderSettingItem(
          'Episode Notifications',
          'Get notified when new episodes are available',
          globalNotifications,
          setGlobalNotifications,
          'notifications'
        )}
        {renderSettingItem(
          'Sound',
          'Play sound with notifications',
          soundEnabled,
          setSoundEnabled,
          'volume-high'
        )}
        {renderSettingItem(
          'Vibration',
          'Vibrate on new notifications',
          vibrationEnabled,
          setVibrationEnabled,
          'phone-portrait'
        )}
        {renderActionItem(
          'Test Notification',
          'Send a test notification to check if it works',
          handleTestNotification,
          'bug',
          false
        )}
        {renderActionItem(
          'Notification Permissions',
          'Manage notification permissions',
          handlePermissionRequest,
          'settings',
          false
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App Info</Text>
        {renderInfoItem(
          'Version',
          '1.0.0',
          'information-circle'
        )}
        {renderInfoItem(
          'Push Token Status',
          expoPushToken ? 'Connected' : 'Not Available',
          'checkmark-circle'
        )}
        {renderActionItem(
          'Rate App',
          'Help us improve by rating the app',
          () => Alert.alert('Thank you!', 'Rating feature coming soon!'),
          'star'
        )}
        {renderActionItem(
          'Share App',
          'Tell your friends about Anime Episode Alert',
          () => Alert.alert('Share', 'Sharing feature coming soon!'),
          'share'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        {renderActionItem(
          'Privacy Policy',
          'Learn how we handle your data',
          () => Alert.alert('Privacy', 'We only store your anime preferences locally on your device.'),
          'shield-checkmark'
        )}
        {renderActionItem(
          'Terms of Service',
          'Read our terms and conditions',
          () => Alert.alert('Terms', 'Terms of service coming soon!'),
          'document-text'
        )}
        {renderActionItem(
          'Data Source',
          'Powered by Jikan API & MyAnimeList',
          () => Linking.openURL('https://jikan.moe/'),
          'globe'
        )}
      </View>

      {expoPushToken && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Debug Info</Text>
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Push Token (Tap to copy):</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Push Token', expoPushToken)}
            >
              <Text style={styles.debugToken} numberOfLines={3}>
                {expoPushToken}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for anime fans
        </Text>
        <Text style={styles.footerSubtext}>
          Stay updated with your favorite anime episodes!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  infoItem: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  debugInfo: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  debugTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 10,
  },
  debugToken: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 60,
  },
  footerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default SettingsScreen;