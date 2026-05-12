import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useExercises } from '../hooks/useExercises';
import { colors } from '../constants/colors';
import { ThemeContext } from '../context/ThemeContext';
import { ExercisesContext } from '../context/ExercisesContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const themeState = useTheme();
  const exercisesState = useExercises();
  const { theme, loaded: themeLoaded } = themeState;
  const { hydrated } = exercisesState;
  const c = colors[theme];

  useEffect(() => {
    if (themeLoaded && hydrated) SplashScreen.hideAsync();
  }, [themeLoaded, hydrated]);

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={themeState}>
        <ExercisesContext.Provider value={exercisesState}>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: c.bg },
              animation: 'slide_from_right',
            }}
          />
        </ExercisesContext.Provider>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
