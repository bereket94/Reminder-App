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

  React.useEffect(() => {
    if (!loading) {
      setCurrentScreen(user ? 'home' : 'login');
    }
  }, [user, loading]);

  const navigateTo = (screen) => setCurrentScreen(screen);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C4EF6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (currentScreen === 'register') return <RegisterScreen navigateTo={navigateTo} />;
  if (currentScreen === 'home') return <HomeScreen navigateTo={navigateTo} />;
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