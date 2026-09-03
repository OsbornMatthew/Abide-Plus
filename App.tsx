import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { AbideLogo } from './src/components/common/AbideLogo';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

enableScreens(true);

// Inject modern Google Fonts on Web (Mukta Malar for Tamil, Plus Jakarta Sans for UI)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('abide-tamil-fonts')) {
    const link = document.createElement('link');
    link.id = 'abide-tamil-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Serif+Tamil:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      body, html {
        font-family: 'Plus Jakarta Sans', 'Mukta Malar', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;
    document.head.appendChild(style);
  }
}

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
