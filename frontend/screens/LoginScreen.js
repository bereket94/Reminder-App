import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigateTo }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleLogin = async () => {
  if (!validateForm()) return;
  
  setLoading(true);
  
  try {
    const loginData = {
      email: email.toLowerCase().trim(),
      password: password
    };
    
    console.log('Sending login data:', loginData);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].msg);
      }
      throw new Error(data.message || 'Login failed');
    }
    
    const { token, user } = data;
    
    if (!token || !user) {
      throw new Error('Invalid response from server');
    }
    
    // First login to update context
    await login(token, user);
    
    // Then manually navigate to home
    console.log('Manually navigating to home...');
    navigateTo('home');
    
    // Verify token was stored
    const storedToken = await AsyncStorage.getItem('token');
    console.log('Token stored successfully:', storedToken ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', error.message);
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'googleuser@gmail.com',
          name: 'Google User',
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Google auth failed');
      }
      
      const { token, user } = data;
      await login(token, user);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔔</Text>
          </View>
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor="#7B7499"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors({});
              }}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#9e9ca7"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors({});
                }}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigateTo('register')}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.link}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.demoText}>Demo: demo@gmail.com / Demo1234</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4FF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 26,
    borderWidth: 1,
    borderColor: '#E2DEFF',
    shadowColor: '#6C4EF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#6C4EF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1730',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#7B7499',
    textAlign: 'center',
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 13,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7B7499',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2DEFF',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F0EFFE',
    color: '#1A1730',
  },
  inputError: {
    borderColor: '#E53E3E',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2DEFF',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F0EFFE',
    color: '#1A1730',
    paddingRight: 45,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 5,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 11,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#6C4EF6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2DEFF',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: '#7B7499',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2DEFF',
  },
  googleButtonText: {
    color: '#1A1730',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#7B7499',
  },
  link: {
    color: '#6C4EF6',
    fontWeight: '700',
  },
  demoText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#7B7499',
    marginTop: 16,
  },
});