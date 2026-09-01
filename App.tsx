import React from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { AbideLogo } from './src/components/common/AbideLogo';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

const MainApp: React.FC = () => {
  const { settings, theme, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar
          barStyle={settings.isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <AbideLogo fontSize={28} />
        <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={settings.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <RootNavigator />
    </View>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
