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
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigateTo }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd) => {
    return {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
    };
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';
    
    const passwordRules = validatePassword(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!Object.values(passwordRules).every(Boolean)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In RegisterScreen.js, update the handleRegister function:

    const handleRegister = async () => {
      if (!validateForm()) return;
      
      setLoading(true);
      
      try {
        const registerData = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password
        };
        
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (data.errors && data.errors.length > 0) {
            throw new Error(data.errors[0].msg);
          }
          throw new Error(data.message || 'Registration failed');
        }
        
        const { token, user } = data;
        
        if (!token || !user) {
          throw new Error('Invalid response from server');
        }
        
        await login(token, user);
        
        // MANUAL NAVIGATION TO HOME AFTER REGISTRATION
        navigateTo('home');
        
      } catch (error) {
        console.error('Registration error:', error);
        Alert.alert('Registration Failed', error.message);
      } finally {
        setLoading(false);
      }
    };

  const getPasswordStrength = () => {
    const rules = validatePassword(password);
    const passed = Object.values(rules).filter(Boolean).length;
    const colors = ['#E53E3E', '#E6A817', '#E6A817', '#2F9E44'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return { strength: passed, color: colors[passed - 1] || '#E2DEFF', label: labels[passed - 1] || '' };
  };

  const strength = getPasswordStrength();

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
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="alex smith"
              placeholderTextColor="#7B7499"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors({});
              }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
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
                placeholderTextColor="#7B7499"
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
            
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(i => (
                    <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength.strength ? strength.color : '#E2DEFF' }]} />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#7B7499"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  if (errors.confirmPassword) setErrors({});
                }}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigateTo('login')}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  strengthContainer: {
    marginTop: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: '600',
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
});