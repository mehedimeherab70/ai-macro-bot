// AI Macro Bot — Navigation Setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import AIGeneratorScreen from '../screens/AIGeneratorScreen';
import MacroEditorScreen from '../screens/MacroEditorScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LogsScreen from '../screens/LogsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0F0F1A', borderTopColor: '#1F1F30', borderTopWidth: 1, height: 60, paddingBottom: 10, paddingTop: 6 },
      tabBarActiveTintColor: '#8B5CF6',
      tabBarInactiveTintColor: '#4B5563',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;
        switch (route.name) { case 'Home': iconName = focused ? 'flash' : 'flash-outline'; break; case 'Logs': iconName = focused ? 'list' : 'list-outline'; break; case 'Settings': iconName = focused ? 'settings' : 'settings-outline'; break; default: iconName = 'help-outline'; }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Macros' }} />
      <Tab.Screen name="Logs" component={LogsScreen} options={{ tabBarLabel: 'Logs' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#0F0F1A' } }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AIGenerator" component={AIGeneratorScreen} />
        <Stack.Screen name="MacroEditor" component={MacroEditorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
