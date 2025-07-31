import { AIAnalysis } from '../types';

export interface AnalysisResult {
  detectedIssues: {
    type: string;
    confidence: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }[];
  overallHealthScore: number;
}

class AIService {
  // Mock AI analysis - in a real app, this would call an actual AI service
  async analyzeImage(imageUri: string, petId: string): Promise<AIAnalysis> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis results based on random scenarios
    const mockAnalysis = this.generateMockAnalysis();

    const analysis: AIAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      petId,
      imageUri,
      analysisDate: new Date(),
      detectedIssues: mockAnalysis.detectedIssues,
      overallHealthScore: mockAnalysis.overallHealthScore,
    };

    return analysis;
  }

  private generateMockAnalysis(): AnalysisResult {
    const scenarios = [
      // Healthy pet scenario
      {
        detectedIssues: [
          {
            type: 'General Health',
            confidence: 0.95,
            description: 'Pet appears healthy with good coat condition and clear eyes',
            severity: 'low' as const,
            recommendations: [
              'Continue regular grooming routine',
              'Maintain current diet and exercise schedule',
              'Schedule routine vet checkup in 6 months'
            ]
          }
        ],
        overallHealthScore: 92
      },
      // Skin condition scenario
      {
        detectedIssues: [
          {
            type: 'Skin Condition',
            confidence: 0.78,
            description: 'Possible signs of dry skin or minor irritation detected',
            severity: 'medium' as const,
            recommendations: [
              'Consider using a moisturizing pet shampoo',
              'Check for environmental allergens',
              'Monitor for scratching behavior',
              'Consult vet if condition persists'
            ]
          }
        ],
        overallHealthScore: 75
      },
      // Eye issue scenario
      {
        detectedIssues: [
          {
            type: 'Eye Health',
            confidence: 0.82,
            description: 'Minor eye discharge or tear staining observed',
            severity: 'low' as const,
            recommendations: [
              'Clean eyes gently with pet-safe wipes',
              'Monitor for increased discharge',
              'Check for foreign objects in eye area',
              'Consult vet if discharge increases or changes color'
            ]
          }
        ],
        overallHealthScore: 80
      },
      // Weight concern scenario
      {
        detectedIssues: [
          {
            type: 'Body Condition',
            confidence: 0.73,
            description: 'Pet may be slightly overweight based on visible body condition',
            severity: 'medium' as const,
            recommendations: [
              'Reduce portion sizes by 10-15%',
              'Increase daily exercise duration',
              'Switch to weight management pet food',
              'Schedule vet consultation for weight management plan'
            ]
          }
        ],
        overallHealthScore: 68
      },
      // Dental health scenario
      {
        detectedIssues: [
          {
            type: 'Dental Health',
            confidence: 0.69,
            description: 'Possible tartar buildup or dental issues detected',
            severity: 'medium' as const,
            recommendations: [
              'Increase frequency of teeth brushing',
              'Provide dental chews or toys',
              'Consider professional dental cleaning',
              'Schedule dental examination with vet'
            ]
          }
        ],
        overallHealthScore: 72
      },
      // Multiple minor issues scenario
      {
        detectedIssues: [
          {
            type: 'Coat Condition',
            confidence: 0.65,
            description: 'Coat appears slightly dull or matted in some areas',
            severity: 'low' as const,
            recommendations: [
              'Increase brushing frequency',
              'Consider omega-3 supplements',
              'Check for underlying skin conditions'
            ]
          },
          {
            type: 'Activity Level',
            confidence: 0.71,
            description: 'Pet may appear less active than typical for breed and age',
            severity: 'low' as const,
            recommendations: [
              'Encourage more interactive play',
              'Monitor energy levels throughout the day',
              'Ensure adequate sleep and rest'
            ]
          }
        ],
        overallHealthScore: 76
      }
    ];

    // Randomly select a scenario
    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return selectedScenario;
  }

  // Generate breed-specific care tips
  generateBreedTips(breed: string, age: number): string[] {
    const breedTips: { [key: string]: string[] } = {
      'golden retriever': [
        'Regular brushing to prevent matting',
        'Monitor for hip dysplasia as they age',
        'Provide plenty of exercise and mental stimulation',
        'Watch for ear infections due to floppy ears'
      ],
      'labrador': [
        'Monitor weight as they tend to overeat',
        'Provide swimming opportunities if possible',
        'Regular joint health checkups',
        'Mental stimulation to prevent destructive behavior'
      ],
      'german shepherd': [
        'Daily brushing during shedding seasons',
        'Hip and elbow dysplasia screening',
        'Consistent training and socialization',
        'Monitor for bloat (gastric torsion)'
      ],
      'persian cat': [
        'Daily grooming to prevent matting',
        'Regular eye cleaning due to flat face',
        'Monitor breathing for respiratory issues',
        'Dental care is especially important'
      ],
      'siamese cat': [
        'Provide plenty of mental stimulation',
        'Monitor for respiratory issues',
        'Regular dental care',
        'Social interaction is crucial'
      ],
      'default': [
        'Regular veterinary checkups',
        'Maintain proper diet and exercise',
        'Keep up with vaccinations',
        'Monitor for changes in behavior or appetite'
      ]
    };

    const tips = breedTips[breed.toLowerCase()] || breedTips['default'];
    
    // Add age-specific tips
    if (age < 1) {
      tips.push('Puppy/kitten-proof your home', 'Follow vaccination schedule closely');
    } else if (age > 7) {
      tips.push('Increase frequency of vet visits', 'Monitor for age-related health issues');
    }

    return tips;
  }

  // Generate personalized care recommendations
  generateCareRecommendations(pet: any, recentAnalyses: AIAnalysis[]): string[] {
    const recommendations: string[] = [];

    // Base recommendations on breed and age
    const breedTips = this.generateBreedTips(pet.breed, this.calculateAge(pet.dateOfBirth));
    recommendations.push(...breedTips.slice(0, 2)); // Add first 2 breed tips

    // Add recommendations based on recent AI analyses
    if (recentAnalyses.length > 0) {
      const latestAnalysis = recentAnalyses[0];
      if (latestAnalysis.overallHealthScore < 80) {
        recommendations.push('Schedule a vet consultation for recent health concerns');
      }

      // Add specific recommendations from detected issues
      latestAnalysis.detectedIssues.forEach(issue => {
        if (issue.severity === 'high' || issue.severity === 'medium') {
          recommendations.push(...issue.recommendations.slice(0, 1)); // Add first recommendation
        }
      });
    }

    // Add general wellness tips
    recommendations.push(
      'Maintain regular exercise routine',
      'Ensure fresh water is always available',
      'Monitor eating and drinking habits'
    );

    // Remove duplicates and limit to 6 recommendations
    return [...new Set(recommendations)].slice(0, 6);
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

export default new AIService();