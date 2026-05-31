// frontend/App.js
import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

// Main App wrapper with provider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// App content that uses auth context
function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState('login');

  const navigateTo = (screen) => {
    console.log('Manual navigation to:', screen);
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C4EF6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering screen:', currentScreen);
  console.log('User exists:', !!user);

  // Render based on currentScreen - NO AUTO NAVIGATION
  if (currentScreen === 'register') {
    return <RegisterScreen navigateTo={navigateTo} />;
  }
  
  if (currentScreen === 'home') {
    return <HomeScreen navigateTo={navigateTo} />;
  }
  
  // Default to login
  return <LoginScreen navigateTo={navigateTo} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F4FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6C4EF6',
  },
});