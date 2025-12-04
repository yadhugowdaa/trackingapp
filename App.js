import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import TasksScreen from './src/screens/TasksScreen';

const STORAGE_KEYS = {
  USER: '@ikykik_user',
  TOKEN: '@ikykik_token',
};

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);

  // Check for stored session on app launch
  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setScreen('tasks');
      } else {
        setScreen('login');
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
      setScreen('login');
    }
  };

  const handleLogin = async (userData) => {
    try {
      // Save user data to storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
      setScreen('tasks');
    } catch (error) {
      console.error('Error saving user data:', error);
      // Still proceed with login even if storage fails
      setUser(userData);
      setScreen('tasks');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear stored session
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
    setUser(null);
    setScreen('login');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateSignup={() => setScreen('signup')}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onNavigateLogin={() => setScreen('login')}
          />
        );
      case 'tasks':
        return (
          <TasksScreen
            user={user}
            onLogout={handleLogout}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {renderScreen()}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  loadingText: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
});

