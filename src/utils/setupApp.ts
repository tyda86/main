// App setup utilities
import { LogBox } from 'react-native';

export const setupApp = () => {
  // Ignore specific warnings that might cause issues with Hermes
  LogBox.ignoreLogs([
    'Require cycle:',
    'Remote debugger',
    'Reanimated 2',
    'VirtualizedLists should never be nested',
    'Setting a timer for a long period of time',
  ]);

  // Enable Hermes performance optimizations
  if (__DEV__) {
    console.log('Running in development mode');
  }
};

export default setupApp;