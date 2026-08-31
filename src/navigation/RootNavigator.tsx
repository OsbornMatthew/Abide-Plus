import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { BibleScreen } from '../screens/BibleScreen';
import { PrayerScreen } from '../screens/PrayerScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { TodoScreen } from '../screens/TodoScreen';
import { MoreScreen } from '../screens/MoreScreen';

// Icons
import {
  Sparkles,
  BookOpen,
  Heart,
  Wallet,
  CheckSquare,
  Flame,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  const { theme, settings, dailyTaskStats, bibleProgress } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  return (
    <NavigationContainer>
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
            tabBarLabel: isTamil ? 'இன்று' : 'Sanctuary',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <Sparkles size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Bible"
          component={BibleScreen}
          options={{
            tabBarLabel: isTamil ? 'வேதாகமம்' : 'Bible',
            tabBarBadge: bibleProgress.totalPercentage > 0 ? `${bibleProgress.totalPercentage}%` : undefined,
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
          name="Todo"
          component={TodoScreen}
          options={{
            tabBarLabel: isTamil ? 'பணிகள்' : 'To-Do',
            tabBarBadge: dailyTaskStats.totalToday > 0 ? `${dailyTaskStats.completedToday}/${dailyTaskStats.totalToday}` : undefined,
            tabBarBadgeStyle: {
              backgroundColor: theme.taskColor,
              color: '#FFF',
              fontSize: 9,
              fontWeight: '800',
            },
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: theme.primary + '20' }]}>
                <CheckSquare size={20} color={color} />
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
