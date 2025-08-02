import { Appearance } from 'react-native';

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    accent: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    light: '300';
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#EC4899',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    accent: '#8B5CF6',
    shadow: '#00000020',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#818CF8',
    primaryDark: '#6366F1',
    secondary: '#F472B6',
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    accent: '#A78BFA',
    shadow: '#00000040',
  },
};

export const getTheme = (themeMode: 'light' | 'dark' | 'system'): Theme => {
  if (themeMode === 'system') {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? darkTheme : lightTheme;
  }
  return themeMode === 'dark' ? darkTheme : lightTheme;
};

export const commonStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  shadow: {
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});