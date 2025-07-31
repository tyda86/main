import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  useTheme,
  ActivityIndicator,
  Chip,
  ProgressBar,
  Surface,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { RootStackParamList, Pet, AIAnalysis } from '../../types';
import AIService from '../../services/AIService';
import NotificationService from '../../services/NotificationService';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'AIAnalysis'>;

const { width } = Dimensions.get('window');

const AIAnalysisScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const theme = useTheme();
  const { state, saveAIAnalysis } = useAppContext();
  
  const { petId } = route.params;
  const pet = state.pets.find(p => p.id === petId);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (!pet) {
      Alert.alert('Error', 'Pet not found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [pet, navigation]);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo for AI analysis',
      [
        { text: 'Camera', onPress: handleCameraCapture },
        { text: 'Photo Library', onPress: handleImagePicker },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const performAnalysis = async () => {
    if (!selectedImage || !pet) return;

    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          return prev + 0.1;
        });
      }, 200);

      const result = await AIService.analyzeImage(selectedImage, pet.id);
      
      clearInterval(progressInterval);
      setAnalysisProgress(1);

      setAnalysis(result);
      await saveAIAnalysis(result);

      // Send notifications for high-severity issues
      const highSeverityIssues = result.detectedIssues.filter(issue => issue.severity === 'high');
      if (highSeverityIssues.length > 0) {
        const issueDescriptions = highSeverityIssues.map(issue => issue.description).join(', ');
        await NotificationService.sendUrgentHealthAlert(pet.name, issueDescriptions);
      }

    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return '#FFA500';
      case 'low':
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return theme.colors.tertiary;
    if (score >= 70) return '#FFA500';
    return theme.colors.error;
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Attention';
  };

  if (!pet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pet Header */}
        <Card style={[styles.petHeaderCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.petHeaderContent}>
            <Avatar.Icon
              size={60}
              icon="paw"
            />
            <View style={styles.petHeaderText}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {pet.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                AI Health Analysis
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Image Selection */}
        {!selectedImage ? (
          <Card style={[styles.imageSelectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.imageSelectionContent}>
              <Ionicons name="camera-outline" size={80} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={[styles.imageSelectionTitle, { color: theme.colors.onSurface }]}>
                Take or Select Photo
              </Text>
              <Text variant="bodyLarge" style={[styles.imageSelectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Our AI will analyze your pet's photo to detect potential health issues
              </Text>
              <Button
                mode="contained"
                onPress={showImageOptions}
                style={styles.selectImageButton}
                contentStyle={styles.selectImageButtonContent}
              >
                Select Photo
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={[styles.imagePreviewCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <View style={styles.imageActions}>
                <Button
                  mode="outlined"
                  onPress={showImageOptions}
                  style={styles.changeImageButton}
                >
                  Change Photo
                </Button>
                <Button
                  mode="contained"
                  onPress={performAnalysis}
                  disabled={analyzing}
                  style={styles.analyzeButton}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Analysis Progress */}
        {analyzing && (
          <Card style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                Analyzing your pet's photo...
              </Text>
              <ProgressBar
                progress={analysisProgress}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                Our AI is examining the image for potential health indicators
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Health Score */}
            <Card style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.scoreContent}>
                <LinearGradient
                  colors={[getHealthScoreColor(analysis.overallHealthScore), getHealthScoreColor(analysis.overallHealthScore) + '80']}
                  style={styles.scoreGradient}
                >
                  <Text variant="displaySmall" style={styles.scoreNumber}>
                    {analysis.overallHealthScore}
                  </Text>
                  <Text variant="titleMedium" style={styles.scoreLabel}>
                    {getHealthScoreLabel(analysis.overallHealthScore)}
                  </Text>
                </LinearGradient>
                <Text variant="bodyMedium" style={[styles.scoreDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Overall Health Score
                </Text>
              </Card.Content>
            </Card>

            {/* Detected Issues */}
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Analysis Results
            </Text>
            
            {analysis.detectedIssues.map((issue, index) => (
              <Card key={index} style={[styles.issueCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.issueHeader}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      {issue.type}
                    </Text>
                    <Chip
                      style={[styles.severityChip, { backgroundColor: getSeverityColor(issue.severity) + '20' }]}
                      textStyle={{ color: getSeverityColor(issue.severity) }}
                    >
                      {issue.severity.toUpperCase()}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium" style={[styles.issueDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {issue.description}
                  </Text>
                  
                  <View style={styles.confidenceContainer}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Confidence: {Math.round(issue.confidence * 100)}%
                    </Text>
                    <ProgressBar
                      progress={issue.confidence}
                      color={getSeverityColor(issue.severity)}
                      style={styles.confidenceBar}
                    />
                  </View>

                  {issue.recommendations.length > 0 && (
                    <View style={styles.recommendationsContainer}>
                      <Text variant="titleSmall" style={[styles.recommendationsTitle, { color: theme.colors.onSurface }]}>
                        Recommendations:
                      </Text>
                      {issue.recommendations.map((recommendation, recIndex) => (
                        <View key={recIndex} style={styles.recommendationItem}>
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={16}
                            color={theme.colors.primary}
                          />
                          <Text
                            variant="bodySmall"
                            style={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}
                          >
                            {recommendation}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}

            {/* Analysis Info */}
            <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={styles.infoContent}>
                <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoText}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    This AI analysis is for informational purposes only and should not replace professional veterinary care.
                  </Text>
                  <Text variant="bodySmall" style={[styles.analysisDate, { color: theme.colors.onSurfaceVariant }]}>
                    Analysis completed on {analysis.analysisDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Surface>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  petHeaderCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  petHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petHeaderText: {
    marginLeft: 16,
    flex: 1,
  },
  imageSelectionCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  imageSelectionContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  imageSelectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  imageSelectionSubtitle: {
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  selectImageButton: {
    borderRadius: 8,
  },
  selectImageButtonContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  imagePreviewCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  changeImageButton: {
    flex: 1,
  },
  analyzeButton: {
    flex: 1,
  },
  progressCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  progressTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressText: {
    textAlign: 'center',
  },
  scoreCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  scoreContent: {
    alignItems: 'center',
    padding: 0,
  },
  scoreGradient: {
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  scoreNumber: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreLabel: {
    color: 'white',
    fontWeight: '600',
  },
  scoreDescription: {
    padding: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    fontWeight: 'bold',
  },
  issueCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityChip: {
    height: 28,
  },
  issueDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recommendationText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  infoCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 1,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  analysisDate: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AIAnalysisScreen;