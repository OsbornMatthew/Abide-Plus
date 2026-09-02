import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform, BackHandler } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { BibleScreen } from '../screens/BibleScreen';
import { PrayerScreen } from '../screens/PrayerScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { AuthScreen } from '../screens/AuthScreen';

// Icons
import {
  Compass,
  BookOpen,
  Heart,
  Wallet,
  Zap,
  Flame,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  const { theme, settings, habitStats, bibleProgress, user } = useApp();
  const isTamil = settings.displayLanguage === 'ta';
  const navigationRef = useNavigationContainerRef();
  const currentRouteNameRef = useRef<string>('Home');

  useEffect(() => {
    // Handle Android hardware back press
    const onBackPress = () => {
      const currentRoute = navigationRef.getCurrentRoute()?.name;
      if (currentRoute && currentRoute !== 'Home') {
        navigationRef.navigate('Home' as never);
        return true; // Handled
      }
      return false; // Exit app only on Home screen
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Handle Web browser back gesture / popstate to prevent closing tab
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.history.pushState({ tab: 'Home' }, '', window.location.href);
      } catch {}

      const onPopState = () => {
        const currentRoute = navigationRef.getCurrentRoute()?.name;
        if (currentRoute && currentRoute !== 'Home') {
          navigationRef.navigate('Home' as never);
          try {
            window.history.pushState({ tab: 'Home' }, '', window.location.href);
          } catch {}
        } else {
          try {
            window.history.pushState({ tab: 'Home' }, '', window.location.href);
          } catch {}
        }
      };

      window.addEventListener('popstate', onPopState);
      return () => {
        backHandlerSubscription.remove();
        window.removeEventListener('popstate', onPopState);
      };
    }

    return () => {
      backHandlerSubscription.remove();
    };
  }, []);

  // Strict Authentication Gate: Show ONLY login/register screen when logged out
  if (!user) {
    return <AuthScreen isMandatory={true} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const routeName = navigationRef.getCurrentRoute()?.name || 'Home';
        currentRouteNameRef.current = routeName;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          try {
            window.history.pushState({ tab: routeName }, '', window.location.href);
          } catch {}
        }
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBarBorder,
            height: Platform.OS === 'android' ? 68 : 72,
            paddingBottom: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            elevation: 12,
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginTop: 2,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: isTamil ? 'பயணம்' : 'Journey',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <Compass size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Bible"
          component={BibleScreen}
          options={{
            tabBarLabel: isTamil ? 'வேதாகமம்' : 'Bible',
            tabBarBadge: (bibleProgress?.totalPercentage || 0) > 0 ? `${bibleProgress.totalPercentage}%` : undefined,
            tabBarBadgeStyle: {
              backgroundColor: theme.primary,
              color: '#000',
              fontSize: 9,
              fontWeight: '800',
            },
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <BookOpen size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Prayer"
          component={PrayerScreen}
          options={{
            tabBarLabel: isTamil ? 'ஜெபம்' : 'Prayers',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <Heart size={20} color={color} />
              </View>
            ),
          }}
        />

        {/* Changed from Stewardship to Expenses */}
        <Tab.Screen
          name="Finance"
          component={FinanceScreen}
          options={{
            tabBarLabel: isTamil ? 'செலவுகள்' : 'Expenses',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <Wallet size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Habits"
          component={HabitsScreen}
          options={{
            tabBarLabel: isTamil ? 'பழக்கங்கள்' : 'Habits',
            tabBarBadge: habitStats.completedToday > 0 ? `${habitStats.completedToday}/${habitStats.totalHabits}` : undefined,
            tabBarBadgeStyle: {
              backgroundColor: '#8B5CF6',
              color: '#FFF',
              fontSize: 9,
              fontWeight: '800',
            },
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: '#8B5CF620' }]}>
                <Zap size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{
            tabBarLabel: isTamil ? 'கூடுதல்' : 'More',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <Flame size={20} color={color} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
