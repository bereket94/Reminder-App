import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../App';

export default function AuthScreen() {
  const { setUser, API_URL } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && /\d/.test(password);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'register' && !form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!validateEmail(form.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (mode !== 'forgot') {
      if (mode === 'register' && !validatePassword(form.password)) {
        newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number';
      } else if (!form.password) {
        newErrors.password = 'Password is required';
      }
      
      if (mode === 'register' && form.password !== form.confirm) {
        newErrors.confirm = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let endpoint = '';
      let body = {};
      
      if (mode === 'register') {
        endpoint = `${API_URL}/auth/register`;
        body = { name: form.name, email: form.email, password: form.password };
      } else if (mode === 'login') {
        endpoint = `${API_URL}/auth/login`;
        body = { email: form.email, password: form.password };
      } else {
        Alert.alert('Info', 'Password reset link would be sent to your email');
        setMode('login');
        setLoading(false);
        return;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert('Error', data.message || 'Authentication failed');
        setLoading(false);
        return;
      }
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'googleuser@gmail.com',
          name: 'Google User',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert('Error', data.message || 'Google auth failed');
        setLoading(false);
        return;
      }
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: 'Welcome Back',
    register: 'Create Account',
    forgot: 'Reset Password',
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
          
          <Text style={styles.title}>{titles[mode]}</Text>
          <Text style={styles.subtitle}>Your personal reminder space</Text>
          
          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="John Doe"
                value={form.name}
                onChangeText={(v) => updateForm('name', v)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => updateForm('email', v)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          {mode !== 'forgot' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="••••••••"
                secureTextEntry
                value={form.password}
                onChangeText={(v) => updateForm('password', v)}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
          )}
          
          {mode === 'register' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirm && styles.inputError]}
                placeholder="••••••••"
                secureTextEntry
                value={form.confirm}
                onChangeText={(v) => updateForm('confirm', v)}
              />
              {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
            </View>
          )}
          
          {mode === 'login' && (
            <TouchableOpacity 
              onPress={() => setMode('forgot')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>
          
          {mode !== 'forgot' && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogle}
                disabled={loading}
              >
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          )}
          
          <View style={styles.footer}>
            {mode === 'login' && (
              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={styles.footerText}>
                  Don't have an account? <Text style={styles.link}>Register</Text>
                </Text>
              </TouchableOpacity>
            )}
            {mode === 'register' && (
              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.footerText}>
                  Already have an account? <Text style={styles.link}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}
            {mode === 'forgot' && (
              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.link}>← Back to login</Text>
              </TouchableOpacity>
            )}
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
  errorText: {
    color: '#E53E3E',
    fontSize: 11,
    marginTop: 4,
  },
  forgotLink: {
    alignItems: 'flex-end',
    marginTop: -6,
    marginBottom: 12,
  },
  forgotText: {
    color: '#6C4EF6',
    fontSize: 12,
    fontWeight: '500',
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